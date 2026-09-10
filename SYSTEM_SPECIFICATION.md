# FC Pulse System Specification

Last reviewed: 10 September 2026

## 1. Purpose

FC Pulse is a mobile football application that lets users:

- Subscribe to supported football leagues.
- View matches for a selected date.
- Maintain favourite-team and hate-watch lists.
- Create manual match reminders.
- Receive automatic reminders when favourite or hated teams are playing.
- Delete their account and associated application data.

This document describes the architecture implemented so far, the reasons behind the main decisions, operational procedures, known trade-offs, and remaining work.

## 2. Main technologies

- Expo and React Native for the mobile application.
- Supabase Auth for user authentication.
- Supabase Postgres for persistent data.
- Supabase Edge Functions for privileged and scheduled server work.
- Supabase Cron (`pg_cron`/HTTP invocation) for scheduled jobs.
- TanStack Query for frontend server-state caching.
- AsyncStorage for selected persistent query caches and Zustand state.
- football-data.org v4 as the football data provider.
- Expo Push Service for push-notification delivery.

The football-data.org free plan is limited to 10 requests per minute. Server jobs and match requests must therefore avoid repeating identical provider requests per user.

## 3. High-level architecture

```text
football-data.org
        |
        v
Supabase Edge Functions ----> Supabase Postgres
        |                            |
        v                            v
Expo Push Service              React Native app
        |
        v
User's device
```

Public catalogue data is synchronized into Supabase. User-specific selections and notification records are stored separately. All football-data.org traffic, including interactive match requests, now passes through Supabase Edge Functions. Privileged operations use Edge Functions and the service-role key, which must never be included in the mobile application.

## 4. Football catalogue

### 4.1 Leagues

The previous static league file was replaced with a `public.leagues` table. Important fields include:

- Provider league ID and code.
- Name, logo, type, country, and country code.
- Current season ID, dates, and matchday.
- Visibility and display order controlled by the server.
- Team synchronization metadata.

An Edge Function synchronizes league metadata from football-data.org. Existing administrator-controlled values such as `display_order` are preserved during provider synchronization.

The frontend reads visible leagues from Supabase in server-defined display order.

### 4.2 Teams and league membership

Teams and league memberships are normalized:

```text
teams
  One row for each real team.

league_teams
  One row for a team's membership in a league and season.
```

A team such as Manchester United appears once in `teams`, but may have multiple `league_teams` rows:

```text
Manchester United -> Premier League -> season A
Manchester United -> Champions League -> season A
```

This avoids duplicating team details while correctly representing teams that participate in multiple competitions.

The `sync-league-teams` Edge Function:

1. Finds a league whose current season has not been synchronized.
2. Fetches the teams for that league and season.
3. Upserts team details into `teams`.
4. Replaces the relevant season membership rows in `league_teams`.
5. Records that the league season has been synchronized.

The database RPC `get_current_teams_for_leagues` returns distinct current teams for selected league codes. A team belonging to multiple selected leagues is returned once.

### 4.3 Catalogue synchronization schedules

Current schedules observed in Supabase:

- `sync-leagues`: weekly.
- `sync-league-teams`: daily, but it performs provider work only when a league season needs synchronization.

This keeps provider usage small while allowing competitions with different season dates to update independently.

## 5. Frontend fetching and caching

### 5.1 Leagues

- Query root: `['leagues']`.
- Stale time: seven days.
- Garbage-collection time: seven days.
- Persisted to AsyncStorage.
- Pull-to-refresh can request fresh data before the stale time expires.

### 5.2 Team catalogue

Team query keys include sorted league codes:

```text
['team-catalogue', 'PL']
['team-catalogue', 'CL']
['team-catalogue', 'CL', 'PL']
```

Consequences:

- Each league combination has an independent cache.
- League order does not create duplicate caches because codes are sorted.
- Returning to a previously used combination may reuse its seven-day cache.
- Pull-to-refresh can force a request.
- Team catalogue queries are persisted to AsyncStorage.

Only league and team catalogue queries are persisted. Match queries are deliberately excluded from persistent storage.

### 5.3 Matches

- Query root begins with `['matches']`.
- The selected date and sorted subscribed league codes are part of the key.
- Every date/league combination therefore has a distinct cache.
- Normal `staleTime` and `gcTime` are five minutes.
- Pull-to-refresh calls `refetch()` regardless of stale time.
- The frontend invokes the authenticated `get-matches` Supabase Edge Function; it no longer calls football-data.org directly.
- League codes are sent to the Edge Function as one array.
- The raw server response still passes through the existing `matchTransformer`, preserving the app's established match-card structure.
- TanStack Query polls every 60 seconds only after a returned match is identified as live (`IN_PLAY` or `PAUSED`). Polling stops when no returned match is live.
- The known transition delay from `SCHEDULED`/`TIMED` to the first observed live result is intentionally accepted to avoid unnecessary constant polling.

### 5.4 Shared server match cache

The `get-matches` Edge Function stores provider responses in `public.match_cache`:

- One row represents one match date.
- Each row contains matches for all currently visible leagues.
- Users requesting different league combinations share the same date cache.
- Before returning data, the Edge Function filters the shared result down to the requesting user's league codes.
- Only authenticated users may invoke the function.
- Requested competition codes are restricted to visible codes from `public.leagues`.

Cache durations are based on the returned data:

| Match data | Server cache duration |
| --- | --- |
| Contains `IN_PLAY` or `PAUSED` match | 1 minute |
| Today, with no observed live match | 5 minutes |
| Future date | 1 hour |
| Past date | 24 hours |

On a valid cache hit, football-data.org is not contacted. On a miss or expiry, the Edge Function makes one combined request for all visible leagues, updates the shared cache, and returns the requested subset. This changes 1,000 identical user requests within a cache window from roughly 1,000 provider calls to one provider call plus Supabase invocations.

The former frontend Axios football client was removed. `EXPO_PUBLIC_FOOTBALL_DATA_KEY` was removed from frontend configuration; the provider credential now remains only in Supabase Edge Function secrets as `FOOTBALL_DATA_API_KEY`.

## 6. User account deletion

The profile screen includes a danger section and confirmation dialog. Confirming deletion:

1. Calls the `delete-account` Edge Function.
2. Deletes the authenticated Supabase Auth user with server privileges.
3. Relies on `ON DELETE CASCADE` foreign keys to remove user-owned database rows.
4. Cancels scheduled local notifications.
5. Clears the user-specific Zustand/AsyncStorage state.
6. Signs the user out.

Every user-owned table, including `user_preferences`, must retain a foreign key to `auth.users(id)` with `ON DELETE CASCADE`. This should be rechecked whenever a new user-owned table is introduced.

## 7. Notification model

### 7.1 Alert sources

Alerts enter `match_alerts` through two paths:

```text
Automatic
daily-match-scan -> favourite/hated team match -> match_alerts

Manual
frontend match action -> match_alerts
```

The unique key `(user_id, match_id)` ensures that a user has at most one alert for a match.

Automatic inserts use conflict-ignore behaviour. This prevents the daily scan from overwriting an alert that the user configured manually.

Manual upserts explicitly set `origin = 'manual'`, restore `status = 'pending'` and `sent = false`, clear `sent_at` and `last_error`, and reset `attempt_count`. This allows a user to rearm a previously automatic, failed, or sent alert. The database trigger recalculates `send_at` from the selected reminder time.

### 7.2 Important `match_alerts` fields

- `user_id` and `match_id`: alert ownership and match identity.
- `home_team_id` and `away_team_id`: provider IDs used to find current team details.
- Team names and icons: match snapshots and display fallbacks.
- `match_start`: kickoff timestamp.
- `reminder_time`: minutes before kickoff.
- `send_at`: exact due timestamp.
- `origin`: `favorite`, `hate`, or `manual`.
- `status`: `pending`, `processing`, `sent`, or `failed`.
- `sent`: legacy compatibility flag, currently kept in sync with `status`.
- `sent_at`: successful send timestamp.
- `attempt_count`: number of claimed delivery attempts.
- `last_error`: latest delivery failure description.

A check constraint limits `status` to its four supported values.

### 7.3 Preparing an alert

The database trigger `prepare_match_alert_trigger` calls `prepare_match_alert()`:

- Before an insert.
- Before an update of `match_start` or `reminder_time`.

It calculates:

```text
send_at = match_start - reminder_time
```

When timing changes on an existing alert, it resets the delivery state to pending and clears old attempt/error information. Because this is attached to the table, it applies consistently to frontend, Edge Function, SQL, and any future alert writer.

### 7.4 Daily automatic scan

The daily scan now:

1. Loads reminder-enabled users.
2. Loads subscriptions, favourites, and hated teams outside the per-user loop.
3. Creates one unique list of league codes subscribed to by those users.
4. Makes one football-data.org request for that date and all needed competitions.
5. Reuses the returned matches when filtering for each user.
6. Prepares alerts in memory.
7. Inserts alerts in batches.
8. Ignores `(user_id, match_id)` conflicts so existing manual alerts win.

This changes provider usage from approximately one request per user per league to one request per daily scan.

The scan was tested with one user, two leagues, six returned matches, and two prepared alerts. Fresh rows correctly contained team IDs and calculated `send_at` values.

### 7.5 Claiming due alerts

The service-role-only RPC `claim_due_match_alerts(batch_size)`:

1. Finds pending alerts whose `send_at` has arrived.
2. Excludes matches that have started.
3. Excludes alerts that reached three attempts.
4. Locks up to 100 rows with `FOR UPDATE SKIP LOCKED`.
5. Marks them `processing` and increments `attempt_count`.
6. Returns them to the sender.

Row locking prevents overlapping cron invocations from claiming the same alert.

The partial index `match_alerts_pending_send_at_idx` contains `send_at` only for pending rows. It is smaller and better aligned with the sender query than the removed legacy `(sent, match_start, reminder_time)` index.

### 7.6 Sending push notifications

The deployed `send-alert-notifications` Edge Function (invoked by the
`send-push-notification` cron job):

1. Recovers old `processing` alerts after an interrupted execution.
2. Claims up to 100 due alerts through the RPC.
3. Fetches all relevant device tokens in one query.
4. Fetches team short names from `teams` in one query.
5. Builds titles such as `Man United vs Liverpool`.
6. Falls back to the snapshot full name when no short name is found.
7. Sends Expo messages in batches of at most 100.
8. Marks accepted alerts as sent and populates `sent_at`.
9. Returns temporary failures to pending.
10. Marks an alert failed after three attempts or when no device exists.

The sender is scheduled every five minutes. A reminder may consequently arrive up to approximately five minutes after its exact `send_at` value.

### 7.7 Confirmed notification tests

The following path was tested successfully on a real device:

- Daily scan created automatic alerts.
- Team IDs were saved.
- The trigger populated `send_at`.
- A due alert was claimed.
- The notification arrived on the phone.
- The database changed it to `sent` and populated `sent_at`.
- Running the sender again returned zero claimed alerts.
- A second alert was delivered automatically by the enabled cron job.

## 8. Cron jobs

Observed jobs include:

| Job | Schedule | Purpose |
| --- | --- | --- |
| Daily match scan | `1 0 * * *` GMT | Build automatic alerts for the day |
| Match-alert cleanup | `0 0 * * *` GMT | Remove old match alerts |
| Push sender | `*/5 * * * *` | Send due alerts |
| Cron-history cleanup | `0 12 * * *` GMT | Remove old `cron.job_run_details` rows |
| League sync | `0 2 * * 0` GMT | Refresh league/season metadata weekly |
| League-team sync | `0 3 * * *` GMT | Process league seasons needing team synchronization |
| Match-cache cleanup | Recommended daily | Remove cached dates older than 30 days |

Cron expressions are interpreted in GMT/UTC. During West Africa Time, `00:01 GMT` displays as `01:01` locally.

A successful `net.http_post` cron execution only proves that Postgres submitted the HTTP call. Edge Function logs and HTTP responses are needed to confirm application-level success. Scheduled Edge Function calls must include valid authentication headers.

## 9. Scalability decisions and trade-offs

### Decisions already made

- Normalize teams and league memberships to avoid team duplication.
- Keep large, slow-changing catalogue responses cached for seven days.
- Do not persist match caches because match data changes frequently.
- Use one combined match-provider request instead of one request per competition/user.
- Batch automatic alert inserts.
- Claim only 100 due alerts per sender execution.
- Query device tokens and team names in groups.
- Batch Expo messages in groups of 100.
- Use a partial due-alert index.
- Delete old alerts instead of retaining an unlimited notification history.
- Proxy all interactive match requests through an authenticated Edge Function so the provider key is not shipped in the app.
- Share one match cache per date across all users and league selections.
- Poll from the frontend only while an observed match is live.

### Known trade-offs

- Five-minute polling is simple and affordable but is not exact to the second.
- Live matches refresh at one-minute intervals. This is timely enough for the product while leaving room beneath the provider's 10-request-per-minute limit.
- Several simultaneous requests immediately after cache expiry could each miss before one finishes updating the cache. A database-backed refresh lock can be introduced later if real traffic produces a cache stampede.
- One `match_alerts` row represents delivery for all of a user's devices. If one device accepts a notification and another fails, the alert is considered sent to avoid duplicating it on the successful device. Per-device guaranteed delivery would require a separate delivery table.
- Expo accepting a push ticket does not guarantee that the device displayed it. Push receipts should be processed for stronger delivery monitoring and invalid-token cleanup.
- Automatic conflict-ignore protects manual settings but also means a later provider schedule change will not update an existing automatic alert. A conditional server-side upsert would be needed to update automatic alerts while still protecting manual ones.
- Fetching user configuration into one Edge Function is efficient for the current scale. At much larger scale, users should be processed in database-backed pages or jobs rather than all in one execution.
- Database migrations and deployed Edge Function sources are now stored in this repository. Cron schedules remain environment-specific and are managed separately so production URLs and credentials are not committed.

## 10. Completed checklist

### Catalogue and frontend

- [x] Move league catalogue to Supabase.
- [x] Normalize teams and league-season memberships.
- [x] Synchronize leagues and league teams with server jobs.
- [x] Read league and team lists from Supabase.
- [x] Use TanStack Query for leagues, teams, and matches.
- [x] Persist only league and team catalogue caches.
- [x] Give each match date/league combination its own cache key.
- [x] Support pull-to-refresh.
- [x] Add improved empty states.
- [x] Move frontend match requests behind the authenticated `get-matches` Edge Function.
- [x] Add a shared, date-based match cache covering all visible leagues.
- [x] Return only each request's selected league matches from the shared cache.
- [x] Remove the football-data.org key and direct API client from frontend code.
- [x] Add one-minute TanStack Query polling only for observed live matches.

### Account deletion

- [x] Add profile danger section and confirmation dialog.
- [x] Call the authenticated deletion Edge Function.
- [x] Clear local user state and notifications after deletion.
- [x] Add/fix cascading deletion for known user-owned tables.

### Notification database

- [x] Add `send_at`, `status`, `sent_at`, `attempt_count`, and `last_error`.
- [x] Add home and away team IDs.
- [x] Retain unique `(user_id, match_id)` protection.
- [x] Add the allowed-status constraint.
- [x] Add the alert-preparation trigger.
- [x] Add the partial pending-`send_at` index.
- [x] Add the safe claim RPC with row locking.

### Notification functions

- [x] Combine daily provider requests.
- [x] Batch automatic alert creation.
- [x] Protect existing manual alerts from the automatic scan.
- [x] Claim only due alerts.
- [x] Prevent duplicate claims.
- [x] Fetch devices and team short names in batches.
- [x] Batch Expo requests.
- [x] Record successes, retries, permanent failures, and errors.
- [x] Recover stale `processing` alerts.
- [x] Confirm real-device and cron delivery.

## 11. Remaining checklist

### Required follow-up

- [x] Verify that `clean_match_alert_table`, not `delete-job-run-details`, contains:

  ```sql
  delete from public.match_alerts
  where match_start < now() - interval '1 day';
  ```

- [x] Verify that the cron-history cleanup job still deletes only old rows from `cron.job_run_details`.
- [x] Make a manual alert upsert explicitly set `origin = 'manual'`, reset `status = 'pending'`, clear `sent_at`/`last_error`, and reset `attempt_count`. This covers rearming an existing automatic, failed, or previously sent alert even when its time values are unchanged.
- [x] Perform one final manual-alert create/update/remove test.
- [ ] Confirm a daily `clean-match-cache` cron job removes cache rows older than 30 days:

  ```sql
  delete from public.match_cache
  where match_date < current_date - interval '30 days';
  ```

- [ ] Standardize every football Edge Function on `FOOTBALL_DATA_API_KEY`. At the time of this review, `sync-leagues` and `sync-league-teams` still reference the older `FOOTBALL_DATA_KEY` name; both secrets must remain configured until those functions are updated and redeployed.

### Recommended reliability work

- [x] Store Edge Functions and SQL migrations in the repository rather than only in the Supabase dashboard.
- [ ] Process Expo push receipts.
- [ ] Remove or disable device tokens reported as `DeviceNotRegistered`.
- [ ] Add structured logs with job ID, counts, duration, and error category.
- [ ] Add monitoring for consecutive Edge Function or cron failures.
- [ ] Review all user-owned foreign keys after future schema additions.

### Future scaling work

- [x] Move general frontend match requests behind a shared server cache before user traffic makes provider limits a problem.
- [ ] Add a database refresh lock if concurrent cache misses begin producing duplicate provider requests.
- [ ] Page the daily scan by users if one execution approaches Edge Function runtime or memory limits.
- [ ] Add a per-device notification delivery table only if guaranteed multi-device delivery becomes a requirement.
- [ ] Replace conflict-ignore with a conditional database upsert if automatic alerts must follow provider kickoff changes without overwriting manual settings.

## 12. Operational test procedure

1. Disable the push-sender cron for a controlled test.
2. Run `daily-match-scan` manually.
3. Inspect new alerts and confirm team IDs, `send_at`, and pending status.
4. Make one alert due while leaving its `match_start` in the future.
5. Run the `send-alert-notifications` Edge Function once.
6. Confirm the phone received it.
7. Confirm `status = 'sent'`, `sent = true`, `sent_at` is populated, `attempt_count = 1`, and `last_error` is null.
8. Run the sender again and confirm zero alerts are claimed.
9. Re-enable the sender cron and verify automatic delivery.

Never use production user alerts for destructive tests unless the exact target rows have been identified first.

### Match-cache test

1. Sign in on a real device and open the Matches screen.
2. Confirm the request reaches `get-matches` and matches render using the existing UI structure.
3. Repeat the same date request inside its cache window and confirm the function reports `cached: true`.
4. During an observed live match, confirm the frontend invokes the query approximately once per minute.
5. Confirm different users or league selections for the same date reuse the same `match_cache` row.

## 13. Security rules

- Never include `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Never include `FOOTBALL_DATA_API_KEY` in frontend code; provider access is fully server-side.
- Never recreate the provider key with an `EXPO_PUBLIC_` prefix; Expo inlines those values into the readable client bundle.
- Store scheduled-job credentials in Supabase-managed secrets/Vault.
- Require authentication for privileged Edge Functions.
- Keep Row Level Security enabled for user-owned tables.
- Restrict the claim RPC to `service_role`.
- Treat Expo push tokens as sensitive identifiers and expose them only to their owner and trusted server code.

## 14. Source of truth

This repository now contains the frontend, an initial migration representing the remote database structure, and downloaded sources for the deployed Edge Functions, including `get-matches`. The migration includes tables, policies, triggers, RPCs, indexes, and constraints. The Expo TypeScript configuration excludes `supabase/functions` because those functions run on Deno and are checked/deployed separately from the React Native application.

Cron schedules remain managed in the Supabase environment and are documented here. Their generated statements were deliberately removed from the baseline migration because they contained production-specific URLs and an embedded credential. Future cron automation should read credentials from Supabase Vault rather than storing literal keys in migration SQL.

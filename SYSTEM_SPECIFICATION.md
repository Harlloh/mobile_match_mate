# FC Pulse System Specification

Last reviewed: 9 September 2026

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

Public catalogue data is synchronized into Supabase. User-specific selections and notification records are stored separately. Privileged operations use Edge Functions and the service-role key, which must never be included in the mobile application.

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
- Current `staleTime` and `gcTime` are five minutes.
- Pull-to-refresh calls `refetch()` regardless of stale time.
- Matches are requested for multiple competitions in one provider request.

The match request still goes directly from the application to the configured football API client. Moving general match traffic behind a cached backend remains a future scaling improvement.

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

The `send-push-notification` Edge Function:

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

### Known trade-offs

- Five-minute polling is simple and affordable but is not exact to the second.
- One `match_alerts` row represents delivery for all of a user's devices. If one device accepts a notification and another fails, the alert is considered sent to avoid duplicating it on the successful device. Per-device guaranteed delivery would require a separate delivery table.
- Expo accepting a push ticket does not guarantee that the device displayed it. Push receipts should be processed for stronger delivery monitoring and invalid-token cleanup.
- Automatic conflict-ignore protects manual settings but also means a later provider schedule change will not update an existing automatic alert. A conditional server-side upsert would be needed to update automatic alerts while still protecting manual ones.
- Fetching user configuration into one Edge Function is efficient for the current scale. At much larger scale, users should be processed in database-backed pages or jobs rather than all in one execution.
- Edge Functions and database routines created in the Supabase dashboard are not currently present in this repository. This creates deployment and recovery risk.

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
- [ ] Make a manual alert upsert explicitly set `origin = 'manual'`, reset `status = 'pending'`, clear `sent_at`/`last_error`, and reset `attempt_count`. This covers rearming an existing automatic, failed, or previously sent alert even when its time values are unchanged.
- [ ] Perform one final manual-alert create/update/remove test.

### Recommended reliability work

- [ ] Store Edge Functions and SQL migrations in the repository rather than only in the Supabase dashboard.
- [ ] Process Expo push receipts.
- [ ] Remove or disable device tokens reported as `DeviceNotRegistered`.
- [ ] Add structured logs with job ID, counts, duration, and error category.
- [ ] Add monitoring for consecutive Edge Function or cron failures.
- [ ] Review all user-owned foreign keys after future schema additions.

### Future scaling work

- [ ] Move general frontend match requests behind a server cache before user traffic makes provider limits a problem.
- [ ] Page the daily scan by users if one execution approaches Edge Function runtime or memory limits.
- [ ] Add a per-device notification delivery table only if guaranteed multi-device delivery becomes a requirement.
- [ ] Replace conflict-ignore with a conditional database upsert if automatic alerts must follow provider kickoff changes without overwriting manual settings.

## 12. Operational test procedure

1. Disable the push-sender cron for a controlled test.
2. Run `daily-match-scan` manually.
3. Inspect new alerts and confirm team IDs, `send_at`, and pending status.
4. Make one alert due while leaving its `match_start` in the future.
5. Run `send-push-notification` once.
6. Confirm the phone received it.
7. Confirm `status = 'sent'`, `sent = true`, `sent_at` is populated, `attempt_count = 1`, and `last_error` is null.
8. Run the sender again and confirm zero alerts are claimed.
9. Re-enable the sender cron and verify automatic delivery.

Never use production user alerts for destructive tests unless the exact target rows have been identified first.

## 13. Security rules

- Never include `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Never include `FOOTBALL_DATA_API_KEY` in frontend code once provider access is fully server-side.
- Store scheduled-job credentials in Supabase-managed secrets/Vault.
- Require authentication for privileged Edge Functions.
- Keep Row Level Security enabled for user-owned tables.
- Restrict the claim RPC to `service_role`.
- Treat Expo push tokens as sensitive identifiers and expose them only to their owner and trusted server code.

## 14. Source-of-truth warning

This repository contains the frontend changes, including manual-alert team IDs. The deployed Edge Functions, cron definitions, triggers, RPCs, indexes, and constraints were created or edited in Supabase and could not all be inspected from the local repository during this review.

The next infrastructure improvement should be exporting those definitions into version-controlled Supabase migrations and function directories. That will make the documented system reproducible and prevent the deployed backend from drifting away from the codebase.

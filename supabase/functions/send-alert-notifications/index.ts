import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MAX_ATTEMPTS = 3;
const CLAIM_LIMIT = 100;
const EXPO_BATCH_SIZE = 100;

type MatchAlert = {
  id: string;
  user_id: string;
  match_id: number;

  home_team_id: number | null;
  away_team_id: number | null;

  home_team: string;
  away_team: string;

  origin: string;
  attempt_count: number;
};

type Device = {
  user_id: string;
  expo_push_token: string;
};

type MessageReference = {
  alertId: string;
  message: {
    to: string;
    sound: "default";
    title: string;
    body: string;
    data: {
      match_id: number;
    };
  };
};

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getNotificationBody(origin: string): string {
  if (origin === "favorite") {
    return "⚽ Your boys are taking the pitch soon! Don’t miss the action!";
  }

  if (origin === "hate") {
    return "😒 Your rival is playing soon… might be worth keeping an eye on.";
  }

  return "⏰ Match reminder! Kickoff is almost here.";
}

async function updateAlerts(
  alertIds: string[],
  changes: Record<string, unknown>,
) {
  if (alertIds.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("match_alerts")
    .update(changes)
    .in("id", alertIds);

  if (error) {
    throw error;
  }
}

async function recoverStuckAlerts() {
  const tenMinutesAgo = new Date(
    Date.now() - 10 * 60 * 1000,
  ).toISOString();

  const now = new Date().toISOString();

  const { error: retryError } = await supabase
    .from("match_alerts")
    .update({
      status: "pending",
      last_error: "Previous notification attempt did not finish",
    })
    .eq("status", "processing")
    .lt("attempt_count", MAX_ATTEMPTS)
    .lt("updated_at", tenMinutesAgo)
    .gt("match_start", now);

  if (retryError) {
    throw retryError;
  }

  const { error: failedError } = await supabase
    .from("match_alerts")
    .update({
      status: "failed",
      last_error: "Maximum notification attempts reached",
    })
    .eq("status", "processing")
    .gte("attempt_count", MAX_ATTEMPTS)
    .lt("updated_at", tenMinutesAgo);

  if (failedError) {
    throw failedError;
  }
}

serve(async () => {
  console.log("---- Sending notifications ----");

  let claimedAlerts: MatchAlert[] = [];
  const finalizedAlertIds = new Set<string>();

  try {
    // Recover alerts left processing after a previous crash.
    await recoverStuckAlerts();

    // Claim due alerts safely.
    const { data, error: claimError } = await supabase.rpc(
      "claim_due_match_alerts",
      {
        batch_size: CLAIM_LIMIT,
      },
    );

    if (claimError) {
      throw claimError;
    }

    claimedAlerts = (data ?? []) as MatchAlert[];

    if (claimedAlerts.length === 0) {
      return Response.json({
        success: true,
        claimed: 0,
        sent: 0,
        message: "No notifications are due",
      });
    }

    // Get all users and teams needed by this batch.
    const userIds = [
      ...new Set(claimedAlerts.map((alert) => alert.user_id)),
    ];

    const teamIds = [
      ...new Set(
        claimedAlerts.flatMap((alert) => [
          alert.home_team_id,
          alert.away_team_id,
        ]),
      ),
    ].filter((id): id is number => typeof id === "number");

    // Fetch devices and short team names in parallel.
    const [devicesResult, teamsResult] = await Promise.all([
      supabase
        .from("user_devices")
        .select("user_id, expo_push_token")
        .in("user_id", userIds),

      teamIds.length > 0
        ? supabase
          .from("teams")
          .select("id, short_name")
          .in("id", teamIds)
        : Promise.resolve({
          data: [],
          error: null,
        }),
    ]);

    if (devicesResult.error) {
      throw devicesResult.error;
    }

    if (teamsResult.error) {
      throw teamsResult.error;
    }

    // Create team ID -> short name lookup.
    const shortNameByTeamId = new Map<number, string>();

    for (const team of teamsResult.data ?? []) {
      if (team.short_name) {
        shortNameByTeamId.set(Number(team.id), team.short_name);
      }
    }

    // Create user ID -> devices lookup.
    const devicesByUser = new Map<string, Device[]>();

    for (const device of devicesResult.data ?? []) {
      if (
        !device.expo_push_token ||
        typeof device.expo_push_token !== "string"
      ) {
        continue;
      }

      const devices = devicesByUser.get(device.user_id) ?? [];

      devices.push({
        user_id: device.user_id,
        expo_push_token: device.expo_push_token,
      });

      devicesByUser.set(device.user_id, devices);
    }

    // Build messages.
    const messageReferences: MessageReference[] = [];
    const alertsWithoutDevices: string[] = [];

    for (const alert of claimedAlerts) {
      const devices = devicesByUser.get(alert.user_id) ?? [];

      if (devices.length === 0) {
        alertsWithoutDevices.push(alert.id);
        continue;
      }

      const homeName = alert.home_team_id
        ? shortNameByTeamId.get(alert.home_team_id) ?? alert.home_team
        : alert.home_team;

      const awayName = alert.away_team_id
        ? shortNameByTeamId.get(alert.away_team_id) ?? alert.away_team
        : alert.away_team;

      for (const device of devices) {
        messageReferences.push({
          alertId: alert.id,
          message: {
            to: device.expo_push_token,
            sound: "default",
            title: `${homeName} vs ${awayName}`,
            body: getNotificationBody(alert.origin),
            data: {
              match_id: alert.match_id,
            },
          },
        });
      }
    }

    // Alerts without devices cannot be sent.
    await updateAlerts(alertsWithoutDevices, {
      status: "failed",
      sent: false,
      last_error: "No registered push notification device",
    });

    for (const alertId of alertsWithoutDevices) {
      finalizedAlertIds.add(alertId);
    }

    const successfulAlertIds = new Set<string>();
    const unsuccessfulAlertIds = new Set<string>();

    // Send no more than 100 messages per Expo request.
    for (
      const messageBatch of chunkArray(
        messageReferences,
        EXPO_BATCH_SIZE,
      )
    ) {
      const expoResponse = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          messageBatch.map((item) => item.message),
        ),
      });

      if (!expoResponse.ok) {
        const errorBody = await expoResponse.text();

        console.error(
          `Expo returned ${expoResponse.status}: ${errorBody}`,
        );

        for (const item of messageBatch) {
          unsuccessfulAlertIds.add(item.alertId);
        }

        continue;
      }

      const expoResult = await expoResponse.json();

      const tickets = Array.isArray(expoResult.data)
        ? expoResult.data
        : [expoResult.data];

      messageBatch.forEach((item, index) => {
        const ticket = tickets[index];

        if (ticket?.status === "ok") {
          successfulAlertIds.add(item.alertId);
        } else {
          unsuccessfulAlertIds.add(item.alertId);

          console.error("Expo rejected notification", {
            alertId: item.alertId,
            ticket,
          });
        }
      });
    }

    // If at least one device accepted the notification,
    // treat that alert as successfully sent.
    for (const alertId of successfulAlertIds) {
      unsuccessfulAlertIds.delete(alertId);
    }

    const sentIds = [...successfulAlertIds];

    await updateAlerts(sentIds, {
      status: "sent",
      sent: true,
      sent_at: new Date().toISOString(),
      last_error: null,
    });

    for (const alertId of sentIds) {
      finalizedAlertIds.add(alertId);
    }

    const unsuccessfulAlerts = claimedAlerts.filter((alert) =>
      unsuccessfulAlertIds.has(alert.id)
    );

    const retryIds = unsuccessfulAlerts
      .filter((alert) => alert.attempt_count < MAX_ATTEMPTS)
      .map((alert) => alert.id);

    const permanentlyFailedIds = unsuccessfulAlerts
      .filter((alert) => alert.attempt_count >= MAX_ATTEMPTS)
      .map((alert) => alert.id);

    await updateAlerts(retryIds, {
      status: "pending",
      sent: false,
      last_error: "Expo did not accept the notification",
    });

    await updateAlerts(permanentlyFailedIds, {
      status: "failed",
      sent: false,
      last_error: "Expo notification failed after 3 attempts",
    });

    for (const alertId of [...retryIds, ...permanentlyFailedIds]) {
      finalizedAlertIds.add(alertId);
    }

    return Response.json({
      success: true,
      claimed: claimedAlerts.length,
      messages: messageReferences.length,
      sent: sentIds.length,
      retrying: retryIds.length,
      failed:
        permanentlyFailedIds.length + alertsWithoutDevices.length,
    });
  } catch (error) {
    console.error("Notification function failed:", error);

    const unfinishedAlerts = claimedAlerts.filter(
      (alert) => !finalizedAlertIds.has(alert.id),
    );

    const retryIds = unfinishedAlerts
      .filter((alert) => alert.attempt_count < MAX_ATTEMPTS)
      .map((alert) => alert.id);

    const failedIds = unfinishedAlerts
      .filter((alert) => alert.attempt_count >= MAX_ATTEMPTS)
      .map((alert) => alert.id);

    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown notification error";

    try {
      await updateAlerts(retryIds, {
        status: "pending",
        sent: false,
        last_error: errorMessage,
      });

      await updateAlerts(failedIds, {
        status: "failed",
        sent: false,
        last_error: errorMessage,
      });
    } catch (updateError) {
      console.error("Could not release claimed alerts:", updateError);
    }

    return Response.json(
      {
        success: false,
        error: errorMessage,
      },
      {
        status: 500,
      },
    );
  }
});
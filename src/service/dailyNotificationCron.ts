import cron from "node-cron";
import { getMessaging } from "firebase-admin/messaging";
import User from "../models/user";
import Notification from "../models/notification";
import NotificationSettings from "../models/notificationSettings";

// ─── Config ──────────────────────────────────────────────────────────────────
// Runs every day at 9:00 AM server time.
// Adjust the cron expression to change the schedule:
//   "0 9 * * *"  → 09:00 every day
//   "0 8 * * *"  → 08:00 every day
const DAILY_CRON_SCHEDULE = process.env.DAILY_NOTIFICATION_CRON || "0 9 * * *";

const NOTIFICATION_TITLE = "HI There! 👋";
const NOTIFICATION_DESCRIPTION =
  "Check out what's new in the app today. Explore fresh products, upcoming events, and exclusive deals just for you!";
const NOTIFICATION_TYPE = "promotion";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true when the user's notification settings allow promotional
 * push notifications (or when no settings document exists yet — defaults to on).
 */
async function isPushAllowed(userId: string): Promise<boolean> {
  const settings = await NotificationSettings.findOne({ user: userId });
  // If the user has no settings document we treat it as "all enabled".
  if (!settings) return true;
  return settings.pushNotification?.promotion !== false;
}

// ─── Core job ────────────────────────────────────────────────────────────────

export async function sendDailyNotificationsToAllUsers(): Promise<void> {
  console.log("[DailyNotificationCron] Starting daily push notification job…");

  // Fetch only active users who have registered an FCM token.
  const users = await User.find({
    FCMToken: { $exists: true, $ne: "" },
    status: "Active",
  }).select("_id FCMToken name");

  if (!users.length) {
    console.log("[DailyNotificationCron] No eligible users found. Exiting.");
    return;
  }

  console.log(
    `[DailyNotificationCron] Found ${users.length} active users with FCM tokens.`,
  );

  const fcmTokens: string[] = [];
  const eligibleUserIds: string[] = [];

  // Filter users who have push notifications enabled.
  await Promise.all(
    users.map(async (user: any) => {
      const allowed = await isPushAllowed(user._id.toString());
      if (allowed) {
        fcmTokens.push(user.FCMToken);
        eligibleUserIds.push(user._id.toString());
      }
    }),
  );

  console.log(
    `[DailyNotificationCron] ${eligibleUserIds.length} users have push notifications enabled.`,
  );

  if (!eligibleUserIds.length) {
    console.log(
      "[DailyNotificationCron] No users opted in to push notifications. Exiting.",
    );
    return;
  }

  // ── 1. Save Notification records in the DB ──────────────────────────────
  const notificationDocs = eligibleUserIds.map((userId) => ({
    title: NOTIFICATION_TITLE,
    description: NOTIFICATION_DESCRIPTION,
    user: userId,
    isRead: false,
    type: NOTIFICATION_TYPE,
  }));

  try {
    await Notification.insertMany(notificationDocs, { ordered: false });
    console.log(
      `[DailyNotificationCron] Saved ${notificationDocs.length} notification records.`,
    );
  } catch (err) {
    console.error(
      "[DailyNotificationCron] Error saving notification records:",
      err,
    );
  }

  // ── 2. Send FCM multicast push notification ─────────────────────────────
  // FCM sendEachForMulticast supports up to 500 tokens per call.
  const CHUNK_SIZE = 500;
  for (let i = 0; i < fcmTokens.length; i += CHUNK_SIZE) {
    const chunk = fcmTokens.slice(i, i + CHUNK_SIZE);

    const multicastMessage = {
      tokens: chunk,
      data: {
        title: NOTIFICATION_TITLE,
        description: NOTIFICATION_DESCRIPTION,
        imageURL: "",
        type: NOTIFICATION_TYPE,
      },
      notification: {
        title: NOTIFICATION_TITLE,
        body: NOTIFICATION_DESCRIPTION,
      },
    };

    try {
      const response =
        await getMessaging().sendEachForMulticast(multicastMessage);
      console.log(
        `[DailyNotificationCron] Chunk ${Math.floor(i / CHUNK_SIZE) + 1}: ` +
          `${response.successCount} sent, ${response.failureCount} failed.`,
      );

      // Log individual failures for debugging.
      if (response.failureCount > 0) {
        response.responses.forEach((res, idx) => {
          if (!res.success) {
            console.warn(
              `[DailyNotificationCron] Token ${chunk[idx]} failed:`,
              res.error?.message,
            );
          }
        });
      }
    } catch (err) {
      console.error(
        `[DailyNotificationCron] Error sending multicast chunk ${Math.floor(i / CHUNK_SIZE) + 1}:`,
        err,
      );
    }
  }

  console.log("[DailyNotificationCron] Daily notification job complete.");
}

// ─── Cron registration ───────────────────────────────────────────────────────

export function startDailyNotificationCron(): void {
  if (!cron.validate(DAILY_CRON_SCHEDULE)) {
    console.error(
      `[DailyNotificationCron] Invalid cron expression: "${DAILY_CRON_SCHEDULE}". Cron NOT started.`,
    );
    return;
  }

  cron.schedule(DAILY_CRON_SCHEDULE, async () => {
    try {
      await sendDailyNotificationsToAllUsers();
    } catch (err) {
      console.error(
        "[DailyNotificationCron] Unhandled error in cron job:",
        err,
      );
    }
  });

  console.log(
    `[DailyNotificationCron] Scheduled daily notifications → "${DAILY_CRON_SCHEDULE}"`,
  );
}

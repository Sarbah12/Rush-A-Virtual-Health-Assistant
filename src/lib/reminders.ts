import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { isActive, localDate, type Medicine } from './meds';

// Dose reminders are local notifications scheduled on the phone, so they work
// without internet and nothing is sent to a server.

export const remindersSupported = Platform.OS !== 'web';

const CHANNEL = 'medicines';
let configured = false;

function configure() {
  if (configured || !remindersSupported) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Asks for notification permission if needed. Returns whether reminders can be shown. */
export async function ensurePermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  configure();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Medicine reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Rebuilds every medicine reminder from scratch. Simple and safe: the
 * schedule always matches what is saved, including after edits and deletes.
 */
export async function syncReminders(meds: Medicine[]): Promise<void> {
  if (!remindersSupported) return;
  configure();
  await Notifications.cancelAllScheduledNotificationsAsync();
  const today = localDate(new Date());
  const wanted = meds.filter((m) => m.remind && isActive(m, today));
  if (wanted.length === 0) return;
  if (!(await ensurePermission())) return;
  for (const med of wanted) {
    for (const time of med.times) {
      const [hour, minute] = time.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${med.name}`,
          body: med.dose ? `Take ${med.dose}. Open Rush to mark it taken.` : 'Open Rush to mark it taken.',
          data: { medId: med.id, time },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL },
      });
    }
  }
}

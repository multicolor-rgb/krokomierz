import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from './nativeSteps';
import { translate } from './i18n';
import { getKV, setKV } from './db';
import type { Lang, NotificationSettings } from './types';

export async function notificationPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (isNative) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted' ? 'granted' : status.display === 'denied' ? 'denied' : 'default';
    } catch {
      return 'unsupported';
    }
  }
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isNative) {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch {
      return false;
    }
  }
  if (typeof Notification === 'undefined') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

async function ensureChannel(lang: Lang) {
  if (!isNative) return;
  try {
    await LocalNotifications.createChannel({
      id: 'steps',
      name: translate(lang, 'notifChannel'),
      description: translate(lang, 'notifChannel'),
      importance: 3,
      visibility: 1,
      vibration: true,
    });
  } catch {
    /* kanał już istnieje */
  }
}

/** Planuje natywne przypomnienia (APK) — działają także przy zamkniętej aplikacji. */
export async function scheduleNativeReminders(
  settings: NotificationSettings,
  lang: Lang,
  goal: number,
): Promise<void> {
  if (!isNative) return;
  await ensureChannel(lang);
  try {
    await LocalNotifications.cancel({
      notifications: [200, 201, 202, 203, 204, 205, 206].map((id) => ({ id })),
    });
  } catch {
    /* brak zaplanowanych */
  }
  if (!settings.enabled) return;

  const [hour, minute] = settings.time.split(':').map(Number);
  const body = translate(lang, 'reminderBody', { n: '—', goal });
  const notifications = settings.days.map((day) => ({
    id: 200 + day,
    title: translate(lang, 'notifTitle'),
    body,
    channelId: 'steps',
    smallIcon: 'ic_stat_steps',
    iconColor: '#C6FF3D',
    schedule: {
      on: { weekday: day + 1, hour, minute },
      repeats: true,
      allowWhileIdle: true,
    },
  }));
  if (notifications.length) {
    await LocalNotifications.schedule({ notifications });
  }
}

/** Natywna wersja przypomnienia sprawdzana przy otwarciu aplikacji (web/PWA). */
export async function maybeShowWebReminder(
  lang: Lang,
  settings: NotificationSettings,
  steps: number,
  goal: number,
): Promise<void> {
  if (isNative || !settings.enabled) return;
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  if (!settings.days.includes(new Date().getDay())) return;

  const [hour, minute] = settings.time.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (now < target) return;

  const today = now.toISOString().slice(0, 10);
  const last = await getKV<string>('lastReminder', '');
  if (last === today) return;

  const title = translate(lang, 'notifTitle');
  const body =
    steps >= goal
      ? translate(lang, 'reminderBodyDone')
      : translate(lang, 'reminderBody', { n: steps.toLocaleString(lang === 'pl' ? 'pl-PL' : 'en-US'), goal });

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'krokomierz-reminder',
        data: { url: '/app/' },
      });
    } else {
      new Notification(title, { body, icon: '/icons/icon-192.png' });
    }
    await setKV('lastReminder', today);
  } catch {
    /* powiadomienia niedostępne */
  }
}

export async function sendTestNotification(lang: Lang): Promise<boolean> {
  const ok = await requestNotificationPermission();
  if (!ok) return false;
  const title = translate(lang, 'notifTitle');
  const body = translate(lang, 'testNotifBody');
  try {
    if (isNative) {
      await ensureChannel(lang);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title,
            body,
            channelId: 'steps',
            smallIcon: 'ic_stat_steps',
            iconColor: '#C6FF3D',
            schedule: { at: new Date(Date.now() + 2000) },
          },
        ],
      });
    } else {
      const registration = await navigator.serviceWorker?.ready;
      if (registration) {
        await registration.showNotification(title, {
          body,
          icon: '/icons/icon-192.png',
          tag: 'krokomierz-test',
        });
      } else {
        new Notification(title, { body, icon: '/icons/icon-192.png' });
      }
    }
    return true;
  } catch {
    return false;
  }
}

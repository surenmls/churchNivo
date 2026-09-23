import { processEventReminders, processWeeklyDigests } from './notifications.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

export function startNotificationScheduler() {
  console.log('[scheduler] Notification scheduler started');

  setTimeout(async () => {
    try {
      await processEventReminders();
    } catch (err) {
      console.error('[scheduler] Event reminder error:', err.message);
    }
  }, 10000);

  setInterval(async () => {
    try {
      await processEventReminders();
    } catch (err) {
      console.error('[scheduler] Event reminder error:', err.message);
    }
  }, FIFTEEN_MINUTES);

  setInterval(async () => {
    try {
      await processWeeklyDigests();
    } catch (err) {
      console.error('[scheduler] Weekly digest error:', err.message);
    }
  }, ONE_HOUR);
}

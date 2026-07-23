import cron from 'node-cron';
import { prisma } from '../config/database';
import { emailService } from './email.service';

export function startCronJobs() {
  console.log('[CronService] Initializing cron jobs...');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHour = now.getUTCHours().toString().padStart(2, '0');
      const currentMinute = now.getUTCMinutes().toString().padStart(2, '0');
      const timeString = `${currentHour}:${currentMinute}`;

      const reminders = await prisma.reminder.findMany({
        where: {
          enabled: true,
          time: timeString,
        },
        include: {
          user: {
            include: { settings: true },
          },
          habit: true,
        },
      });

      for (const reminder of reminders) {
        if (!reminder.user.settings?.reminderEnabled) continue;
        if (reminder.habit.slug === 'dua' && !reminder.user.settings?.duaReminder) continue;
        if (reminder.habit.slug === 'quran' && !reminder.user.settings?.quranReminder) continue;

        await emailService.sendReminder(reminder.user.email, reminder.user.name, reminder.habit.label);
      }
    } catch (error) {
      console.error('[CronService] Error running reminder cron job:', error);
    }
  });
}

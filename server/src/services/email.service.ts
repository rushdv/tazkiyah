import nodemailer from 'nodemailer';
import { config } from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const emailService = {
  async sendReminder(email: string, name: string, habitName: string) {
    if (!config.smtp.host || !config.smtp.user) {
      console.warn('[EmailService] SMTP not configured. Skipping email to', email);
      return;
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Tazkiyah Reminder</h2>
        <p>As-salamu alaykum ${name},</p>
        <p>This is a gentle reminder to complete your daily habit: <strong>${habitName}</strong>.</p>
        <p>May Allah accept your efforts.</p>
        <br/>
        <p>Best regards,</p>
        <p>Tazkiyah Team</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: \`"Tazkiyah" <\${config.smtp.from}>\`,
        to: email,
        subject: \`Reminder: \${habitName}\`,
        html,
      });
      console.log(\`[EmailService] Sent reminder to \${email} for \${habitName}\`);
    } catch (error) {
      console.error('[EmailService] Failed to send email:', error);
    }
  },
};

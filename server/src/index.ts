import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { startCronJobs } from './services/cron.service';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.env === 'development' || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, config.cors.origin);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

if (config.env === 'production') {
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: { success: false, message: 'Too many requests, please try again later.' },
    }),
  );
}

app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api/v1', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import { DEFAULT_HABITS } from './config/habits';
import { prisma } from './config/database';
import { execSync } from 'child_process';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/diag', async (_req, res) => {
  try {
    const userCount = await prisma.user.count();
    const habitCount = await prisma.habit.count();
    res.json({ status: 'ok', userCount, habitCount });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err?.message, code: err?.code });
  }
});

app.get('/api/v1/init-db', async (_req, res) => {
  try {
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
    });
    await ensureDefaultData();
    res.json({ success: true, message: 'Database pushed and seeded successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

async function ensureDatabaseSchema() {
  try {
    await prisma.user.count();
    console.log('[Init] Database tables exist.');
  } catch (err: any) {
    console.log('[Init] Tables missing in database. Running prisma db push...');
    try {
      execSync('npx prisma db push --accept-data-loss', {
        stdio: 'inherit',
        env: process.env,
      });
      console.log('[Init] Database schema created successfully!');
    } catch (pushErr) {
      console.error('[Init] Failed to push database schema:', pushErr);
    }
  }
}

async function ensureDefaultData() {
  try {
    const habitCount = await prisma.habit.count();
    if (habitCount === 0) {
      console.log('[Init] Seeding default habits...');
      for (const h of DEFAULT_HABITS) {
        await prisma.habit.upsert({
          where: { slug: h.slug },
          update: {
            label: h.label,
            icon: h.icon,
            description: h.description,
            targetMinutes: h.targetMinutes,
            sortOrder: h.sortOrder,
          },
          create: {
            slug: h.slug,
            label: h.label,
            icon: h.icon,
            description: h.description,
            targetMinutes: h.targetMinutes,
            sortOrder: h.sortOrder,
          },
        });
      }

      const achievements = [
        { slug: '7_day_streak', title: '7-Day Streak', description: 'Complete all habits for 7 consecutive days', icon: 'badge', targetValue: 7 },
        { slug: '30_day_streak', title: '30-Day Streak', description: 'Complete all habits for 30 consecutive days', icon: 'badge', targetValue: 30 },
        { slug: '100_day_streak', title: '100-Day Streak', description: 'Complete all habits for 100 consecutive days', icon: 'badge', targetValue: 100 },
        { slug: 'perfect_week', title: 'Perfect Week', description: 'Complete all habits for an entire week', icon: 'star', targetValue: 7 },
        { slug: 'perfect_month', title: 'Perfect Month', description: 'Complete all habits for an entire month', icon: 'trophy', targetValue: 30 },
      ];

      for (const a of achievements) {
        await prisma.achievement.upsert({
          where: { slug: a.slug },
          update: a,
          create: a,
        });
      }
      console.log('[Init] Default habits and achievements ready!');
    }

    const demoUser = await prisma.user.findUnique({ where: { email: 'testuser@example.com' } });
    if (!demoUser) {
      console.log('[Init] Creating demo user (testuser@example.com)...');
      const bcrypt = (await import('bcryptjs')).default;
      const passwordHash = await bcrypt.hash('Password123!', 12);
      const user = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          name: 'Demo User',
          passwordHash,
        },
      });
      await prisma.streak.create({
        data: { userId: user.id, currentStreak: 3, longestStreak: 7, lastActivityDate: new Date() },
      });
      await prisma.setting.create({
        data: { userId: user.id },
      });
      console.log('[Init] Demo user created successfully!');
    }
  } catch (err) {
    console.error('[Init] Error checking default data:', err);
  }
}

async function start() {
  await connectDatabase();
  await ensureDatabaseSchema();
  await ensureDefaultData();
  startCronJobs();
  
  app.listen(config.port, () => {
    console.log(`[Server] Running on port ${config.port} in ${config.env} mode`);
    console.log(`[Docs] API documentation available at http://localhost:${config.port}/api-docs`);
  });
}

start();

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default app;

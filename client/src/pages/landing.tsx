import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Dumbbell,
  GraduationCap,
  Sparkles,
  BarChart3,
  Shield,
  Moon,
  Sun,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Daily Worship', description: 'Track Quran reading, azkar, and duas' },
  { icon: BarChart3, title: 'Beautiful Analytics', description: 'Visualize your spiritual progress' },
  { icon: Shield, title: 'Streak Tracking', description: 'Build consistency with streaks' },
  { icon: Sparkles, title: 'Daily Inspiration', description: 'Ayahs and hadiths to motivate you' },
];

const habits = [
  { icon: BookOpen, label: 'Morning & Evening Azkar' },
  { icon: Sparkles, label: 'Dua' },
  { icon: BookOpen, label: 'Quran (30 min)' },
  { icon: Dumbbell, label: 'Exercise (25 min)' },
  { icon: GraduationCap, label: 'Islamic Learning (30 min)' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-lg font-semibold">Tazkiyah</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Moon className="mr-2 h-4 w-4" />
              Islamic Habit Tracker
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Build Better Habits.
              <br />
              <span className="text-primary">Strengthen Your Deen.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Tazkiyah helps Muslims consistently maintain their daily worship, build positive habits,
              and monitor their spiritual progress through beautiful analytics and weekly reports.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link to="/auth/register">
                <Button size="lg" className="gap-2">
                  Start Your Journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-16 max-w-2xl"
          >
            <div className="glass-card p-8">
              <h3 className="mb-6 text-center text-lg font-semibold">Track These Habits</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {habits.map((habit) => (
                  <div key={habit.label} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <habit.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm">{habit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <h2 className="text-center text-3xl font-bold">Why Tazkiyah?</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Ready to Transform Your Habits?</h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of Muslims using Tazkiyah to strengthen their deen.
            </p>
            <Link to="/auth/register">
              <Button size="lg" className="mt-8 gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Tazkiyah. Built with faith.</p>
        </div>
      </footer>
    </div>
  );
}

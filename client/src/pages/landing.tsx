import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Dumbbell,
  GraduationCap,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Moon,
  ArrowRight,
  FileText,
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Daily Worship & Learning', description: 'Track Quran reading, morning/evening azkar, dua, and Islamic learning.' },
  { icon: BarChart3, title: 'Month-over-Month Growth', description: 'Visualize trends, duration totals, and consistency with interactive analytics.' },
  { icon: FileText, title: 'Real PDF Reports', description: 'Export 5-page PDF progress reports for monthly reflections.' },
  { icon: ShieldCheck, title: 'Private & Trustworthy', description: 'Your personal reflections and data belong solely to you.' },
];

const habits = [
  { icon: BookOpen, label: 'Morning & Evening Azkar', type: 'Binary Habit' },
  { icon: Sparkles, label: 'Dua & Supplication', type: 'Binary Habit' },
  { icon: BookOpen, label: 'Quran Reading (30 min)', type: 'Duration Goal' },
  { icon: Dumbbell, label: 'Physical Exercise (25 min)', type: 'Duration Goal' },
  { icon: GraduationCap, label: 'Islamic Learning (30 min)', type: 'Duration Goal' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              T
            </div>
            <span className="text-xl font-bold tracking-tight">Tazkiyah</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm" className="text-xs">Sign In</Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-border/40">
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
              <Moon className="h-3.5 w-3.5" />
              Build Better Habits. Strengthen Your Deen.
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              A calm space for worship, learning, and daily consistency.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tazkiyah helps you build sustainable habits in prayer, Quran, exercise, and knowledge. Reflect on your daily progress without feeling judged.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link to="/auth/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 px-6">
                  Start Your Journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline" className="px-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Core Habits Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-16 max-w-3xl"
          >
            <div className="glass-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Core Daily Habits</h3>
                <span className="text-xs text-accent font-semibold">Flexible Tracking</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {habits.map((habit) => (
                  <div key={habit.label} className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60">
                    <div className="flex items-center gap-3">
                      <habit.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-semibold">{habit.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{habit.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/20">
        <div className="container space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Designed for Meaningful Progress</h2>
            <p className="text-xs text-muted-foreground">
              Built with care to support your spiritual growth, clarity, and personal consistency.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center space-y-3"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-base">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 border-t border-border/60">
        <div className="container">
          <div className="mx-auto max-w-xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Begin Your Journey Today</h2>
            <p className="text-xs text-muted-foreground">
              Small consistent steps, every single day.
            </p>
            <Link to="/auth/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 px-8">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Tazkiyah. Build Better Habits. Strengthen Your Deen.</p>
      </footer>
    </div>
  );
}

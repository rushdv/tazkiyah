import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Dumbbell, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default initial configuration
  const [quranTarget, setQuranTarget] = useState(30);
  const [exerciseTarget, setExerciseTarget] = useState(25);
  const [learningTarget, setLearningTarget] = useState(30);

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');

  async function handleFinishOnboarding() {
    try {
      setIsSubmitting(true);
      await api.patch('/auth/settings', {
        reminderEnabled,
        duaReminder: true,
        quranReminder: true,
        dailyReflectionReminder: true,
      });

      toast.success('Welcome to Tazkiyah!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to complete onboarding setup');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-accent' : s < step ? 'w-4 bg-primary' : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card text-center p-8 space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold tracking-widest text-accent">TAZKIYAH</span>
                  <h1 className="text-2xl font-bold tracking-tight">Build Better Habits.<br />Strengthen Your Deen.</h1>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    A calm, intentional space to track worship, Quran reading, learning, exercise, and daily spiritual growth.
                  </p>
                </div>

                <Button onClick={() => setStep(2)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2">
                  Start Onboarding Setup <ArrowRight className="h-4 w-4" />
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Default Worship & Development Habits</h2>
                  <p className="text-xs text-muted-foreground">
                    Tazkiyah includes 6 core foundational habits pre-configured for your daily routine.
                  </p>
                </div>

                <div className="space-y-2 text-xs font-medium">
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                    <span>Morning Azkar</span>
                    <Badge variant="outline">Binary</Badge>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                    <span>Evening Azkar</span>
                    <Badge variant="outline">Binary</Badge>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                    <span>Dua & Supplication</span>
                    <Badge variant="outline">Binary</Badge>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                    <span>Quran Reading</span>
                    <Badge variant="secondary">Duration</Badge>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                    <span>Physical Exercise</span>
                    <Badge variant="secondary">Duration</Badge>
                  </div>
                  <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                    <span>Islamic Learning</span>
                    <Badge variant="secondary">Duration</Badge>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1 bg-primary text-primary-foreground">
                    Next: Target Minutes
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Set Duration Targets</h2>
                  <p className="text-xs text-muted-foreground">
                    Configure initial target minutes for duration habits. You can edit these anytime in Settings.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-blue-500" /> Quran Reading (Minutes / day)
                    </label>
                    <Input
                      type="number"
                      value={quranTarget}
                      onChange={(e) => setQuranTarget(parseInt(e.target.value) || 0)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <Dumbbell className="h-4 w-4 text-emerald-500" /> Physical Exercise (Minutes / day)
                    </label>
                    <Input
                      type="number"
                      value={exerciseTarget}
                      onChange={(e) => setExerciseTarget(parseInt(e.target.value) || 0)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-purple-500" /> Islamic Learning (Minutes / day)
                    </label>
                    <Input
                      type="number"
                      value={learningTarget}
                      onChange={(e) => setLearningTarget(parseInt(e.target.value) || 0)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1 bg-primary text-primary-foreground">
                    Next: Reminders
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">Reminders & Privacy</h2>
                  <p className="text-xs text-muted-foreground">
                    Configure daily reflection reminders. All habit entries and reflections are strictly private to you.
                  </p>
                </div>

                <div className="space-y-4 border-y border-border/60 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold">Enable Daily Reflection Reminder</h4>
                      <p className="text-[11px] text-muted-foreground">Gentle end-of-day reminder prompt</p>
                    </div>
                    <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
                  </div>

                  {reminderEnabled && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Preferred Time</label>
                      <Input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Your personal data and reflections belong to you and are never shared or made public.</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleFinishOnboarding} disabled={isSubmitting} className="flex-1 bg-primary text-primary-foreground font-medium">
                    {isSubmitting ? 'Saving...' : 'Enter Tazkiyah'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

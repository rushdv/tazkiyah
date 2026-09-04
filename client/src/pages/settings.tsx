import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2, Download, ShieldCheck, SlidersHorizontal, User, Bell, FileSpreadsheet } from 'lucide-react';
import type { ApiResponse } from '@tazkiyah/shared';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      timezone: user?.timezone || 'UTC',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; timezone: string }) => {
      const res = await api.patch('/auth/profile', data);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.data);
      toast.success('Profile updated');
    },
  });

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/auth/settings');
      return res.data.data;
    },
  });

  const { data: habits, isLoading: isHabitsLoading } = useQuery({
    queryKey: ['habits-settings'],
    queryFn: async () => {
      const res = await api.get('/habits');
      return res.data.data;
    },
  });

  const { data: userHabitSettings } = useQuery({
    queryKey: ['user-habit-settings'],
    queryFn: async () => {
      const res = await api.get('/auth/settings/habits');
      return res.data.data || [];
    },
  });

  const [habitTargets, setHabitTargets] = useState<Record<string, number>>({});
  const [enabledHabits, setEnabledHabits] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (habits) {
      const targetsMap: Record<string, number> = {};
      const enabledMap: Record<string, boolean> = {};

      habits.forEach((h: any) => {
        targetsMap[h.id] = h.targetMinutes || 30;
        enabledMap[h.id] = true;
      });

      if (userHabitSettings && userHabitSettings.length > 0) {
        userHabitSettings.forEach((s: any) => {
          if (s.customTargetMinutes) targetsMap[s.habitId] = s.customTargetMinutes;
          if (s.enabled !== undefined) enabledMap[s.habitId] = s.enabled;
        });
      }

      setHabitTargets(targetsMap);
      setEnabledHabits(enabledMap);
    }
  }, [habits, userHabitSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.patch('/auth/settings', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Preferences updated');
    },
  });

  const updateHabitSettingsMutation = useMutation({
    mutationFn: async () => {
      const payload = Object.keys(enabledHabits).map((habitId) => ({
        habitId,
        enabled: enabledHabits[habitId],
        customTargetMinutes: habitTargets[habitId] || null,
      }));
      await api.patch('/auth/settings/habits', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-habit-settings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Habit targets updated');
    },
  });

  async function handleExportJSON() {
    try {
      const res = await api.get('/auth/export-data');
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data.data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `Tazkiyah-Data-Export-${formatDateFilename()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('JSON export downloaded');
    } catch {
      toast.error('Failed to export JSON data');
    }
  }

  function formatDateFilename() {
    return new Date().toISOString().split('T')[0];
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">Settings & Preferences</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Customize habit targets, preferences, notification schedules, and data backups.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              Profile Details
            </CardTitle>
            <CardDescription className="text-xs">Update account name and timezone</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Full Name</Label>
                <Input id="name" {...register('name')} className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone" className="text-xs">Timezone</Label>
                <select
                  id="timezone"
                  {...register('timezone')}
                  className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-xs"
                >
                  {Intl.supportedValuesOf('timeZone').map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" size="sm" disabled={updateProfileMutation.isPending} className="bg-primary text-primary-foreground text-xs">
                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preferences & Reminders Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Reminders & Preferences
            </CardTitle>
            <CardDescription className="text-xs">Configure daily notifications and starting day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSettingsLoading ? (
              <Skeleton className="h-32 rounded-xl" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold">Enable Daily Reminders</Label>
                    <p className="text-[11px] text-muted-foreground">Habit reminder notifications</p>
                  </div>
                  <Switch
                    checked={settings?.reminderEnabled ?? true}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({ reminderEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold">End-of-day Reflection Prompt</Label>
                    <p className="text-[11px] text-muted-foreground">Evening reflection reminder</p>
                  </div>
                  <Switch
                    checked={settings?.dailyReflectionReminder ?? true}
                    onCheckedChange={(checked) => updateSettingsMutation.mutate({ dailyReflectionReminder: checked })}
                  />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60">
                  <Label className="text-xs font-semibold">Week Starts On</Label>
                  <select
                    value={settings?.weekStartDay || 'monday'}
                    onChange={(e) => updateSettingsMutation.mutate({ weekStartDay: e.target.value })}
                    className="flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-xs"
                  >
                    <option value="monday">Monday</option>
                    <option value="sunday">Sunday</option>
                    <option value="saturday">Saturday</option>
                  </select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Habit Targets & Customization Card */}
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-accent" />
              Habit Targets & Customization
            </CardTitle>
            <CardDescription className="text-xs">
              Enable/disable habits and adjust custom target duration minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isHabitsLoading ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {habits?.map((h: any) => (
                    <div key={h.id} className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs">{h.label}</span>
                        <Switch
                          checked={enabledHabits[h.id] ?? true}
                          onCheckedChange={(checked) =>
                            setEnabledHabits((prev) => ({ ...prev, [h.id]: checked }))
                          }
                        />
                      </div>

                      {h.type === 'duration' && (
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground">Target Minutes</label>
                          <Input
                            type="number"
                            value={habitTargets[h.id] || 30}
                            onChange={(e) =>
                              setHabitTargets((prev) => ({ ...prev, [h.id]: parseInt(e.target.value) || 0 }))
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => updateHabitSettingsMutation.mutate()}
                  disabled={updateHabitSettingsMutation.isPending}
                  className="bg-primary text-primary-foreground text-xs"
                >
                  {updateHabitSettingsMutation.isPending ? 'Saving...' : 'Save Habit Settings'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Privacy & Export Card */}
        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Privacy & Personal Data Export
            </CardTitle>
            <CardDescription className="text-xs">
              You own your tracking data. Export full records and reflections anytime in JSON or CSV format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="sm" variant="outline" onClick={handleExportJSON} className="gap-2 text-xs">
                <Download className="h-4 w-4" /> Export Complete Data (JSON)
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              All habit logs, reflection notes, and achievement data are private to your account.
            </p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

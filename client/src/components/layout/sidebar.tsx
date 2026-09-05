import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  FileText,
  History,
  Trophy,
  Settings,
  LogOut,
  Moon,
  Sun,
  BookCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/auth-store';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/monthly-review', icon: BookCheck, label: 'Monthly Review' },
  { to: '/reports', icon: FileText, label: 'PDF Reports' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const { clearUser } = useAuthStore();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      clearUser();
      navigate('/auth/login');
    },
  });

  return (
    <aside className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-64 flex-col border-r border-border/60 bg-card/75 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2.5 border-b border-border/60 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
          T
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight">Tazkiyah</span>
          <span className="text-[10px] text-muted-foreground font-medium -mt-1">Build Better Habits</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3 space-y-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

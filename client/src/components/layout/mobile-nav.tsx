import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, BarChart3, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/monthly-review', icon: FileText, label: 'Review' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border/60 bg-card/85 backdrop-blur-xl md:hidden pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-semibold transition-all',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <item.icon className={cn('h-5 w-5')} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

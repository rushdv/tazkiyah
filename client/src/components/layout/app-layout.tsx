import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background pb-16 md:pb-0">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 md:ml-64 overflow-x-hidden p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}



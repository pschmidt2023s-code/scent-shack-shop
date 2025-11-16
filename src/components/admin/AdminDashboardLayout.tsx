import { useState } from 'react';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileNav } from './AdminMobileNav';
import { Card } from '@/components/ui/card';
import { Menu } from 'lucide-react';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  defaultTab?: string;
}

function AdminDashboardContent({ children, defaultTab = 'overview' }: AdminDashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'pause'>('online');
  const { setOpen } = useSidebar();

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-red-500', label: 'Offline' },
    pause: { color: 'bg-yellow-500', label: 'Pause' },
  };

  return (
    <>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col pb-20 lg:pb-0">
          <div className="border-b border-border/10 glass-card sticky top-0 z-40 rounded-b-2xl">
            <div className="container mx-auto px-4 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">Admin Dashboard</h1>
                    <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Verwaltungssystem für ALDENAIR</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Card className="glass-card px-4 py-2 cursor-pointer hover:shadow-lg transition-all group">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <select
                      value={systemStatus}
                      onChange={(e) => setSystemStatus(e.target.value as 'online' | 'offline' | 'pause')}
                      className="flex items-center gap-2 bg-transparent border-none font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
                    >
                      <option value="online">🟢 Online</option>
                      <option value="offline">🔴 Offline</option>
                      <option value="pause">🟡 Pause</option>
                    </select>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </div>
        </div>
        
        <AdminMobileNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onMenuClick={() => setOpen(true)}
        />
      </>
  );
}

export function AdminDashboardLayout({ children, defaultTab = 'overview' }: AdminDashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AdminDashboardContent defaultTab={defaultTab}>
          {children}
        </AdminDashboardContent>
      </div>
    </SidebarProvider>
  );
}

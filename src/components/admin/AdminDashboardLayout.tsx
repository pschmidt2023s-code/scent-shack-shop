import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Card } from '@/components/ui/card';
import { Menu } from 'lucide-react';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  defaultTab?: string;
}

export function AdminDashboardLayout({ children, defaultTab = 'overview' }: AdminDashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'pause'>('online');

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-red-500', label: 'Offline' },
    pause: { color: 'bg-yellow-500', label: 'Pause' },
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          <div className="border-b glass sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </SidebarTrigger>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold glass-text-dark">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground glass-text-dark hidden sm:block">Verwaltungssystem für ALDENAIR</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Card className="glass-card px-4 py-2 cursor-pointer hover:shadow-lg transition-all group">
                    <div className="text-sm text-muted-foreground glass-text-dark">Status</div>
                    <select
                      value={systemStatus}
                      onChange={(e) => setSystemStatus(e.target.value as 'online' | 'offline' | 'pause')}
                      className="flex items-center gap-2 bg-transparent border-none font-semibold glass-text-dark cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
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
      </div>
    </SidebarProvider>
  );
}

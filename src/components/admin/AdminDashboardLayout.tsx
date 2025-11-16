import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Card } from '@/components/ui/card';

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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          <div className="border-b glass">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold glass-text-dark">Admin Dashboard</h1>
                  <p className="text-muted-foreground glass-text-dark">Verwaltungssystem für ALDENAIR</p>
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

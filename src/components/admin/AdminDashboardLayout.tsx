import { useState } from 'react';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileNav } from './AdminMobileNav';
import { AdminMenuSheet } from './AdminMenuSheet';
import { Card } from '@/components/ui/card';
import { Menu } from 'lucide-react';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
}

function AdminDashboardContent({ children, defaultTab = 'overview', onTabChange }: AdminDashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'pause'>('online');
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const { setOpen } = useSidebar();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-red-500', label: 'Offline' },
    pause: { color: 'bg-yellow-500', label: 'Pause' },
  };

  return (
    <>
      <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 flex flex-col min-h-screen">
          <div className="border-b border-border/10 glass-card sticky top-0 z-40">
            <div className="container mx-auto px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="hidden lg:flex p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                    <Menu className="h-4 w-4 text-foreground" />
                  </SidebarTrigger>
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-foreground">Admin</h1>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">Verwaltung</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Card className="glass-card px-3 py-1.5 cursor-pointer hover:shadow-lg transition-all">
                    <div className="text-[10px] text-muted-foreground">Status</div>
                    <select
                      value={systemStatus}
                      onChange={(e) => setSystemStatus(e.target.value as 'online' | 'offline' | 'pause')}
                      className="flex items-center gap-2 bg-transparent border-none text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
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

          <div className="flex-1 overflow-auto pb-24 lg:pb-6">
            <div className="container mx-auto px-3 py-4">
              {children}
            </div>
          </div>
        </div>
        
        <AdminMobileNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          onMenuClick={() => setShowMenuSheet(true)}
        />
        
        <AdminMenuSheet
          open={showMenuSheet}
          onOpenChange={setShowMenuSheet}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </>
  );
}

export function AdminDashboardLayout({ children, defaultTab = 'overview', onTabChange }: AdminDashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AdminDashboardContent defaultTab={defaultTab} onTabChange={onTabChange}>
          {children}
        </AdminDashboardContent>
      </div>
    </SidebarProvider>
  );
}

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  TrendingUp,
  Gift,
  RefreshCw,
  Bell,
  Award,
  MessageSquare,
  FileText,
  ShoppingBag,
  RotateCcw,
  Trophy,
  Mail,
  UserCog,
  BarChart3,
} from 'lucide-react';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  defaultTab?: string;
}

export function AdminDashboardLayout({ children, defaultTab = 'overview' }: AdminDashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const sections = [
    {
      category: 'Übersicht',
      tabs: [
        { value: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { value: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      category: 'Verkauf & Bestellungen',
      tabs: [
        { value: 'orders', label: 'Bestellungen', icon: ShoppingBag },
        { value: 'products', label: 'Produkte', icon: Package },
        { value: 'bundles', label: 'Bundles', icon: Gift },
        { value: 'coupons', label: 'Gutscheine', icon: FileText },
      ],
    },
    {
      category: 'Kunden & Marketing',
      tabs: [
        { value: 'users', label: 'Kunden', icon: Users },
        { value: 'loyalty', label: 'Treueprogramm', icon: Award },
        { value: 'referral', label: 'Empfehlungen', icon: TrendingUp },
        { value: 'newsletter', label: 'Newsletter', icon: Mail },
        { value: 'contest', label: 'Gewinnspiel', icon: Trophy },
      ],
    },
    {
      category: 'Service & Support',
      tabs: [
        { value: 'chat', label: 'Live Chat', icon: MessageSquare },
        { value: 'returns', label: 'Rücksendungen', icon: RotateCcw },
        { value: 'notifications', label: 'Benachrichtigungen', icon: Bell },
      ],
    },
    {
      category: 'Partner & Erweitert',
      tabs: [
        { value: 'partners', label: 'Partner', icon: UserCog },
        { value: 'payback', label: 'Payback', icon: Award },
        { value: 'auto-reorder', label: 'Auto-Nachbestellung', icon: RefreshCw },
      ],
    },
    {
      category: 'System',
      tabs: [
        { value: 'settings', label: 'Einstellungen', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Verwaltungssystem für ALDENAIR</p>
            </div>
            <div className="flex items-center gap-2">
              <Card className="px-4 py-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-semibold">Online</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.category} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground px-2">
                  {section.category}
                </h3>
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-auto bg-transparent p-0">
                  {section.tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            ))}
          </div>

          <div className="mt-6">{children}</div>
        </Tabs>
      </div>
    </div>
  );
}

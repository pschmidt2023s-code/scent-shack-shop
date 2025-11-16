import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
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
import { cn } from '@/lib/utils';

const menuSections = [
  {
    category: 'Übersicht',
    items: [
      { value: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    category: 'Verkauf & Bestellungen',
    items: [
      { value: 'products', label: 'Produkte', icon: Package },
      { value: 'bundles', label: 'Bundles', icon: Gift },
      { value: 'coupons', label: 'Gutscheine', icon: FileText },
    ],
  },
  {
    category: 'Kunden & Marketing',
    items: [
      { value: 'users', label: 'Kunden', icon: Users },
      { value: 'loyalty', label: 'Treueprogramm', icon: Award },
      { value: 'referral', label: 'Empfehlungen', icon: TrendingUp },
      { value: 'newsletter', label: 'Newsletter', icon: Mail },
      { value: 'contest', label: 'Gewinnspiel', icon: Trophy },
    ],
  },
  {
    category: 'Service & Support',
    items: [
      { value: 'chat', label: 'Live Chat', icon: MessageSquare },
      { value: 'returns', label: 'Rücksendungen', icon: RotateCcw },
      { value: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    ],
  },
  {
    category: 'Partner & Erweitert',
    items: [
      { value: 'partners', label: 'Partner', icon: UserCog },
      { value: 'payback', label: 'Payback', icon: Award },
      { value: 'auto-reorder', label: 'Auto-Nachbestellung', icon: RefreshCw },
    ],
  },
  {
    category: 'System',
    items: [
      { value: 'settings', label: 'Einstellungen', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { open } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className={cn("hidden lg:flex border-r border-border/20 bg-background/95 backdrop-blur-xl", open ? "w-64" : "w-20")}>
      <div className={cn("p-4 border-b border-border/20 flex items-center justify-center bg-card/50")}>
        <h2 className="font-bold text-base text-foreground">
          {open ? "Admin Dashboard" : "A"}
        </h2>
      </div>

      <SidebarContent className="bg-background/50">
        {menuSections.map((section) => (
          <SidebarGroup key={section.category}>
            {open && (
              <SidebarGroupLabel className="text-muted-foreground px-2 text-xs font-semibold">
                {section.category}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.value;
                  
                  return (
                    <SidebarMenuItem key={item.value}>
                      <SidebarMenuButton
                        onClick={() => onTabChange(item.value)}
                        className={cn(
                          "cursor-pointer transition-all w-full text-foreground hover:bg-accent/50",
                          isActive && "bg-primary/20 text-primary font-semibold hover:bg-primary/30",
                          open ? "flex items-center gap-3 px-3 py-2.5" : "flex items-center justify-center p-3"
                        )}
                        title={item.label}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {open && <span className="text-sm font-medium">{item.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

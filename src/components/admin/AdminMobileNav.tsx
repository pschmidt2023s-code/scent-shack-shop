import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings,
  BarChart3,
  Menu
} from 'lucide-react';

interface AdminMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onMenuClick: () => void;
}

const NAV_ITEMS = [
  {
    value: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    value: 'products',
    label: 'Produkte',
    icon: Package
  },
  {
    value: 'users',
    label: 'Kunden',
    icon: Users
  },
  {
    value: 'analytics',
    label: 'Analytics',
    icon: BarChart3
  },
  {
    value: 'menu',
    label: 'Menü',
    icon: Menu,
    isAction: true
  }
];

export function AdminMobileNav({ activeTab, onTabChange, onMenuClick }: AdminMobileNavProps) {
  const handleItemClick = (item: typeof NAV_ITEMS[0]) => {
    if (item.isAction) {
      onMenuClick();
    } else {
      onTabChange(item.value);
    }
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
      
      <nav 
        className="fixed bottom-0 left-0 right-0 z-[999] lg:hidden glass-nav rounded-t-[2rem]"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
          paddingTop: '8px'
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="grid grid-cols-5 h-14 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            
            return (
              <button
                key={item.value}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 transition-all duration-200 h-full rounded-xl",
                  "hover:bg-primary/10 active:scale-95",
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-foreground hover:text-primary"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                
                <span className={cn(
                  "text-[9px] font-medium transition-colors leading-tight",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

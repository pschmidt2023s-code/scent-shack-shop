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
    value: 'settings',
    label: 'Mehr',
    icon: Settings,
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
      <nav 
        className="fixed bottom-0 left-0 right-0 z-[100000] lg:hidden rounded-t-[2rem] glass-nav border-t-2 border-primary/30 shadow-2xl"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
          paddingTop: '12px',
          pointerEvents: 'auto'
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="grid grid-cols-5 h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            
            return (
              <button
                key={item.value}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1 px-2 py-2 transition-all duration-200 h-full rounded-xl",
                  "hover:bg-primary/10 active:scale-95",
                  isActive 
                    ? "text-primary font-semibold bg-primary/5" 
                    : "text-foreground/90 hover:text-primary"
                )}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                </div>
                
                <span className={cn(
                  "text-[11px] font-extrabold transition-colors leading-tight",
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

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
      <div className="h-20 lg:hidden" aria-hidden="true" />
      
      <nav 
        className="fixed bottom-0 left-0 right-0 z-[99999] lg:hidden rounded-t-[2rem]"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
          paddingTop: '8px',
          pointerEvents: 'auto',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(120px) saturate(220%) contrast(120%)',
          WebkitBackdropFilter: 'blur(120px) saturate(220%) contrast(120%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 -8px 32px 0 rgba(31, 38, 135, 0.2), 0 -4px 16px 0 rgba(31, 38, 135, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)'
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
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
                  <Icon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                
                <span className={cn(
                  "text-[11px] font-semibold transition-colors leading-tight",
                  isActive ? "text-primary" : "text-foreground/90"
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

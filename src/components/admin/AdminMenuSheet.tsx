import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Gift,
  FileText,
  Award,
  TrendingUp,
  Mail,
  Trophy,
  MessageSquare,
  RotateCcw,
  Bell,
  UserCog,
  RefreshCw,
  Video,
} from 'lucide-react';

interface AdminMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MENU_SECTIONS = [
  {
    category: 'Verkauf & Marketing',
    items: [
      { value: 'bundles', label: 'Bundles', icon: Gift },
      { value: 'coupons', label: 'Gutscheine', icon: FileText },
      { value: 'videos', label: 'Videos', icon: Video },
    ],
  },
  {
    category: 'Kunden & Loyalität',
    items: [
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
];

export function AdminMenuSheet({ open, onOpenChange, activeTab, onTabChange }: AdminMenuSheetProps) {
  const handleTabSelect = (tab: string) => {
    onTabChange(tab);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] glass-card rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl font-bold">Admin Menü</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(80vh-80px)] pr-4">
          <div className="space-y-6 pb-6">
            {MENU_SECTIONS.map((section) => (
              <div key={section.category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  {section.category}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;
                    
                    return (
                      <button
                        key={item.value}
                        onClick={() => handleTabSelect(item.value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          "hover:bg-primary/10 active:scale-98",
                          isActive 
                            ? "bg-primary/20 text-primary font-semibold shadow-sm" 
                            : "text-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

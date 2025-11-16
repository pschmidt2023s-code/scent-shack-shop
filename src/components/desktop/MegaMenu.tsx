import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Sparkles, Heart, Gift, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuCategory {
  title: string;
  icon: any;
  items: { label: string; href: string; badge?: string }[];
}

const menuCategories: MenuCategory[] = [
  {
    title: 'Kategorien',
    icon: Sparkles,
    items: [
      { label: 'Alle Düfte', href: '/products' },
      { label: 'Damen', href: '/products?category=women' },
      { label: 'Herren', href: '/products?category=men' },
      { label: 'Unisex', href: '/products?category=unisex' },
      { label: 'Auto Düfte', href: '/products?category=auto' },
      { label: 'Tester & Samples', href: '/products?type=sample', badge: 'Neu' },
    ]
  },
  {
    title: 'Beliebte Marken',
    icon: TrendingUp,
    items: [
      { label: 'Tom Ford', href: '/products?brand=Tom%20Ford' },
      { label: 'Dior', href: '/products?brand=Dior' },
      { label: 'Chanel', href: '/products?brand=Chanel' },
      { label: 'Yves Saint Laurent', href: '/products?brand=YSL' },
      { label: 'Creed', href: '/products?brand=Creed' },
      { label: 'Alle Marken', href: '/products' },
    ]
  },
  {
    title: 'Extras',
    icon: Gift,
    items: [
      { label: 'Geschenksets', href: '/products?type=bundle' },
      { label: 'Favoriten', href: '/favorites' },
      { label: 'Gewinnspiel', href: '/contest', badge: 'Hot' },
      { label: 'Partner werden', href: '/partner' },
      { label: 'Newsletter', href: '/newsletter' },
    ]
  }
];

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative hidden lg:block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg",
          isOpen ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-primary/5"
        )}
      >
        Produkte
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[800px] -ml-4 animate-fade-in">
          <div className="glass-card rounded-2xl p-8 shadow-2xl border border-border/20">
            <div className="grid grid-cols-3 gap-8">
              {menuCategories.map((category) => (
                <div key={category.title}>
                  <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
                    <category.icon className="w-4 h-4 text-primary" />
                    {category.title}
                  </div>
                  <ul className="space-y-3">
                    {category.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className="flex items-center justify-between text-sm text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured Banner */}
            <div className="mt-8 pt-8 border-t border-border/20">
              <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
                <Heart className="w-12 h-12 text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Treueprogramm</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Sammle Punkte bei jedem Einkauf und erhalte exklusive Prämien
                  </p>
                  <Link to="/profile" className="text-sm text-primary hover:underline font-medium">
                    Mehr erfahren →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

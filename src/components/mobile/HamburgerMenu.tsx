import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  Home,
  ShoppingBag,
  Heart,
  User,
  Gift,
  HelpCircle,
  Mail,
  FileText,
  Users,
  Trophy,
  Sparkles,
  LogOut,
  Settings
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: any;
  requiresAuth?: boolean;
}

const menuSections = [
  {
    title: 'Hauptmenü',
    items: [
      { label: 'Startseite', href: '/', icon: Home },
      { label: 'Shop', href: '/products', icon: ShoppingBag },
      { label: 'Favoriten', href: '/favorites', icon: Heart },
    ]
  },
  {
    title: 'Mein Konto',
    requiresAuth: true,
    items: [
      { label: 'Profil', href: '/profile', icon: User, requiresAuth: true },
      { label: 'Bestellungen', href: '/profile', icon: ShoppingBag, requiresAuth: true },
    ]
  },
  {
    title: 'Extras',
    items: [
      { label: 'Gewinnspiel', href: '/contest', icon: Trophy },
      { label: 'Partner werden', href: '/partner', icon: Users },
      { label: 'Empfehlungsprogramm', href: '/referral', icon: Gift },
      { label: 'Newsletter', href: '/newsletter', icon: Mail },
    ]
  },
  {
    title: 'Hilfe & Info',
    items: [
      { label: 'FAQ', href: '/faq', icon: HelpCircle },
      { label: 'Kontakt', href: '/contact', icon: Mail },
      { label: 'Retouren', href: '/returns', icon: FileText },
      { label: 'Datenschutz', href: '/privacy', icon: FileText },
      { label: 'AGB', href: '/terms', icon: FileText },
      { label: 'Impressum', href: '/imprint', icon: FileText },
    ]
  }
];

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">ALDENAIR</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-6">
            {menuSections.map((section) => {
              // Skip auth-required sections if user is not logged in
              if (section.requiresAuth && !user) return null;

              return (
                <div key={section.title}>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3 px-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      // Skip auth-required items if user is not logged in
                      if (item.requiresAuth && !user) return null;

                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                        >
                          <Icon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <Separator className="mt-4" />
                </div>
              );
            })}

            {/* User Actions */}
            {user ? (
              <div className="pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Abmelden
                </Button>
              </div>
            ) : (
              <div className="pt-4">
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full" size="lg">
                    <User className="w-5 h-5 mr-2" />
                    Anmelden / Registrieren
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

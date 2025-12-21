import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileForm } from '@/components/profile/ProfileForm';
import AddressManager from '@/components/profile/AddressManager';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { LoyaltyRewards } from '@/components/profile/LoyaltyRewards';
import { BiometricAuth } from '@/components/BiometricAuth';
import { PasswordChange } from '@/components/profile/PasswordChange';
import { 
  ArrowLeft, User, MapPin, ShoppingBag, Gift, Shield, 
  ChevronRight, Star, Package, Crown, Loader2
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useQuery } from '@tanstack/react-query';

type ProfileSection = 'menu' | 'profile' | 'addresses' | 'orders' | 'loyalty' | 'security';

const VALID_SECTIONS: ProfileSection[] = ['menu', 'profile', 'addresses', 'orders', 'loyalty', 'security'];

interface LoyaltyData {
  points: number;
  tier: string;
  tierDiscount: number;
  totalSpent: number;
}

interface OrderData {
  id: string;
  status: string;
  totalAmount: string;
}

const TIER_CONFIG = {
  bronze: { name: 'Bronze', color: 'bg-orange-700', icon: Star },
  silver: { name: 'Silber', color: 'bg-gray-400', icon: Star },
  gold: { name: 'Gold', color: 'bg-yellow-500 text-black', icon: Crown },
  platinum: { name: 'Platin', color: 'bg-gradient-to-r from-gray-300 to-gray-500 text-black', icon: Crown },
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const sectionFromUrl = searchParams.get('tab') as ProfileSection | null;
  const activeSection: ProfileSection = sectionFromUrl && VALID_SECTIONS.includes(sectionFromUrl) 
    ? sectionFromUrl 
    : 'menu';

  const setActiveSection = (section: ProfileSection) => {
    if (section === 'menu') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: section });
    }
  };

  const { data: loyaltyData, isLoading: loyaltyLoading } = useQuery<LoyaltyData>({
    queryKey: ['/api/loyalty'],
    enabled: !!user,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<OrderData[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });

  const { data: addressesData, isLoading: addressesLoading } = useQuery<any[]>({
    queryKey: ['/api/addresses'],
    enabled: !!user,
  });

  const isStatsLoading = loyaltyLoading || ordersLoading || addressesLoading;

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen glass">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
              <p className="text-muted-foreground mb-6">
                Bitte melden Sie sich an, um Ihr Konto zu verwalten.
              </p>
              <Button onClick={() => navigate('/')} data-testid="button-go-home">
                Zur Startseite
              </Button>
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </>
    );
  }

  const tier = (loyaltyData?.tier || 'bronze') as keyof typeof TIER_CONFIG;
  const tierConfig = TIER_CONFIG[tier];
  const TierIcon = tierConfig.icon;
  const orderCount = ordersData?.length || 0;
  const totalSpent = loyaltyData?.totalSpent || 0;
  const points = loyaltyData?.points || 0;
  const addressCount = addressesData?.length || 0;

  const menuItems = [
    {
      id: 'profile' as const,
      icon: User,
      title: 'Persönliche Daten',
      subtitle: 'Name, E-Mail & Telefon',
      badge: null,
    },
    {
      id: 'addresses' as const,
      icon: MapPin,
      title: 'Adressen',
      subtitle: 'Liefer- und Rechnungsadressen',
      badge: addressCount > 0 ? `${addressCount}` : null,
    },
    {
      id: 'orders' as const,
      icon: Package,
      title: 'Bestellungen',
      subtitle: 'Bestellverlauf & Sendungsverfolgung',
      badge: orderCount > 0 ? `${orderCount}` : null,
    },
    {
      id: 'loyalty' as const,
      icon: Gift,
      title: 'Treueprogramm',
      subtitle: 'Punkte, Belohnungen & Boni',
      badge: points > 0 ? `${points} Pkt.` : null,
      badgeVariant: 'default' as const,
    },
    {
      id: 'security' as const,
      icon: Shield,
      title: 'Sicherheit',
      subtitle: 'Passwort & Authentifizierung',
      badge: null,
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileForm />;
      case 'addresses':
        return <AddressManager />;
      case 'orders':
        return <OrderHistory />;
      case 'loyalty':
        return <LoyaltyRewards />;
      case 'security':
        return (
          <div className="space-y-6">
            <PasswordChange />
            <BiometricAuth />
          </div>
        );
      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    const item = menuItems.find(m => m.id === activeSection);
    return item?.title || 'Mein Konto';
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen glass pb-24 md:pb-8">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-2xl mx-auto">
            
            {activeSection === 'menu' ? (
              <>
                <Button 
                  onClick={() => navigate(-1)}
                  variant="ghost" 
                  size="sm"
                  className="mb-4"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>

                <Card className="mb-6 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-bold truncate" data-testid="text-user-name">
                          {user.fullName || user.email?.split('@')[0] || 'Kunde'}
                        </h1>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${tierConfig.color} text-xs`}>
                            <TierIcon className="w-3 h-3 mr-1" />
                            {tierConfig.name}
                          </Badge>
                          {loyaltyData?.tierDiscount ? (
                            <Badge variant="outline" className="text-xs">
                              {loyaltyData.tierDiscount}% Rabatt
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-0">
                    <div className="grid grid-cols-3 divide-x border-t">
                      <div className="p-4 text-center">
                        {isStatsLoading ? (
                          <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        ) : (
                          <p className="text-2xl font-bold text-primary" data-testid="text-order-count">
                            {orderCount}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Bestellungen</p>
                      </div>
                      <div className="p-4 text-center">
                        {isStatsLoading ? (
                          <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        ) : (
                          <p className="text-2xl font-bold" data-testid="text-points">
                            {points}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Punkte</p>
                      </div>
                      <div className="p-4 text-center">
                        {isStatsLoading ? (
                          <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        ) : (
                          <p className="text-2xl font-bold" data-testid="text-total-spent">
                            {totalSpent.toFixed(0)}€
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Ausgegeben</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Card 
                        key={item.id}
                        className="hover-elevate active-elevate-2 cursor-pointer overflow-visible"
                        onClick={() => setActiveSection(item.id)}
                        data-testid={`card-menu-${item.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{item.title}</h3>
                                {item.badge && (
                                  <Badge 
                                    variant={item.badgeVariant || 'secondary'} 
                                    className="text-xs"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.subtitle}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <Button 
                    onClick={() => setActiveSection('menu')}
                    variant="ghost" 
                    size="icon"
                    data-testid="button-back-to-menu"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h1 className="text-xl font-bold">{getSectionTitle()}</h1>
                </div>

                <Card>
                  <CardContent className="p-4 md:p-6">
                    {renderSection()}
                  </CardContent>
                </Card>
              </>
            )}

          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}


import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, Package, Settings, Crown, ShoppingBag, Calendar, Award } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import AddressManager from '@/components/profile/AddressManager';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { TwoFactorManagement } from '@/components/auth/TwoFactorManagement';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCategory: 'Prestige Edition',
    memberSince: '',
    addressCount: 0
  });

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // Load orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('user_id', user.id);

      // Load addresses count
      const { count: addressCount } = await supabase
        .from('addresses')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      if (orders) {
        const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount / 100), 0);
        setStats({
          totalOrders: orders.length,
          totalSpent,
          favoriteCategory: 'Prestige Edition',
          memberSince: new Date(user.created_at).toLocaleDateString('de-DE'),
          addressCount: addressCount || 0
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>
              Sie müssen angemeldet sein, um Ihr Profil zu sehen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">Zurück zur Startseite</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-luxury-black flex items-center gap-3">
                <Crown className="w-8 h-8 text-luxury-gold" />
                Willkommen zurück!
              </h1>
              <p className="text-muted-foreground mt-1">
                Verwalten Sie Ihr ALDENAIR Konto und Ihre Bestellungen
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/">
                <Button variant="outline">Zurück zum Shop</Button>
              </Link>
              <Button variant="outline" onClick={signOut}>
                Abmelden
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/80 text-sm">Bestellungen</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-primary-foreground/80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-subtle">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Ausgegeben</p>
                    <p className="text-2xl font-bold text-luxury-black">€{stats.totalSpent.toFixed(2)}</p>
                  </div>
                  <Award className="w-8 h-8 text-luxury-gold" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Adressen</p>
                    <p className="text-2xl font-bold text-luxury-black">{stats.addressCount}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-luxury-gold" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Mitglied seit</p>
                    <p className="text-sm font-medium text-luxury-black">{stats.memberSince}</p>
                    <Badge variant="secondary" className="mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Premium Kunde
                    </Badge>
                  </div>
                  <User className="w-8 h-8 text-luxury-gold" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adressen
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Bestellungen
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Einstellungen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Persönliche Informationen</CardTitle>
                  <CardDescription>
                    Aktualisieren Sie Ihre persönlichen Daten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <CardTitle>Adressverwaltung</CardTitle>
                  <CardDescription>
                    Verwalten Sie Ihre Lieferadressen und Rechnungsadressen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddressManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Bestellhistorie</CardTitle>
                  <CardDescription>
                    Sehen Sie alle Ihre bisherigen Bestellungen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrderHistory />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kontoeinstellungen</CardTitle>
                  <CardDescription>
                    Verwalten Sie Ihre Kontoeinstellungen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">E-Mail-Adresse</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Konto erstellt</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <TwoFactorManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

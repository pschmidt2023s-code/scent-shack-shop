
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, MapPin, Package, Settings } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AddressManager } from '@/components/profile/AddressManager';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, signOut } = useAuth();

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Mein Profil</h1>
              <p className="text-muted-foreground">Verwalten Sie Ihre Kontoinformationen</p>
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

            <TabsContent value="settings">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

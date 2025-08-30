import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/ProfileForm';
import AddressManager from '@/components/profile/AddressManager';
import { OrderHistory } from '@/components/profile/OrderHistory';
import { PaybackSystem } from '@/components/PaybackSystem';
import { ArrowLeft, User, MapPin, ShoppingBag, Euro } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
              <p className="text-muted-foreground mb-6">
                Sie müssen angemeldet sein, um Ihr Profil zu verwalten.
              </p>
              <Button onClick={() => navigate('/')}>
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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline" 
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Mein Profil</h1>
              <p className="text-muted-foreground mt-2">
                Verwalten Sie Ihre persönlichen Informationen, Adressen und Bestellungen
              </p>
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
                  <ShoppingBag className="w-4 h-4" />
                  Bestellungen
                </TabsTrigger>
                <TabsTrigger value="payback" className="flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  Payback
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ProfileForm />
              </TabsContent>

              <TabsContent value="addresses">
                <AddressManager />
              </TabsContent>

              <TabsContent value="orders">
                <OrderHistory />
              </TabsContent>

              <TabsContent value="payback">
                <PaybackSystem />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
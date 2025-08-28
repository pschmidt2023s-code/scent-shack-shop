
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// For authenticated users
const authenticatedReturnSchema = z.object({
  orderId: z.string().min(1, 'Bitte wählen Sie eine Bestellung aus'),
  reason: z.string().min(10, 'Grund für die Retoure muss mindestens 10 Zeichen haben'),
});

// For guest users
const guestReturnSchema = z.object({
  orderNumber: z.string().min(5, 'Bestellnummer muss mindestens 5 Zeichen haben'),
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  street: z.string().min(5, 'Straße und Hausnummer sind erforderlich'),
  postalCode: z.string().min(5, 'PLZ muss mindestens 5 Zeichen haben'),
  city: z.string().min(2, 'Stadt ist erforderlich'),
  reason: z.string().min(10, 'Grund für die Retoure muss mindestens 10 Zeichen haben'),
  items: z.string().min(5, 'Bitte geben Sie die zu retournierenden Artikel an'),
});

type AuthenticatedReturnData = z.infer<typeof authenticatedReturnSchema>;
type GuestReturnData = z.infer<typeof guestReturnSchema>;

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  perfume_id: string;
  variant_id: string;
  quantity: number;
}

export default function Returns() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  const authenticatedForm = useForm<AuthenticatedReturnData>({
    resolver: zodResolver(authenticatedReturnSchema),
    defaultValues: {
      orderId: '',
      reason: '',
    },
  });

  const guestForm = useForm<GuestReturnData>({
    resolver: zodResolver(guestReturnSchema),
    defaultValues: {
      orderNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      street: '',
      postalCode: '',
      city: '',
      reason: '',
      items: '',
    },
  });

  useEffect(() => {
    const initializeComponent = async () => {
      if (user) {
        await loadUserOrders();
      } else {
        setLoading(false);
      }
    };
    
    initializeComponent();
  }, [user]);

  const loadUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          created_at,
          total_amount,
          status,
          order_items (
            id,
            perfume_id,
            variant_id,
            quantity
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Fehler',
        description: 'Bestellungen konnten nicht geladen werden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onAuthenticatedSubmit = async (data: AuthenticatedReturnData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('returns')
        .insert({
          user_id: user?.id,
          order_id: data.orderId,
          reason: data.reason,
          status: 'pending'
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Retoure eingereicht',
        description: 'Ihre Retouren-Anfrage wurde erfolgreich eingereicht. Sie erhalten eine Bestätigung per E-Mail.',
      });
      
      authenticatedForm.reset();
    } catch (error) {
      console.error('Error submitting return:', error);
      toast({
        title: 'Fehler',
        description: 'Retoure konnte nicht eingereicht werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGuestSubmit = async (data: GuestReturnData) => {
    setIsSubmitting(true);
    
    // Create email body for return request
    const emailBody = `
Retouren-Anfrage

Bestellnummer: ${data.orderNumber}
Name: ${data.firstName} ${data.lastName}
E-Mail: ${data.email}

Adresse:
${data.street}
${data.postalCode} ${data.city}

Zu retournierende Artikel:
${data.items}

Grund für die Retoure:
${data.reason}
    `;

    const mailtoLink = `mailto:support@aldenairperfumes.de?subject=Retouren-Anfrage - Bestellung ${data.orderNumber}&body=${encodeURIComponent(emailBody)}`;
    
    // Simulate processing time
    setTimeout(() => {
      window.location.href = mailtoLink;
      setIsSubmitted(true);
      setIsSubmitting(false);
      
      toast({
        title: 'Retouren-Anfrage eingereicht',
        description: 'Ihre E-Mail wird geöffnet. Wir bearbeiten Ihre Anfrage innerhalb von 24 Stunden.',
      });
      
      guestForm.reset();
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-luxury-black mb-2">Anfrage gesendet</h2>
            <p className="text-luxury-gray mb-6">
              Ihre Retouren-Anfrage wurde erfolgreich eingereicht. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setIsSubmitted(false)} className="w-full bg-primary hover:bg-primary/90">
                Weitere Retoure anmelden
              </Button>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Zurück zum Shop
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Link to="/">
              <Button 
                variant="luxury" 
                size="lg" 
                className="hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-glow"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Zurück zur Startseite
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <Package className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-luxury-black via-luxury-gold to-luxury-black bg-clip-text text-transparent">
              Retoure anmelden
            </h1>
            <p className="text-muted-foreground text-lg">
              {user ? 'Wählen Sie eine Ihrer Bestellungen aus und geben Sie den Grund für die Retoure an.' : 'Füllen Sie das Formular aus, um eine Retoure für Ihre Bestellung anzumelden.'}
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Bestellungen werden geladen...</span>
                </div>
              </CardContent>
            </Card>
          ) : user ? (
            // Authenticated user form
            <Card>
              <CardHeader>
                <CardTitle>Retouren-Formular</CardTitle>
                <CardDescription>
                  Wählen Sie eine Ihrer Bestellungen aus. Wir bearbeiten Ihre Anfrage innerhalb von 24 Stunden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...authenticatedForm}>
                  <form onSubmit={authenticatedForm.handleSubmit(onAuthenticatedSubmit)} className="space-y-6">
                    <FormField
                      control={authenticatedForm.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bestellung auswählen</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wählen Sie eine Bestellung aus" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {orders.map((order) => (
                                <SelectItem key={order.id} value={order.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">#{order.order_number}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(order.created_at).toLocaleDateString('de-DE')} - €{(order.total_amount / 100).toFixed(2)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {authenticatedForm.watch('orderId') && (
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Bestelldetails:</h4>
                        {(() => {
                          const selectedOrder = orders.find(o => o.id === authenticatedForm.watch('orderId'));
                          return selectedOrder ? (
                            <div className="space-y-2">
                              <p className="text-sm"><strong>Bestellnummer:</strong> #{selectedOrder.order_number}</p>
                              <p className="text-sm"><strong>Datum:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('de-DE')}</p>
                              <p className="text-sm"><strong>Betrag:</strong> €{(selectedOrder.total_amount / 100).toFixed(2)}</p>
                              <div className="text-sm">
                                <strong>Artikel:</strong>
                                <ul className="mt-1 ml-4">
                                  {selectedOrder.order_items.map((item) => (
                                    <li key={item.id} className="list-disc">
                                      {item.quantity}x {item.perfume_id} ({item.variant_id})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    <FormField
                      control={authenticatedForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grund für die Retoure</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Bitte beschreiben Sie den Grund für die Retoure (z.B. Größe passt nicht, Qualitätsmangel, falscher Artikel, etc.)"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Wird eingereicht...' : 'Retoure einreichen'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            // Guest user form
            <Card>
              <CardHeader>
                <CardTitle>Retouren-Formular</CardTitle>
                <CardDescription>
                  Alle Felder sind erforderlich. Wir bearbeiten Ihre Anfrage innerhalb von 24 Stunden.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...guestForm}>
                  <form onSubmit={guestForm.handleSubmit(onGuestSubmit)} className="space-y-6">
                    <FormField
                      control={guestForm.control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bestellnummer</FormLabel>
                          <FormControl>
                            <Input placeholder="z.B. ALN-2025-001234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={guestForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vorname</FormLabel>
                            <FormControl>
                              <Input placeholder="Max" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={guestForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nachname</FormLabel>
                            <FormControl>
                              <Input placeholder="Mustermann" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={guestForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail-Adresse</FormLabel>
                          <FormControl>
                            <Input placeholder="max.mustermann@beispiel.de" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={guestForm.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Straße und Hausnummer</FormLabel>
                          <FormControl>
                            <Input placeholder="Musterstraße 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={guestForm.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postleitzahl</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={guestForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stadt</FormLabel>
                            <FormControl>
                              <Input placeholder="Berlin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={guestForm.control}
                      name="items"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zu retournierende Artikel</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Bitte listen Sie alle Artikel auf, die Sie retournieren möchten (Name, Größe, Anzahl)"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={guestForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grund für die Retoure</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Bitte beschreiben Sie den Grund für die Retoure (z.B. Größe passt nicht, Qualitätsmangel, etc.)"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Wird gesendet...' : 'Retoure anmelden'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

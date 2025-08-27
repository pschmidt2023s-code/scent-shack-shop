
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const returnFormSchema = z.object({
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

type ReturnFormData = z.infer<typeof returnFormSchema>;

export default function Returns() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ReturnFormData>({
    resolver: zodResolver(returnFormSchema),
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

  const onSubmit = async (data: ReturnFormData) => {
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
      
      form.reset();
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
              <Button onClick={() => setIsSubmitted(false)} className="w-full bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-black">
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
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <Package className="w-16 h-16 text-luxury-gold mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-luxury-black mb-4">Retoure anmelden</h1>
            <p className="text-luxury-gray text-lg">
              Füllen Sie das Formular aus, um eine Retoure für Ihre Bestellung anzumelden.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-luxury-black">Retouren-Formular</CardTitle>
              <CardDescription>
                Alle Felder sind erforderlich. Wir bearbeiten Ihre Anfrage innerhalb von 24 Stunden.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    className="w-full bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-black"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Wird gesendet...' : 'Retoure anmelden'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

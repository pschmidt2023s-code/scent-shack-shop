import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Gift, Calendar, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const contestSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein').max(50),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein').max(50),
  email: z.string().email('Bitte gib eine gueltige E-Mail-Adresse ein'),
  phone: z.string().min(10, 'Bitte gib eine gueltige Telefonnummer ein').optional().or(z.literal('')),
  birthDate: z.string().refine((date) => {
    if (!date) return false;
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, 'Du musst mindestens 18 Jahre alt sein'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein').max(500),
  ageConfirmed: z.boolean().refine((val) => val === true, {
    message: 'Du musst bestaetigen, dass du mindestens 18 Jahre alt bist',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Du musst die Teilnahmebedingungen akzeptieren',
  }),
});

type ContestFormValues = z.infer<typeof contestSchema>;

export default function Contest() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContestFormValues>({
    resolver: zodResolver(contestSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      message: '',
      ageConfirmed: false,
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: ContestFormValues) => {
    if (!user) {
      toast.error('Bitte melde dich an, um am Gewinnspiel teilzunehmen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await api.contests.enter('current', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        birthDate: data.birthDate,
        message: data.message,
      });

      if (error) {
        if (error.includes('already')) {
          toast.error('Mit dieser E-Mail-Adresse wurde bereits teilgenommen.');
        } else {
          throw new Error(error);
        }
        return;
      }

      setSubmitted(true);
      toast.success('Vielen Dank fuer deine Teilnahme!');
      form.reset();
    } catch (error) {
      console.error('Error submitting contest entry:', error);
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-6">
            <Gift className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Gewinnspiel
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mach mit und gewinne exklusive Parfuem-Sets! Fuelle einfach das Formular aus 
            und mit etwas Glueck gehoert der Gewinn dir.
          </p>
        </div>

        {!user && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Anmeldung erforderlich</AlertTitle>
            <AlertDescription>
              Bitte melde dich an, um am Gewinnspiel teilzunehmen.
            </AlertDescription>
          </Alert>
        )}

        {submitted ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Teilnahme erfolgreich!</h2>
              <p className="text-muted-foreground">
                Vielen Dank fuer deine Teilnahme am Gewinnspiel. Wir druecken dir die Daumen!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Teilnahmeformular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vorname</FormLabel>
                          <FormControl>
                            <Input placeholder="Max" {...field} data-testid="input-firstname" />
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
                            <Input placeholder="Mustermann" {...field} data-testid="input-lastname" />
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
                        <FormLabel>E-Mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="max@beispiel.de" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon (optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+49 123 456789" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geburtsdatum</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-birthdate" />
                        </FormControl>
                        <FormDescription>
                          Du musst mindestens 18 Jahre alt sein, um teilnehmen zu koennen.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warum moechtest du gewinnen?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Erzaehle uns, warum du den Gewinn verdient hast..." 
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="ageConfirmed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-age"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Ich bestatige, dass ich mindestens 18 Jahre alt bin
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-terms"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Ich akzeptiere die Teilnahmebedingungen und Datenschutzbestimmungen
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !user}
                    data-testid="button-submit-contest"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Jetzt teilnehmen
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Teilnahmebedingungen</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Teilnahme ab 18 Jahren</li>
            <li>Nur eine Teilnahme pro Person</li>
            <li>Gewinner werden per E-Mail benachrichtigt</li>
            <li>Keine Barauszahlung moeglich</li>
            <li>Rechtsweg ausgeschlossen</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}

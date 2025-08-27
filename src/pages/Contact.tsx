
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  subject: z.string().min(5, 'Betreff muss mindestens 5 Zeichen haben'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen haben'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Create mailto link
    const mailtoLink = `mailto:support@aldenairperfumes.de?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(
      `Name: ${data.name}\nE-Mail: ${data.email}\n\nNachricht:\n${data.message}`
    )}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    toast({
      title: 'E-Mail wird geöffnet',
      description: 'Ihr E-Mail-Client wird mit Ihrer Nachricht geöffnet.',
    });
    
    setIsSubmitting(false);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-luxury-black mb-4">Kontakt</h1>
            <p className="text-luxury-gray text-lg">
              Haben Sie Fragen? Wir sind hier, um Ihnen zu helfen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Kontaktinformationen */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-luxury-black">Kontaktinformationen</CardTitle>
                  <CardDescription>
                    Erreichen Sie uns über die folgenden Kanäle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-luxury-gold" />
                    <div>
                      <p className="font-medium text-luxury-black">E-Mail</p>
                      <p className="text-luxury-gray">support@aldenairperfumes.de</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-luxury-gold" />
                    <div>
                      <p className="font-medium text-luxury-black">Telefon</p>
                      <p className="text-luxury-gray">Mo-Fr: 9:00 - 17:00 Uhr</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-luxury-gold" />
                    <div>
                      <p className="font-medium text-luxury-black">Antwortzeit</p>
                      <p className="text-luxury-gray">Innerhalb von 24 Stunden</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kontaktformular */}
            <Card>
              <CardHeader>
                <CardTitle className="text-luxury-black">Nachricht senden</CardTitle>
                <CardDescription>
                  Füllen Sie das Formular aus und wir melden uns bei Ihnen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ihr vollständiger Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail</FormLabel>
                          <FormControl>
                            <Input placeholder="ihre.email@beispiel.de" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Betreff</FormLabel>
                          <FormControl>
                            <Input placeholder="Worum geht es?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nachricht</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Beschreiben Sie Ihr Anliegen..."
                              className="min-h-[120px]"
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
                      {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Gift, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const contestSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein').max(50),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein').max(50),
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  phone: z.string().min(10, 'Bitte gib eine gültige Telefonnummer ein').optional(),
  birthDate: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  }, 'Du musst mindestens 18 Jahre alt sein'),
  message: z.string().min(10, 'Nachricht muss mindestens 10 Zeichen lang sein').max(500),
  ageConfirmed: z.boolean().refine((val) => val === true, {
    message: 'Du musst bestätigen, dass du mindestens 18 Jahre alt bist',
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Du musst die Teilnahmebedingungen akzeptieren',
  }),
});

type ContestFormValues = z.infer<typeof contestSchema>;

export default function Contest() {
  const { user } = useAuth();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      
      if (!isImage) {
        toast.error(`${file.name} ist kein gültiges Bild`);
        return false;
      }
      if (!isUnder5MB) {
        toast.error(`${file.name} ist zu groß (max. 5MB)`);
        return false;
      }
      return true;
    });

    if (uploadedImages.length + validFiles.length > 3) {
      toast.error('Du kannst maximal 3 Bilder hochladen');
      return;
    }

    setUploadedImages([...uploadedImages, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ContestFormValues) => {
    if (!user) {
      toast.error('Bitte melde dich an, um am Gewinnspiel teilzunehmen.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images to storage
      const imageUrls: string[] = [];
      
      for (const file of uploadedImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('contest-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('contest-images')
          .getPublicUrl(filePath);
        
        imageUrls.push(publicUrl);
      }

      // Save contest entry to database
      const { error: insertError } = await supabase
        .from('contest_entries')
        .insert({
          user_id: user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone || null,
          birth_date: data.birthDate,
          message: data.message,
          images: imageUrls,
        });

      if (insertError) {
        console.error('Error saving contest entry:', insertError);
        throw insertError;
      }

      toast.success('Vielen Dank für deine Teilnahme! Wir melden uns bei dir.');
      form.reset();
      setUploadedImages([]);
    } catch (error) {
      console.error('Error submitting contest entry:', error);
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 mb-6">
            <Gift className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Gewinnspiel
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mach mit und gewinne exklusive Parfüm-Sets! Fülle einfach das Formular aus, 
            lade deine Bilder hoch und mit etwas Glück gehört der Gewinn dir.
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Persönliche Daten
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vorname *</FormLabel>
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
                        <FormLabel>Nachname *</FormLabel>
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
                      <FormLabel>E-Mail *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="max@beispiel.de" {...field} />
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
                        <Input type="tel" placeholder="+49 123 456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Age Verification */}
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Altersverifikation
                </h2>

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geburtsdatum *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Du musst mindestens 18 Jahre alt sein, um teilnehmen zu können.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ageConfirmed"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Ich bestätige, dass ich mindestens 18 Jahre alt bin *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Message */}
              <div className="space-y-4 pt-6 border-t">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warum möchtest du gewinnen? *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Erzähl uns, warum du teilnimmst..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Mindestens 10 Zeichen, maximal 500 Zeichen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Bilder hochladen (optional)
                </h2>
                <p className="text-sm text-muted-foreground">
                  Du kannst bis zu 3 Bilder hochladen (max. 5MB pro Bild)
                </p>

                <div className="space-y-4">
                  {uploadedImages.length < 3 && (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Klicke hier oder ziehe Bilder hierher
                        </p>
                      </label>
                    </div>
                  )}

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="pt-6 border-t">
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Ich akzeptiere die Teilnahmebedingungen und die Datenschutzerklärung *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit */}
              <div className="pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Jetzt teilnehmen'}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            * Pflichtfelder | Teilnahmeschluss: 31.12.2025 | 
            Der Gewinner wird per E-Mail benachrichtigt
          </p>
        </div>
      </div>
    </div>
  );
}

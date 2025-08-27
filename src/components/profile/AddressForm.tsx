
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, X } from 'lucide-react';

interface AddressFormData {
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface Address {
  id: string;
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface AddressFormProps {
  address?: Address | null;
  onClose: () => void;
}

export function AddressForm({ address, onClose }: AddressFormProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddressFormData>({
    defaultValues: {
      type: address?.type || 'shipping',
      first_name: address?.first_name || '',
      last_name: address?.last_name || '',
      street: address?.street || '',
      city: address?.city || '',
      postal_code: address?.postal_code || '',
      country: address?.country || 'Germany',
      is_default: address?.is_default || false,
    }
  });

  const watchType = watch('type');

  const onSubmit = async (data: AddressFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      if (address) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', address.id);

        if (error) throw error;
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            ...data,
            user_id: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: "Adresse gespeichert",
        description: "Ihre Adresse wurde erfolgreich gespeichert.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Fehler",
        description: "Adresse konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">
          {address ? 'Adresse bearbeiten' : 'Neue Adresse hinzufügen'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Adresse-Typ</Label>
            <Select
              value={watchType}
              onValueChange={(value) => setValue('type', value as 'billing' | 'shipping')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipping">Lieferadresse</SelectItem>
                <SelectItem value="billing">Rechnungsadresse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Vorname</Label>
              <Input
                id="first_name"
                {...register('first_name', { required: 'Vorname ist erforderlich' })}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Nachname</Label>
              <Input
                id="last_name"
                {...register('last_name', { required: 'Nachname ist erforderlich' })}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Straße und Hausnummer</Label>
            <Input
              id="street"
              {...register('street', { required: 'Straße ist erforderlich' })}
            />
            {errors.street && (
              <p className="text-sm text-destructive">{errors.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postleitzahl</Label>
              <Input
                id="postal_code"
                {...register('postal_code', { required: 'PLZ ist erforderlich' })}
              />
              {errors.postal_code && (
                <p className="text-sm text-destructive">{errors.postal_code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                {...register('city', { required: 'Stadt ist erforderlich' })}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Land</Label>
            <Select
              value={watch('country')}
              onValueChange={(value) => setValue('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Land auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Germany">Deutschland</SelectItem>
                <SelectItem value="Austria">Österreich</SelectItem>
                <SelectItem value="Switzerland">Schweiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={watch('is_default')}
              onCheckedChange={(checked) => setValue('is_default', checked === true)}
            />
            <Label htmlFor="is_default">Als Standardadresse festlegen</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Adresse speichern'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { sanitizeInput, validatePhoneNumber } from '@/lib/validation';

interface ProfileFormData {
  full_name: string;
  phone: string;
}

export function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setValue('full_name', data.fullName || '');
        setValue('phone', data.phone || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    if (data.phone && data.phone.trim()) {
      const phoneValidation = validatePhoneNumber(data.phone);
      if (!phoneValidation.isValid) {
        toast({
          title: "Fehler",
          description: phoneValidation.message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: sanitizeInput(data.full_name),
          phone: data.phone ? sanitizeInput(data.phone) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "Profil aktualisiert",
        description: "Ihre Daten wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Fehler",
        description: "Ihre Daten konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Vollständiger Name</Label>
        <Input
          id="full_name"
          {...register('full_name', { required: 'Name ist erforderlich' })}
          placeholder="Max Mustermann"
          data-testid="input-profile-name"
        />
        {errors.full_name && (
          <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Telefonnummer</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="+49 123 456789"
          data-testid="input-profile-phone"
        />
        {errors.phone && (
          <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" disabled={loading} data-testid="button-save-profile">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Speichern...
          </>
        ) : (
          'Profil speichern'
        )}
      </Button>
    </form>
  );
}

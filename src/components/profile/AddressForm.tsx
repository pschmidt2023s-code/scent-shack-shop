import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Address } from '@/types/profile';
import { sanitizeInput, validatePostalCode } from '@/lib/validation';

interface AddressFormProps {
  address?: Address | null;
  onSave: () => void;
  onCancel: () => void;
}

const AddressForm = ({ address, onSave, onCancel }: AddressFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'shipping' as 'billing' | 'shipping',
    first_name: '',
    last_name: '',
    street: '',
    city: '',
    postal_code: '',
    country: 'Germany',
    is_default: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type,
        first_name: address.first_name,
        last_name: address.last_name,
        street: address.street,
        city: address.city,
        postal_code: address.postal_code,
        country: address.country,
        is_default: address.is_default,
      });
    }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const postalValidation = validatePostalCode(formData.postal_code, formData.country);
    if (!postalValidation.isValid) {
      toast.error(postalValidation.message);
      return;
    }

    setLoading(true);
    try {
      const addressData = {
        type: formData.type,
        firstName: sanitizeInput(formData.first_name),
        lastName: sanitizeInput(formData.last_name),
        street: sanitizeInput(formData.street),
        city: sanitizeInput(formData.city),
        postalCode: sanitizeInput(formData.postal_code),
        country: sanitizeInput(formData.country),
        isDefault: formData.is_default,
      };

      if (address) {
        const response = await fetch(`/api/addresses/${address.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(addressData),
        });

        if (!response.ok) throw new Error('Failed to update address');
        toast.success('Adresse aktualisiert');
      } else {
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(addressData),
        });

        if (!response.ok) throw new Error('Failed to create address');
        toast.success('Adresse hinzugefügt');
      }

      onSave();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Fehler beim Speichern der Adresse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Adresstyp</Label>
        <Select
          value={formData.type}
          onValueChange={(value: 'billing' | 'shipping') => 
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shipping">Lieferadresse</SelectItem>
            <SelectItem value="billing">Rechnungsadresse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">Vorname</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="last_name">Nachname</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="street">Straße und Hausnummer</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postal_code">Postleitzahl</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="city">Stadt</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="country">Land</Label>
        <Select
          value={formData.country}
          onValueChange={(value) => setFormData({ ...formData, country: value })}
        >
          <SelectTrigger>
            <SelectValue />
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
          checked={formData.is_default}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, is_default: checked as boolean })
          }
        />
        <Label htmlFor="is_default">Als Standardadresse setzen</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Speichern...' : 'Speichern'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;

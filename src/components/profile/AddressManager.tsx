import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import AddressForm from './AddressForm';
import { Address } from '@/types/profile';

const AddressManager = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Fehler beim Laden der Adressen');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success('Adresse gelöscht');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Fehler beim Löschen der Adresse');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_default: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default address');
      }

      await fetchAddresses();
      toast.success('Standardadresse aktualisiert');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Fehler beim Setzen der Standardadresse');
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  if (loading) return <div>Lade Adressen...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Meine Adressen
        </h3>
        <Button 
          onClick={() => setShowForm(true)} 
          size="sm"
          data-testid="button-add-address"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neue Adresse
        </Button>
      </div>

      {showForm || editingAddress ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAddress ? 'Adresse bearbeiten' : 'Neue Adresse hinzufügen'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm
              address={editingAddress}
              onSave={handleFormSave}
              onCancel={() => {
                setShowForm(false);
                setEditingAddress(null);
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Adressen gespeichert</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card 
              key={address.id} 
              className={address.is_default ? 'border-primary' : ''}
              data-testid={`card-address-${address.id}`}
            >
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{address.first_name} {address.last_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.street}<br />
                      {address.postal_code} {address.city}<br />
                      {address.country}
                    </p>
                    {address.is_default && (
                      <span className="text-xs text-primary font-medium">Standardadresse</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingAddress(address)}
                      data-testid={`button-edit-address-${address.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(address.id)}
                      data-testid={`button-delete-address-${address.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Als Standard setzen
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;

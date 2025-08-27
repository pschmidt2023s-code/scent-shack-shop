
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      setAddresses(data as Address[]);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Fehler beim Laden der Adressen');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success('Adresse gelöscht');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Fehler beim Löschen der Adresse');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // First, unset all default addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      await fetchAddresses();
      toast.success('Standardadresse aktualisiert');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Fehler beim Setzen der Standardadresse');
    }
  };

  if (loading) return <div>Lade Adressen...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Meine Adressen</h3>
        <Button 
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Neue Adresse
        </Button>
      </div>

      {showForm && (
        <AddressForm
          address={editingAddress}
          onSave={() => {
            setShowForm(false);
            setEditingAddress(null);
            fetchAddresses();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className={address.is_default ? 'border-blue-500' : ''}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {address.type === 'billing' ? 'Rechnungsadresse' : 'Lieferadresse'}
                  {address.is_default && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      Standard
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAddress(address);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {address.first_name} {address.last_name}
                </p>
                <p>{address.street}</p>
                <p>
                  {address.postal_code} {address.city}
                </p>
                <p>{address.country}</p>
              </div>
              {!address.is_default && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => handleSetDefault(address.id)}
                >
                  Als Standard setzen
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {addresses.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Adressen gefunden
            </h3>
            <p className="text-gray-600 mb-4">
              Fügen Sie Ihre erste Adresse hinzu, um mit dem Einkaufen zu beginnen.
            </p>
            <Button onClick={() => setShowForm(true)}>
              Erste Adresse hinzufügen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddressManager;

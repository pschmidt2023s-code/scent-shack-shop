
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { AddressForm } from './AddressForm';

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

export function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: "Fehler",
        description: "Adressen konnten nicht geladen werden.",
        variant: "destructive",
      });
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

      toast({
        title: "Adresse gelöscht",
        description: "Die Adresse wurde erfolgreich entfernt.",
      });
      
      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Fehler",
        description: "Adresse konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAddress(null);
    loadAddresses();
  };

  if (loading) {
    return <div className="text-center p-4">Lade Adressen...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ihre Adressen</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Neue Adresse
        </Button>
      </div>

      {showForm && (
        <AddressForm
          address={editingAddress}
          onClose={handleFormClose}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <CardTitle className="text-base">
                    {address.first_name} {address.last_name}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Badge variant={address.type === 'billing' ? 'default' : 'secondary'}>
                    {address.type === 'billing' ? 'Rechnung' : 'Lieferung'}
                  </Badge>
                  {address.is_default && (
                    <Badge variant="outline">Standard</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{address.street}</p>
              <p className="text-sm">{address.postal_code} {address.city}</p>
              <p className="text-sm">{address.country}</p>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEdit(address)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Bearbeiten
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Löschen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Adressen gespeichert</p>
          <p className="text-sm">Fügen Sie Ihre erste Adresse hinzu</p>
        </div>
      )}
    </div>
  );
}

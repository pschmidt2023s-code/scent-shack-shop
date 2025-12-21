import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Recycle, Plus, QrCode, Package, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface RefillBottle {
  id: string;
  bottleCode: string;
  variantId: string;
  size: string;
  refillCount: number;
  lastRefillAt: string | null;
  createdAt: string;
  isActive: boolean;
}

interface ProductVariant {
  id: string;
  name: string;
  size: string;
  price: string;
}

export function RefillProgram() {
  const queryClient = useQueryClient();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedSize, setSelectedSize] = useState('50ml');

  const { data: bottles = [], isLoading } = useQuery<RefillBottle[]>({
    queryKey: ['/api/refill/bottles'],
  });

  const { data: products = [] } = useQuery<Array<{ id: string; name: string; variants: ProductVariant[] }>>({
    queryKey: ['/api/products'],
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { variantId: string; size: string }) => {
      const response = await fetch('/api/refill/bottles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to register bottle');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refill/bottles'] });
      toast.success('Flasche erfolgreich registriert!');
      setRegisterDialogOpen(false);
      setSelectedVariant('');
    },
    onError: () => {
      toast.error('Fehler beim Registrieren der Flasche');
    },
  });

  const handleRegister = () => {
    if (!selectedVariant) {
      toast.error('Bitte wähle ein Produkt aus');
      return;
    }
    registerMutation.mutate({ variantId: selectedVariant, size: selectedSize });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Recycle className="w-5 h-5 text-primary" />
            <CardTitle>Nachfüll-Programm</CardTitle>
          </div>
          <CardDescription>
            Registriere deine ALDENAIR Flaschen und spare 20% bei jeder Nachfüllung. Gut für dich und die Umwelt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <QrCode className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">1. Registrieren</p>
                <p className="text-xs text-muted-foreground">Flasche einmalig anmelden</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">2. Einsenden</p>
                <p className="text-xs text-muted-foreground">Leere Flasche zurücksenden</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <Percent className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">3. Sparen</p>
                <p className="text-xs text-muted-foreground">20% Rabatt auf Nachfüllung</p>
              </div>
            </div>
          </div>

          <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-register-bottle">
                <Plus className="w-4 h-4" />
                Neue Flasche registrieren
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Flasche registrieren</DialogTitle>
                <DialogDescription>
                  Wähle das Produkt und die Größe deiner ALDENAIR Flasche.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Produkt und Größe</label>
                  <Select value={selectedVariant} onValueChange={(value) => {
                    setSelectedVariant(value);
                    const variant = products.flatMap(p => p.variants).find(v => v.id === value);
                    if (variant) {
                      setSelectedSize(variant.size.toLowerCase().replace(' ', ''));
                    }
                  }}>
                    <SelectTrigger data-testid="select-product">
                      <SelectValue placeholder="Produkt wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.flatMap((product) =>
                        product.variants
                          .filter((v) => 
                            v.size === '50 ML' || v.size === '50ml' || 
                            v.size === '100 ML' || v.size === '100ml'
                          )
                          .map((variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {product.name} - {variant.size}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={!selectedVariant || registerMutation.isPending}
                  className="w-full"
                  data-testid="button-confirm-register"
                >
                  {registerMutation.isPending ? 'Wird registriert...' : 'Flasche registrieren'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {bottles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meine registrierten Flaschen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bottles.map((bottle) => (
                <div
                  key={bottle.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Recycle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Flasche {bottle.bottleCode}</p>
                      <p className="text-xs text-muted-foreground">
                        {bottle.size} - {bottle.refillCount} Nachfüllungen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {bottle.isActive ? (
                      <Badge variant="default">Aktiv</Badge>
                    ) : (
                      <Badge variant="secondary">Inaktiv</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

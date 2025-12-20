import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Building2, CheckCircle } from "lucide-react";

interface BankSettings {
  recipient: string;
  iban: string;
  bic?: string;
  bankName?: string;
}

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);

  useEffect(() => {
    if (open) {
      fetch('/api/settings/bank')
        .then(res => res.json())
        .then(data => setBankSettings(data))
        .catch(err => console.error('Failed to fetch bank settings:', err));
    }
  }, [open]);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Bitte melden Sie sich an");
      return;
    }

    if (items.length === 0) {
      toast.error("Warenkorb ist leer");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          items: items.map(item => ({
            perfumeId: item.perfume.id,
            variantId: item.variant.id,
            quantity: item.quantity,
            unitPrice: item.variant.price.toString(),
            totalPrice: (item.variant.price * item.quantity).toString()
          })),
          subtotal: total.toString(),
          shippingCost: "0",
          totalAmount: total.toString(),
          paymentMethod: "bank_transfer",
          shippingAddress: user.email
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler bei der Bestellung');
      }
      
      const order = await response.json();
      setOrderNumber(order.orderNumber);
      setOrderComplete(true);
      clearCart();
      toast.success('Bestellung erfolgreich aufgegeben!');

    } catch (error: any) {
      console.error('Fehler:', error);
      toast.error(error.message || 'Fehler beim Bestellvorgang');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderComplete(false);
    setOrderNumber(null);
    onOpenChange(false);
  };

  if (orderComplete) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent data-testid="dialog-order-complete">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              Bestellung erfolgreich
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold">Bestellnummer: {orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                Vielen Dank für Ihre Bestellung! Bitte überweisen Sie den Betrag auf folgendes Konto:
              </p>
              <div className="bg-background p-3 rounded border text-sm space-y-1">
                <p><span className="font-medium">Empfänger:</span> {bankSettings?.recipient || 'ALDENAIR'}</p>
                <p><span className="font-medium">IBAN:</span> {bankSettings?.iban || 'Wird geladen...'}</p>
                {bankSettings?.bic && <p><span className="font-medium">BIC:</span> {bankSettings.bic}</p>}
                {bankSettings?.bankName && <p><span className="font-medium">Bank:</span> {bankSettings.bankName}</p>}
                <p><span className="font-medium">Betrag:</span> {total.toFixed(2)} EUR</p>
                <p><span className="font-medium">Verwendungszweck:</span> {orderNumber}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Nach Zahlungseingang wird Ihre Bestellung versendet.
              </p>
            </div>
            <Button className="w-full" onClick={handleClose} data-testid="button-close-order">
              Schließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-checkout">
        <DialogHeader>
          <DialogTitle>Zahlung per Banküberweisung</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Zwischensumme:</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Versand:</span>
              <span>Kostenlos</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Gesamt:</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Nach Abschluss der Bestellung erhalten Sie die Bankverbindungsdaten für die Überweisung.</p>
          </div>
          <Button 
            className="w-full" 
            onClick={handleCheckout} 
            disabled={loading || items.length === 0}
            data-testid="button-complete-order"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Building2 className="mr-2" />
            )}
            Bestellung abschließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

export default function CheckoutModal({ open, onOpenChange }) {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Warenkorb ist leer");
      return;
    }

    setLoading(true);

    try {
      console.log("Cart Items:", items);

      // Supabase Edge Function aufrufen
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          items: items.map((item) => ({
            name: `${item.perfume.name} - ${item.variant.name}`,
            variant: item.variant.name,
            price: item.variant.price,
            quantity: item.quantity,
          })),
        },
      });

      if (error) {
        console.error("Edge Function Error:", error);
        throw new Error(error.message || "Fehler beim Erstellen der Zahlung");
      }

      if (!data?.url) {
        throw new Error("Keine Checkout-URL erhalten");
      }

      // Weiterleiten zu Stripe Checkout (neuer Tab)
      window.open(data.url, '_blank');
      toast.success("Checkout-Seite geöffnet");
      onOpenChange(false);
    } catch (error) {
      console.error("Stripe-Fehler:", error);
      toast.error(error.message || "Fehler beim Bezahlvorgang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zahlung</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between font-bold">
              <span>Gesamt:</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>
          <Button className="w-full" onClick={handleCheckout} disabled={loading || items.length === 0}>
            {loading ? <Loader2 className="animate-spin" /> : <CreditCard className="mr-2" />}
            Jetzt bezahlen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

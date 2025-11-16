import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.name,
            amount: Math.round(item.price * 100), // Betrag in Cent
            quantity: item.quantity,
          })),
        }),
      });

      const { sessionId } = await response.json();

      const stripe = window.Stripe(window.STRIPE_PK);
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Starten des Checkouts");
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

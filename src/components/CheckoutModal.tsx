import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
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
      // DEBUG: Zeige Keys in Console
      console.log("STRIPE_PK:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      console.log("Cart Items:", items);

      // API aufrufen
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.name,
            amount: Math.round(item.price * 100),
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API-Fehler ${response.status}: ${errorText}`);
      }

      const { sessionId } = await response.json();

      if (!sessionId) {
        throw new Error("Keine Session-ID erhalten");
      }

      // Stripe initialisieren
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error("Stripe.js nicht geladen");
      }

      // Weiterleiten
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
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

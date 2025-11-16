import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

export default function CheckoutModal({ open, onOpenChange }) {
  const { items, total } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

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
      // KORREKTER Aufruf der Edge Function mit richtiger Datenstruktur
      const response = await fetch('https://tqswuibgnkdvrfocwjou.supabase.co/functions/v1/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.perfume.name,      // ✅ RICHTIG!
            amount: Math.round(item.variant.price * 100), // ✅ RICHTIG!
            quantity: item.quantity,
            variant_id: item.variant.id,
            perfume_id: item.perfume.id
          })),
          user_id: user.id,
          total_amount: total
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge Function Fehler ${response.status}: ${errorText}`);
      }
      
      const { url, sessionId } = await response.json();
      
      if (!url) throw new Error('Keine Checkout-URL erhalten');
      
      // Öffne Stripe Checkout in neuem Tab (verhindert iframe-Probleme)
      window.open(url, '_blank');
      toast.success('Stripe Checkout wurde in neuem Tab geöffnet');
      onOpenChange(false);


    } catch (error) {
      console.error('Fehler:', error);
      toast.error(error.message || 'Fehler beim Bezahlvorgang');
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

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

export default function CheckoutModal({ open, onOpenChange }) {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Bitte melden Sie sich an");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('orders').insert({ 
  
  user_id: user?.id, 
  total: finalAmount,
  items: items,
}).select();
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
      } else {
        throw new Error("Keine Checkout-URL erhalten");
      }
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Checkout");
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
            {loading ? <Loader2 className="animate-spin" /> : <CreditCard className="mr-2" />} Jetzt bezahlen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

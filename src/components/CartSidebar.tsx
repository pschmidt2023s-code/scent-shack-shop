
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false); // Close cart sidebar
    navigate('/checkout'); // Navigate to checkout page
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Warenkorb ({itemCount})
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Ihr Warenkorb ist leer</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.perfume.id}-${item.variant.id}`} className="flex gap-3 p-3 border rounded-lg">
                      <img
                        src={item.perfume.image}
                        alt={item.perfume.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-sm">{item.perfume.name}</h3>
                          <p className="text-xs text-muted-foreground">{item.perfume.brand}</p>
                          <p className="text-xs text-muted-foreground">#{item.variant.number} - {item.variant.name}</p>
                          <p className="font-bold">€{item.variant.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.perfume.id, item.variant.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.perfume.id, item.variant.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeFromCart(item.perfume.id, item.variant.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Gesamt:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Zur Kasse gehen
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

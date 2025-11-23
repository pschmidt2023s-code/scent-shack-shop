
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, Package, X } from 'lucide-react';
import { BundleOfferDialog } from '@/components/BundleOfferDialog';
import { supabase } from '@/integrations/supabase/client';

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSidebar({ open, onOpenChange }: CartSidebarProps) {
  const { items, updateQuantity, removeFromCart, total, itemCount, appliedBundle, applyBundle, removeBundle } = useCart();
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<any[]>([]);
  const [showBundleDialog, setShowBundleDialog] = useState(false);
  const [checkedBundleCount, setCheckedBundleCount] = useState(0);

  useEffect(() => {
    const fetchBundles = async () => {
      const { data } = await supabase
        .from('bundle_products')
        .select('*')
        .eq('is_active', true)
        .order('discount_percentage', { ascending: false });
      
      if (data) setBundles(data);
    };
    fetchBundles();
  }, []);

  useEffect(() => {
    if (itemCount !== checkedBundleCount && itemCount >= 3 && !appliedBundle) {
      const availableBundles = bundles.filter(b => 
        (itemCount === 3 && b.name.includes('3')) || 
        (itemCount === 5 && b.name.includes('5'))
      );
      
      if (availableBundles.length > 0) {
        setShowBundleDialog(true);
        setCheckedBundleCount(itemCount);
      }
    }
  }, [itemCount, bundles, appliedBundle, checkedBundleCount]);

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/checkout');
  };

  const handleApplyBundle = (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (bundle) {
      applyBundle(bundleId, bundle.discount_percentage);
    }
  };

  const availableBundles = bundles.filter(b => 
    (itemCount === 3 && b.name.includes('3')) || 
    (itemCount === 5 && b.name.includes('5'))
  );

  return (
    <>
      <BundleOfferDialog
        open={showBundleDialog}
        onOpenChange={setShowBundleDialog}
        bundles={availableBundles}
        onApplyBundle={handleApplyBundle}
        itemCount={itemCount}
      />
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

                {appliedBundle && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Sparset angewendet</p>
                          <p className="text-xs text-green-700">
                            {bundles.find(b => b.id === appliedBundle.bundleId)?.discount_percentage}% Rabatt
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={removeBundle}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

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

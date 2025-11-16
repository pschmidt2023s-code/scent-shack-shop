import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface QuickViewModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
}

const QuickViewModal = ({ open, onClose, product }: QuickViewModalProps) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        brand: product.brand,
        image: product.image,
        category: product.category,
        size: product.size,
        variants: [{
          id: product.variant_id,
          name: product.name,
          price: product.price,
          inStock: product.in_stock,
          product_id: product.id,
          variant_number: product.variant_id,
          stock_quantity: 10,
        }],
      },
      {
        id: product.variant_id,
        name: product.name,
        price: product.price,
        inStock: product.in_stock,
        product_id: product.id,
        variant_number: product.variant_id,
        stock_quantity: 10,
      }
    );
    toast.success("Produkt zum Warenkorb hinzugefügt");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-square">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {!product.in_stock && (
            <Badge className="absolute top-4 left-4" variant="destructive">
              Ausverkauft
            </Badge>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-2xl font-bold">€{product.price?.toFixed(2)}</p>
              {product.original_price && (
                <p className="text-sm text-muted-foreground line-through">
                  €{product.original_price.toFixed(2)}
                </p>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className="min-w-[140px]"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.in_stock ? "In den Warenkorb" : "Ausverkauft"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Sparkles } from 'lucide-react';

interface BundleOffer {
  id: string;
  name: string;
  description: string;
  total_price: number;
  discount_percentage: number;
  quantity_required: number;
}

interface BundleOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundles: BundleOffer[];
  onApplyBundle: (bundleId: string) => void;
  itemCount: number;
}

export function BundleOfferDialog({
  open,
  onOpenChange,
  bundles,
  onApplyBundle,
  itemCount,
}: BundleOfferDialogProps) {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  useEffect(() => {
    if (bundles.length > 0) {
      setSelectedBundle(bundles[0].id);
    }
  }, [bundles]);

  const handleApply = () => {
    if (selectedBundle) {
      onApplyBundle(selectedBundle);
      onOpenChange(false);
    }
  };

  const handleDecline = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">Sparset verfügbar!</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Du hast {itemCount} Produkte im Warenkorb. Spare mit unserem Sparset-Angebot!
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 my-4">
          {bundles.map((bundle) => (
            <button
              key={bundle.id}
              onClick={() => setSelectedBundle(bundle.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedBundle === bundle.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold">{bundle.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {bundle.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      -{bundle.discount_percentage}% Rabatt
                    </Badge>
                    <span className="text-sm font-medium">
                      Nur €{bundle.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="w-full sm:w-auto"
          >
            Nein, danke
          </Button>
          <Button
            onClick={handleApply}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            Sparset anwenden
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

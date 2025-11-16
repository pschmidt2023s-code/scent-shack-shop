import { useState } from 'react';
import { ShoppingCart, Heart, Eye, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ProductHoverActionsProps {
  onQuickView?: () => void;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  onAddToCompare?: () => void;
  isFavorite?: boolean;
  isInComparison?: boolean;
}

export function ProductHoverActions({
  onQuickView,
  onAddToCart,
  onToggleFavorite,
  onAddToCompare,
  isFavorite = false,
  isInComparison = false
}: ProductHoverActionsProps) {
  const [showActions, setShowActions] = useState(false);

  const actions = [
    {
      icon: Eye,
      label: 'Schnellansicht',
      onClick: onQuickView,
      show: !!onQuickView
    },
    {
      icon: ShoppingCart,
      label: 'In den Warenkorb',
      onClick: onAddToCart,
      show: !!onAddToCart
    },
    {
      icon: Heart,
      label: isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten',
      onClick: onToggleFavorite,
      show: !!onToggleFavorite,
      active: isFavorite
    },
    {
      icon: Scale,
      label: isInComparison ? 'Aus Vergleich entfernen' : 'Zum Vergleich',
      onClick: onAddToCompare,
      show: !!onAddToCompare,
      active: isInComparison
    }
  ];

  return (
    <div
      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
        {actions.filter(a => a.show).map((action, index) => (
          <Button
            key={action.label}
            variant={action.active ? "default" : "secondary"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              action.onClick?.();
            }}
            className={cn(
              "w-full justify-start transition-all duration-200",
              showActions
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0",
              action.active && "bg-primary hover:bg-primary/90"
            )}
            style={{
              transitionDelay: `${index * 50}ms`
            }}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

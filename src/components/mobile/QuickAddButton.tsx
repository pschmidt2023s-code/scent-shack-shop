import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAddButtonProps {
  onAdd: () => void;
  disabled?: boolean;
  className?: string;
}

export function QuickAddButton({ onAdd, disabled, className }: QuickAddButtonProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      onAdd();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={disabled || isAdded}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isAdded && "bg-green-500 hover:bg-green-600",
        className
      )}
    >
      <span className={cn(
        "flex items-center gap-2 transition-all duration-300",
        isAdded && "scale-0"
      )}>
        <ShoppingCart className="w-4 h-4" />
        <span className="hidden sm:inline">In den Warenkorb</span>
      </span>
      
      <span className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-300",
        !isAdded && "scale-0"
      )}>
        <Check className="w-5 h-5" />
      </span>
    </Button>
  );
}

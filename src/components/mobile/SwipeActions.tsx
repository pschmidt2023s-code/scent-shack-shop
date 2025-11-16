import { ReactNode, useRef, useState, TouchEvent } from 'react';
import { Heart, ShoppingCart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeActionsProps {
  children: ReactNode;
  onFavorite?: () => void;
  onAddToCart?: () => void;
  onShare?: () => void;
  isFavorite?: boolean;
}

export function SwipeActions({
  children,
  onFavorite,
  onAddToCart,
  onShare,
  isFavorite = false
}: SwipeActionsProps) {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    currentX.current = e.touches[0].clientX;
    const distance = currentX.current - startX.current;
    
    // Limit swipe distance
    if (distance > 0) {
      setSwipeDistance(Math.min(distance, 200));
    } else {
      setSwipeDistance(Math.max(distance, -200));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Execute action based on swipe distance
    if (swipeDistance > 80 && onFavorite) {
      onFavorite();
    } else if (swipeDistance < -80 && onAddToCart) {
      onAddToCart();
    }
    
    // Reset position
    setTimeout(() => setSwipeDistance(0), 100);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left action (Favorite) */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-20 flex items-center justify-center bg-pink-500 transition-opacity",
          swipeDistance > 40 ? "opacity-100" : "opacity-0"
        )}
      >
        <Heart className={cn("w-6 h-6 text-white", isFavorite && "fill-current")} />
      </div>

      {/* Right action (Add to Cart) */}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-20 flex items-center justify-center bg-primary transition-opacity",
          swipeDistance < -40 ? "opacity-100" : "opacity-0"
        )}
      >
        <ShoppingCart className="w-6 h-6 text-white" />
      </div>

      {/* Content */}
      <div
        className="transition-transform touch-pan-y"
        style={{
          transform: `translateX(${swipeDistance}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

import { ReactNode, useRef, useState, TouchEvent, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    // Only allow pull to refresh when at top of page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setCanPull(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!canPull || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!canPull) return;
    setCanPull(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const pullProgress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden",
          isRefreshing ? "h-16" : "h-0"
        )}
        style={{
          height: isRefreshing ? '64px' : `${pullDistance}px`,
          opacity: pullDistance > 20 ? 1 : 0
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <RefreshCw
            className={cn(
              "w-6 h-6 text-primary transition-transform",
              isRefreshing && "animate-spin",
              shouldTrigger && !isRefreshing && "rotate-180"
            )}
          />
          <p className="text-xs text-muted-foreground">
            {isRefreshing
              ? 'Wird aktualisiert...'
              : shouldTrigger
              ? 'Loslassen zum Aktualisieren'
              : 'Ziehen zum Aktualisieren'
            }
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isRefreshing ? '64px' : `${pullDistance}px`})`
        }}
      >
        {children}
      </div>
    </div>
  );
}

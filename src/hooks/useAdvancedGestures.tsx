import { useEffect, useRef, useState } from 'react';

interface GestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => Promise<void>;
  onLongPress?: () => void;
  enableHaptic?: boolean;
  swipeThreshold?: number;
}

export function useAdvancedGestures(options: GestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    onLongPress,
    enableHaptic = true,
    swipeThreshold = 50,
  } = options;

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (enableHaptic && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;

    // Long press detection
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        triggerHaptic('heavy');
        onLongPress();
      }, 500);
    }

    // Pull to refresh detection
    if (onPullToRefresh && window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;

    // Cancel long press on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Pull to refresh
    if (isPulling && onPullToRefresh) {
      const distance = touchEndY.current - touchStartY.current;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
        if (distance > 80) {
          triggerHaptic('light');
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Handle pull to refresh
    if (isPulling && pullDistance > 80 && onPullToRefresh) {
      triggerHaptic('medium');
      await onPullToRefresh();
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    setIsPulling(false);
    setPullDistance(0);

    // Determine swipe direction
    if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
      triggerHaptic('light');

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [options, isPulling, pullDistance]);

  return {
    isPulling,
    pullDistance,
    triggerHaptic,
  };
}

import { useAdvancedGestures } from '@/hooks/useAdvancedGestures';
import { useLocation } from 'react-router-dom';
import { useToast } from './ui/use-toast';

export function GlobalGestures() {
  const location = useLocation();
  const { toast } = useToast();

  // Disable all gestures on admin, checkout, and product pages to prevent navigation interference
  const isDisabledPage = location.pathname.startsWith('/admin') || 
                         location.pathname.startsWith('/checkout') ||
                         location.pathname.startsWith('/product') ||
                         location.pathname.startsWith('/cart');

  const { isPulling, pullDistance } = useAdvancedGestures({
    // Swipe navigation completely disabled - it was causing issues where tapping 
    // buttons would accidentally trigger back navigation on mobile devices
    onSwipeLeft: undefined,
    onSwipeRight: undefined,
    onPullToRefresh: isDisabledPage ? undefined : async () => {
      console.log('Pull to refresh triggered');
      toast({
        title: "Aktualisiert",
        description: "Seite wurde erfolgreich aktualisiert",
      });
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();
    },
    onLongPress: undefined,
    enableHaptic: !isDisabledPage,
    swipeThreshold: 150, // Increased from 50 to prevent accidental triggers
  });

  // Don't render pull indicator on disabled pages
  if (isDisabledPage) {
    return null;
  }

  return (
    <>
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center items-center bg-primary/10 backdrop-blur-sm transition-all pointer-events-none"
          style={{ height: `${pullDistance}px` }}
        >
          <div className="flex flex-col items-center gap-2">
            <svg 
              className="animate-spin text-primary" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24"
              style={{ opacity: pullDistance / 80 }}
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {pullDistance > 80 && (
              <span className="text-xs text-primary font-medium">
                Loslassen zum Aktualisieren
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

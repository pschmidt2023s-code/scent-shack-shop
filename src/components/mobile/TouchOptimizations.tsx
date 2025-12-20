import { useEffect } from 'react';

/**
 * Component that adds mobile touch optimizations
 * - Prevents 300ms click delay
 * - Optimizes touch response
 * - Improves scrolling performance
 */
export function TouchOptimizations() {
  useEffect(() => {
    // Add touch-action to prevent delays
    document.body.style.touchAction = 'manipulation';
    
    // Prevent double-tap zoom on buttons and interactive elements
    const style = document.createElement('style');
    style.textContent = `
      button, a, [role="button"] {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent !important;
        user-select: none;
        -webkit-user-select: none;
      }
      
      /* Allow text selection in inputs for proper keyboard behavior */
      input, textarea, select {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent !important;
        user-select: text;
        -webkit-user-select: text;
      }
      
      /* Remove all tap highlights and visual feedback */
      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
        -webkit-touch-callout: none;
      }
      
      
      /* Mobile touch target sizing for accessibility */
      @media (hover: none) and (pointer: coarse) {
        button, a, [role="button"] {
          min-height: 44px;
          min-width: 44px;
        }
      }
      
      /* Smooth scrolling */
      html {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
    
    // Prevent pull-to-refresh on overscroll (except at top)
    let lastY = 0;
    const preventPullToRefresh = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      if (y > lastY && window.scrollY === 0) {
        // User is pulling down at the top
        // Allow our custom pull-to-refresh to handle it
      }
      lastY = y;
    };
    
    document.addEventListener('touchmove', preventPullToRefresh, { passive: true });
    
    return () => {
      document.removeEventListener('touchmove', preventPullToRefresh);
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
}

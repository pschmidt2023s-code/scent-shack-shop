import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function MobileOptimization() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    // Optimize viewport for mobile devices
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
      );
    }

    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('focus', handleInputFocus);
      input.addEventListener('blur', handleInputBlur);
    });

    // Add mobile-specific classes
    document.body.classList.add('mobile-optimized');
    
    // Optimize scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    (document.body.style as any).webkitOverflowScrolling = 'touch';

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleInputFocus);
        input.removeEventListener('blur', handleInputBlur);
      });
      document.body.classList.remove('mobile-optimized');
    };
  }, [isMobile]);

  const handleInputFocus = () => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  };

  const handleInputBlur = () => {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
      );
    }
  };

  return null;
}
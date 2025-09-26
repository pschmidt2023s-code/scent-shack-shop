import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Basic mobile optimizations
    const optimizeBasics = () => {
      // Add loaded class
      document.documentElement.classList.add('js-loaded');
      
      // Basic viewport optimization
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, user-scalable=yes'
        );
      }
    };

    // Simple image lazy loading without complex observers
    const setupSimpleLazyLoading = () => {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            }
          });
        }, { 
          rootMargin: '50px'
        });

        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });
      }
    };

    // Basic accessibility
    const basicAccessibility = () => {
      // Add ARIA live region
      if (!document.getElementById('aria-live-region')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
        document.body.appendChild(liveRegion);
      }
    };

    // Initialize basic optimizations only
    optimizeBasics();
    setupSimpleLazyLoading();
    basicAccessibility();

  }, []);

  return null;
}
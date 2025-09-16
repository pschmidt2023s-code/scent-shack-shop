import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Mobile Performance Optimizations
    const optimizeMobilePerformance = () => {
      // Reduce main thread blocking
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Non-critical tasks during idle time
          document.documentElement.classList.add('js-loaded');
        });
      }

      // Optimize viewport for mobile
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport && window.innerWidth <= 768) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
        );
      }
    };

    // Enhanced Intersection Observer for progressive loading
    const setupProgressiveLoading = () => {
      if ('IntersectionObserver' in window) {
        // High priority images (above fold)
        const highPriorityObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.setAttribute('aria-label', img.alt || 'Produktbild');
                highPriorityObserver.unobserve(img);
              }
            }
          });
        }, { 
          rootMargin: '20px 0px',
          threshold: 0.01 
        });

        // Standard priority images
        const standardObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                // Add loading delay for better perceived performance
                setTimeout(() => {
                  img.src = img.dataset.src;
                  img.removeAttribute('data-src');
                  img.setAttribute('aria-label', img.alt || 'Produktbild');
                }, 100);
                standardObserver.unobserve(img);
              }
            }
          });
        }, { 
          rootMargin: '100px 0px',
          threshold: 0.1 
        });

        // Observe images based on priority
        document.querySelectorAll('img[data-priority="high"]').forEach(img => {
          highPriorityObserver.observe(img);
        });

        document.querySelectorAll('img[data-src]:not([data-priority="high"])').forEach(img => {
          standardObserver.observe(img);
        });
      }
    };

    // Mobile Touch & Interaction Optimizations
    const optimizeMobileInteractions = () => {
      // Improve tap response time
      document.addEventListener('touchstart', () => {}, { passive: true });

      // Optimize scroll performance
      let ticking = false;
      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            // Update scroll-dependent UI elements
            const scrollY = window.scrollY;
            document.documentElement.style.setProperty('--scroll-y', scrollY + 'px');
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      // Prevent zoom on input focus (mobile)
      if (window.innerWidth <= 768) {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          input.addEventListener('focus', () => {
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
              viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
              );
            }
          });

          input.addEventListener('blur', () => {
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
              viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
              );
            }
          });
        });
      }
    };

    // Accessibility Enhancements
    const enhanceAccessibility = () => {
      // Add focus management for keyboard navigation
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          const focusable = Array.from(document.querySelectorAll(focusableElements));
          const index = focusable.indexOf(document.activeElement as Element);
          
          if (e.shiftKey) {
            const previousElement = focusable[index - 1] || focusable[focusable.length - 1];
            if (previousElement && index === 0) {
              e.preventDefault();
              (previousElement as HTMLElement).focus();
            }
          } else {
            const nextElement = focusable[index + 1] || focusable[0];
            if (nextElement && index === focusable.length - 1) {
              e.preventDefault();
              (nextElement as HTMLElement).focus();
            }
          }
        }
      });

      // Enhanced ARIA live regions for dynamic content
      if (!document.getElementById('aria-live-region')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
      }

      // Improve color contrast in dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      const updateContrast = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          document.documentElement.style.setProperty('--text-contrast', '98%');
        } else {
          document.documentElement.style.setProperty('--text-contrast', '15%');
        }
      };

      updateContrast(prefersDark);
      prefersDark.addEventListener('change', updateContrast);
    };

    // Preload critical resources with priority hints
    const preloadCriticalResources = () => {
      const criticalResources = [
        { href: '/src/assets/hero-perfumes-optimized.webp', as: 'image', priority: 'high' },
        { href: '/src/assets/hero-perfumes-md.webp', as: 'image', priority: 'high' },
        { href: '/src/assets/autoparfum-white-new.png', as: 'image', priority: 'low' }
      ];

      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = resource.as;
        link.href = resource.href;
        if (resource.priority === 'high') {
          link.setAttribute('fetchpriority', 'high');
        }
        document.head.appendChild(link);
      });
    };

    // Initialize all optimizations
    optimizeMobilePerformance();
    setupProgressiveLoading();
    optimizeMobileInteractions();
    enhanceAccessibility();
    preloadCriticalResources();

    // Performance monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }

    // Cleanup function
    return () => {
      document.removeEventListener('touchstart', () => {});
      window.removeEventListener('scroll', () => {});
    };
  }, []);

  return null;
}
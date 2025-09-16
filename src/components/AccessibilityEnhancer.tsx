import { useEffect } from 'react';

export function AccessibilityEnhancer() {
  useEffect(() => {
    // Skip Links for keyboard navigation
    const createSkipLinks = () => {
      if (document.getElementById('skip-links')) return;

      const skipNav = document.createElement('div');
      skipNav.id = 'skip-links';
      skipNav.innerHTML = `
        <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all">
          Zum Hauptinhalt springen
        </a>
        <a href="#navigation" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all">
          Zur Navigation springen
        </a>
      `;
      
      document.body.insertBefore(skipNav, document.body.firstChild);
    };

    // Enhanced focus management
    const enhanceFocusManagement = () => {
      let focusVisible = false;

      // Track if user is using keyboard
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
          focusVisible = true;
          document.body.classList.add('keyboard-user');
        }
      });

      document.addEventListener('mousedown', () => {
        focusVisible = false;
        document.body.classList.remove('keyboard-user');
      });

      // Add focus styles for keyboard users only
      const style = document.createElement('style');
      style.textContent = `
        .keyboard-user *:focus {
          outline: 2px solid hsl(var(--primary)) !important;
          outline-offset: 2px !important;
        }
        
        .keyboard-user button:focus,
        .keyboard-user a:focus,
        .keyboard-user input:focus,
        .keyboard-user textarea:focus,
        .keyboard-user select:focus {
          box-shadow: 0 0 0 2px hsl(var(--primary)), 0 0 0 4px hsla(var(--primary), 0.3) !important;
        }
      `;
      document.head.appendChild(style);
    };

    // ARIA live region announcements
    const createLiveRegion = () => {
      if (document.getElementById('aria-announcements')) return;

      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-announcements';
      liveRegion.setAttribute('aria-live', 'assertive');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);

      // Global announcement function
      (window as any).announceToScreenReader = (message: string) => {
        const region = document.getElementById('aria-announcements');
        if (region) {
          region.textContent = message;
          setTimeout(() => {
            region.textContent = '';
          }, 1000);
        }
      };
    };

    // Color contrast improvements
    const enhanceColorContrast = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
      
      const updateContrast = () => {
        if (prefersHighContrast.matches) {
          document.documentElement.classList.add('high-contrast');
          document.documentElement.style.setProperty('--text-contrast-multiplier', '1.2');
        } else {
          document.documentElement.classList.remove('high-contrast');
          document.documentElement.style.setProperty('--text-contrast-multiplier', '1');
        }
      };

      updateContrast();
      prefersHighContrast.addEventListener('change', updateContrast);
    };

    // Reduced motion support
    const handleReducedMotion = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      const updateMotionPreference = (e: MediaQueryListEvent | MediaQueryList) => {
        if (e.matches) {
          document.documentElement.classList.add('reduce-motion');
          // Disable complex animations
          const style = document.createElement('style');
          style.id = 'reduced-motion-styles';
          style.textContent = `
            .reduce-motion *, 
            .reduce-motion *::before, 
            .reduce-motion *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          `;
          document.head.appendChild(style);
        } else {
          document.documentElement.classList.remove('reduce-motion');
          const style = document.getElementById('reduced-motion-styles');
          if (style) style.remove();
        }
      };

      updateMotionPreference(prefersReducedMotion);
      prefersReducedMotion.addEventListener('change', updateMotionPreference);
    };

    // Touch target size optimization for mobile
    const optimizeTouchTargets = () => {
      if (window.innerWidth <= 768) {
        const style = document.createElement('style');
        style.id = 'mobile-touch-targets';
        style.textContent = `
          @media (max-width: 768px) {
            button, 
            a[role="button"],
            input[type="button"],
            input[type="submit"],
            [role="tab"],
            [role="menuitem"] {
              min-height: 44px !important;
              min-width: 44px !important;
              padding: 12px !important;
            }
            
            /* Increase tap targets for small interactive elements */
            .mobile-tap-target {
              position: relative;
            }
            
            .mobile-tap-target::before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              min-width: 44px;
              min-height: 44px;
              z-index: -1;
            }
          }
        `;
        document.head.appendChild(style);
      }
    };

    // Initialize all accessibility enhancements
    createSkipLinks();
    enhanceFocusManagement();
    createLiveRegion();
    enhanceColorContrast();
    handleReducedMotion();
    optimizeTouchTargets();

    // Add screen reader only utility class
    const srOnlyStyle = document.createElement('style');
    srOnlyStyle.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      .sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }

      .focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `;
    document.head.appendChild(srOnlyStyle);

  }, []);

  return null;
}
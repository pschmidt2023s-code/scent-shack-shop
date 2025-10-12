import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  // Determine transition type based on route
  const getTransitionClass = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return "animate-fade-in-up duration-700 ease-out";
    } else if (path.startsWith('/admin')) {
      return "animate-slide-in-right duration-600 ease-out";
    } else if (path.startsWith('/product') || path === '/products') {
      return "animate-scale-in duration-500 ease-out";
    } else {
      return "animate-fade-in duration-400 ease-out";
    }
  };

  return (
    <div className="relative min-h-screen">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground animate-pulse">Lädt...</p>
          </div>
        </div>
      )}
      <div className={`transition-all will-change-transform ${getTransitionClass()} ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {displayChildren}
      </div>
    </div>
  );
}
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  
  // Determine transition type based on route
  const getTransitionClass = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return "animate-fade-in duration-500 ease-out";
    } else if (path.startsWith('/product') || path === '/products') {
      return "animate-slide-up duration-600 ease-out";
    } else {
      return "animate-fade-in duration-400 ease-out";
    }
  };

  return (
    <div className={`transition-all ${getTransitionClass()}`}>
      {children}
    </div>
  );
}
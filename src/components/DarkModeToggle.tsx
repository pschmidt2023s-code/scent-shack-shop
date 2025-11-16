import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setIsTransitioning(true);
    
    document.body.style.transition = 'opacity 0.3s ease-in-out';
    document.body.style.opacity = '0.8';
    
    setTimeout(() => {
      setTheme(theme === 'dark' ? 'light' : 'dark');
      
      setTimeout(() => {
        document.body.style.opacity = '1';
        setTimeout(() => {
          document.body.style.transition = '';
          setIsTransitioning(false);
        }, 300);
      }, 100);
    }, 150);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10">
        <div className="w-5 h-5" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative w-10 h-10 overflow-hidden transition-all duration-300 hover:scale-110 hover:bg-accent/20 group focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      aria-label={isDark ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
    >
      {/* Icon with rotation animation */}
      <div className={`transition-all duration-500 ${isTransitioning ? 'rotate-180 scale-0' : 'rotate-0 scale-100'}`}>
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
        ) : (
          <Moon className="h-5 w-5 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        )}
      </div>
      
      {/* Ripple effect */}
      {isTransitioning && (
        <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
      )}
    </Button>
  );
}
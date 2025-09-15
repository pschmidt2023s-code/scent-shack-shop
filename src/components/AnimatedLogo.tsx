import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface AnimatedLogoProps {
  className?: string;
}

export function AnimatedLogo({ className = "" }: AnimatedLogoProps) {
  const { theme } = useTheme();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-60 animate-pulse" />
      
      {/* Light mode logo - Sun */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
          theme === 'dark' 
            ? 'opacity-0 rotate-180 scale-50' 
            : 'opacity-100 rotate-0 scale-100'
        }`}
      >
        <Sun className="w-full h-full text-orange-500 animate-spin" style={{ animationDuration: '8s' }} />
        {/* Sun rays */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-3 bg-orange-400 opacity-70 animate-pulse"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: '0 20px',
              transform: `rotate(${i * 45}deg) translateY(-25px)`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      
      {/* Dark mode logo - Moon */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-180 scale-50'
        }`}
      >
        <Moon className="w-full h-full text-blue-400" />
        {/* Stars */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full animate-twinkle"
            style={{
              left: `${20 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
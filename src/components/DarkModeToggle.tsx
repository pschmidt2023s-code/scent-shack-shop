import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    setIsTransitioning(true)
    setTheme(theme === 'dark' ? 'light' : 'dark')
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10 sm:w-12 sm:h-12">
        <div className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative w-10 h-10 sm:w-12 sm:h-12 overflow-hidden transition-all duration-500 hover:scale-110 hover:bg-accent/20 border border-transparent hover:border-accent/30 group"
      aria-label="Toggle theme"
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
        isTransitioning 
          ? 'bg-gradient-to-br from-primary/40 to-accent/40 opacity-100 scale-110' 
          : 'bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100'
      }`} />
      
      {/* Sun Icon */}
      <Sun 
        className={`absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 m-auto transition-all duration-1000 ease-in-out text-orange-500 ${
          theme === 'dark' 
            ? 'opacity-0 rotate-180 scale-0 blur-sm' 
            : 'opacity-100 rotate-0 scale-100 blur-0'
        } ${isTransitioning ? 'animate-pulse' : ''}`} 
      />
      
      {/* Moon Icon */}
      <Moon 
        className={`absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 m-auto transition-all duration-1000 ease-in-out text-blue-400 ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100 blur-0' 
            : 'opacity-0 -rotate-180 scale-0 blur-sm'
        } ${isTransitioning ? 'animate-pulse' : ''}`} 
      />
      
      {/* Animated particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full transition-all duration-1000 ${
              theme === 'dark' ? 'bg-blue-300' : 'bg-yellow-300'
            } ${
              theme === 'dark' 
                ? 'opacity-60 animate-pulse' 
                : 'opacity-30 animate-bounce'
            } ${isTransitioning ? 'opacity-100 scale-150' : ''}`}
            style={{
              left: `${20 + i * 10}%`,
              top: `${15 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </Button>
  )
}
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-12 h-12">
        <div className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-12 h-12 overflow-hidden transition-all duration-500 hover:scale-110 hover:bg-accent/20 border border-transparent hover:border-accent/30 group"
      aria-label="Toggle theme"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Sun Icon */}
      <Sun 
        className={`absolute inset-0 w-5 h-5 m-auto transition-all duration-700 ease-in-out text-orange-500 ${
          theme === 'dark' 
            ? 'opacity-0 rotate-180 scale-75' 
            : 'opacity-100 rotate-0 scale-100'
        }`} 
      />
      
      {/* Moon Icon */}
      <Moon 
        className={`absolute inset-0 w-5 h-5 m-auto transition-all duration-700 ease-in-out text-blue-400 ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-180 scale-75'
        }`} 
      />
      
      {/* Animated particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full transition-all duration-1000 ${
              theme === 'dark' ? 'bg-blue-300' : 'bg-yellow-300'
            } ${
              theme === 'dark' 
                ? 'opacity-40 animate-pulse' 
                : 'opacity-20 animate-bounce'
            }`}
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
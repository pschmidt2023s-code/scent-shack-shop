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
    
    // Add fade out effect to body
    document.body.style.transition = 'opacity 0.3s ease-in-out'
    document.body.style.opacity = '0.8'
    
    setTimeout(() => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
      
      // Fade back in
      setTimeout(() => {
        document.body.style.opacity = '1'
        setTimeout(() => {
          document.body.style.transition = ''
          setIsTransitioning(false)
        }, 500)
      }, 50)
    }, 150)
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
      className={`relative w-10 h-10 sm:w-12 sm:h-12 overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-accent/20 group ${
        isTransitioning 
          ? 'border-2 border-accent animate-[fadeInOut_0.8s_ease-in-out]' 
          : 'border border-transparent hover:border-accent/30'
      }`}
      aria-label="Toggle theme"
    >
      {/* Background circle with gradient */}
      <div className={`absolute inset-1 rounded-full transition-all duration-500 ${
        isTransitioning 
          ? 'bg-gradient-to-br from-primary/60 to-accent/60 opacity-100 scale-110' 
          : theme === 'dark'
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 opacity-80 group-hover:opacity-100'
            : 'bg-gradient-to-br from-orange-200 to-yellow-200 opacity-80 group-hover:opacity-100'
      }`} />
      
      {/* Simple indicator dot */}
      <div className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-slate-300 top-2 left-2 sm:top-2.5 sm:left-2.5' 
          : 'bg-orange-400 bottom-2 right-2 sm:bottom-2.5 sm:right-2.5'
      } ${isTransitioning ? 'animate-pulse scale-150' : ''}`} />
      
      {/* Ripple effect on transition */}
      {isTransitioning && (
        <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
      )}
    </Button>
  )
}
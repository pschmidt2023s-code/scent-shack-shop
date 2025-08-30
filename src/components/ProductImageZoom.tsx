import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface ProductImageZoomProps {
  src: string
  alt: string
  className?: string
}

export function ProductImageZoom({ src, alt, className }: ProductImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current || !isZoomed) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsZoomed(true)
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
  }

  return (
    <div 
      ref={imageRef}
      className={cn(
        "relative overflow-hidden cursor-zoom-in group rounded-lg",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-transform duration-300 ease-out",
          isZoomed && "scale-150"
        )}
        style={
          isZoomed
            ? {
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
              }
            : {}
        }
      />
      
      {/* Zoom indicator */}
      <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {isZoomed ? (
          <ZoomOut className="w-4 h-4" />
        ) : (
          <ZoomIn className="w-4 h-4" />
        )}
      </div>
      
      {/* Zoom hint */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Bewegen zum Zoomen
      </div>
    </div>
  )
}
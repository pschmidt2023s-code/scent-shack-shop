import { ChevronRight, Home } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link 
        to="/" 
        className="flex items-center text-muted-foreground hover:text-luxury-gold transition-colors duration-200"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          {item.href && !item.isActive ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-luxury-gold transition-colors duration-200 font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              "font-medium",
              item.isActive ? "text-luxury-black" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
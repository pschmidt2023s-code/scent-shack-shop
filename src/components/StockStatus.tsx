import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react'

interface StockStatusProps {
  stock: number
  lowStockThreshold?: number
  className?: string
}

export function StockStatus({ stock, lowStockThreshold = 5, className }: StockStatusProps) {
  const getStatusInfo = () => {
    if (stock <= 0) {
      return {
        icon: XCircle,
        text: 'Ausverkauft',
        variant: 'destructive' as const,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700'
      }
    } else if (stock <= lowStockThreshold) {
      return {
        icon: AlertCircle,
        text: `Nur noch ${stock} verfügbar`,
        variant: 'secondary' as const,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700'
      }
    } else if (stock <= 10) {
      return {
        icon: Clock,
        text: 'Wenige verfügbar',
        variant: 'outline' as const,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700'
      }
    } else {
      return {
        icon: CheckCircle,
        text: 'Auf Lager',
        variant: 'default' as const,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700'
      }
    }
  }

  const { icon: Icon, text, variant, bgColor, textColor } = getStatusInfo()

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${textColor}`} />
      <span className={`text-xs font-medium ${textColor}`}>
        {text}
      </span>
    </div>
  )
}

// Alternative minimal version as badge
export function StockBadge({ stock, lowStockThreshold = 5, className }: StockStatusProps) {
  const getVariant = () => {
    if (stock <= 0) return 'destructive' as const
    if (stock <= lowStockThreshold) return 'secondary' as const
    return 'default' as const
  }

  const getText = () => {
    if (stock <= 0) return 'Ausverkauft'
    if (stock <= lowStockThreshold) return `${stock} verfügbar`
    return 'Auf Lager'
  }

  return (
    <Badge variant={getVariant()} className={className}>
      {getText()}
    </Badge>
  )
}
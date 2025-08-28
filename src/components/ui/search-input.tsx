import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  isLoading?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, type, onClear, isLoading, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className={cn(
        "relative flex items-center transition-all duration-300",
        isFocused && "scale-[1.02]",
        className
      )}>
        <Search className={cn(
          "absolute left-3 h-4 w-4 transition-colors duration-200",
          isFocused ? "text-luxury-gold" : "text-muted-foreground"
        )} />
        <Input
          type={type}
          className={cn(
            "pl-9 pr-9 transition-all duration-300 bg-white/50 backdrop-blur-sm",
            "border-2 border-transparent hover:border-luxury-gold/20",
            "focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20",
            isFocused && "shadow-elegant"
          )}
          ref={ref}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 h-7 w-7 p-0 hover:bg-luxury-gold/10"
            onClick={onClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-luxury-gold border-t-transparent" />
          </div>
        )}
      </div>
    )
  }
)

SearchInput.displayName = "SearchInput"

export { SearchInput }
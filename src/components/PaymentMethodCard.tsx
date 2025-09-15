import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PaymentMethodCardProps {
  value: string;
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive';
  timing: string;
  timingColor: 'green' | 'orange' | 'blue';
  isSelected: boolean;
  iconBg: string;
  children?: React.ReactNode;
}

export function PaymentMethodCard({
  value,
  id,
  icon: Icon,
  title,
  description,
  badge,
  badgeVariant = 'default',
  timing,
  timingColor,
  isSelected,
  iconBg,
  children
}: PaymentMethodCardProps) {
  const timingColorClasses = {
    green: 'text-green-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600'
  };

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg cursor-pointer",
        isSelected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <div className="flex items-center space-x-3 p-4">
        <RadioGroupItem value={value} id={id} />
        <Label htmlFor={id} className="flex items-center gap-3 cursor-pointer flex-1">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-base">{title}</div>
              {badge && (
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {description}
            </div>
          </div>
          <div className="text-right">
            <div className={cn("text-xs font-medium", timingColorClasses[timingColor])}>
              {timing}
            </div>
          </div>
        </Label>
      </div>
      {isSelected && children && (
        <div className="px-4 pb-4 pt-0 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
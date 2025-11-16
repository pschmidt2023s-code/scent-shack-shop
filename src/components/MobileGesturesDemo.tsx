import { useState } from 'react';
import { useAdvancedGestures } from '@/hooks/useAdvancedGestures';
import { Card } from './ui/card';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, RotateCw } from 'lucide-react';

export function MobileGesturesDemo() {
  const [lastGesture, setLastGesture] = useState<string>('Keine Geste erkannt');
  const [refreshCount, setRefreshCount] = useState(0);

  const { isPulling, pullDistance } = useAdvancedGestures({
    onSwipeLeft: () => setLastGesture('← Swipe Left'),
    onSwipeRight: () => setLastGesture('→ Swipe Right'),
    onSwipeUp: () => setLastGesture('↑ Swipe Up'),
    onSwipeDown: () => setLastGesture('↓ Swipe Down'),
    onPullToRefresh: async () => {
      setLastGesture('🔄 Pull to Refresh');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRefreshCount(prev => prev + 1);
    },
    onLongPress: () => setLastGesture('⏱️ Long Press'),
    enableHaptic: true,
    swipeThreshold: 50,
  });

  return (
    <div className="space-y-4 p-4">
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex justify-center py-2 bg-primary/10 backdrop-blur-sm transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <RotateCw 
            className="text-primary animate-spin" 
            style={{ opacity: pullDistance / 80 }}
          />
        </div>
      )}

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Advanced Mobile Gestures</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Swipe Left</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ArrowRight className="h-4 w-4" />
            <span>Swipe Right</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ArrowUp className="h-4 w-4" />
            <span>Swipe Up</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ArrowDown className="h-4 w-4" />
            <span>Swipe Down</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <RotateCw className="h-4 w-4" />
            <span>Pull to Refresh (am Seitenanfang)</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <span>⏱️ Long Press (500ms halten)</span>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Letzte Geste:</p>
          <p className="text-lg font-bold text-primary">{lastGesture}</p>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>✨ Haptic Feedback aktiviert</p>
          <p>🔄 Refresh Count: {refreshCount}</p>
          <p>📱 Funktioniert nur auf Touch-Geräten</p>
        </div>
      </Card>
    </div>
  );
}

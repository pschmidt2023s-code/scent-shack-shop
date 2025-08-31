import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdminLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <div className="h-8 w-64 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
          <div className="h-4 w-96 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
        </div>

        <div className="mb-6">
          <div className="h-12 w-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
        </div>

        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                      <div className="h-3 w-24 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-16 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                      <div className="h-6 w-20 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChatLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Sessions List Skeleton */}
      <div className="lg:col-span-1">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <div className="h-6 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
          </CardHeader>
          <CardContent className="flex-1 p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 rounded-lg border animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                    <div className="h-4 w-20 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                  </div>
                  <div className="h-5 w-8 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                </div>
                <div className="h-3 w-24 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface Skeleton */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <div className="h-6 w-48 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded-full mx-auto" />
              <div className="h-4 w-64 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SmoothLoader({ message = "Lädt..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-luxury-gold/60 rounded-full animate-ping" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
}

export function TabContentLoader() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="h-6 w-48 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 w-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                <div className="h-4 w-3/4 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
                <div className="h-4 w-1/2 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
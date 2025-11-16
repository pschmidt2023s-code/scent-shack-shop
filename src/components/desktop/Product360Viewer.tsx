import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { RotateCw } from "lucide-react";

interface Product360ViewerProps {
  images: string[];
  alt: string;
}

const Product360Viewer = ({ images, alt }: Product360ViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;
    const sensitivity = 5;

    if (Math.abs(diff) > sensitivity) {
      const direction = diff > 0 ? -1 : 1;
      const newIndex = (currentIndex + direction + images.length) % images.length;
      setCurrentIndex(newIndex);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  if (images.length === 0) {
    return (
      <Card className="aspect-square flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Keine 360° Ansicht verfügbar</p>
      </Card>
    );
  }

  return (
    <Card
      ref={containerRef}
      className="relative aspect-square overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <img
        src={images[currentIndex]}
        alt={`${alt} - Ansicht ${currentIndex + 1}`}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
        <RotateCw className="w-4 h-4 animate-spin-slow" />
        <span className="text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
      </div>

      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
        360° Ansicht
      </div>
    </Card>
  );
};

export default Product360Viewer;

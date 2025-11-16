import { useState, useRef, TouchEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ProductZoomProps {
  open: boolean;
  onClose: () => void;
  image: string;
  alt: string;
}

const ProductZoom = ({ open, onClose, image, alt }: ProductZoomProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastDistance, setLastDistance] = useState(0);
  const [lastCenter, setLastCenter] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touches: React.TouchList) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setLastDistance(getDistance(e.touches));
      setLastCenter(getCenter(e.touches));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDistance = getDistance(e.touches);
      const newCenter = getCenter(e.touches);

      // Calculate zoom
      const scaleChange = newDistance / lastDistance;
      const newScale = Math.min(Math.max(scale * scaleChange, 1), 4);

      // Calculate pan
      const dx = newCenter.x - lastCenter.x;
      const dy = newCenter.y - lastCenter.y;

      setScale(newScale);
      setPosition({
        x: position.x + dx,
        y: position.y + dy,
      });

      setLastDistance(newDistance);
      setLastCenter(newCenter);
    }
  };

  const handleTouchEnd = () => {
    if (scale < 1.1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleClose = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-full h-full p-0 bg-black/95">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 backdrop-blur-sm"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
          Zoom: {Math.round(scale * 100)}%
        </div>

        <div
          ref={imageRef}
          className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={image}
            alt={alt}
            className="max-w-full max-h-full object-contain transition-transform"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            }}
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductZoom;

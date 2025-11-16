import { useState, useEffect, useRef } from 'react';
import { Box, Camera, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';
import type { Perfume } from '@/types/perfume';

interface ARProductViewerProps {
  perfume: Perfume;
}

export function ARProductViewer({ perfume }: ARProductViewerProps) {
  const { toast } = useToast();
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Simplified AR support check - allow almost all devices with camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsARSupported(true);
    } else {
      setIsARSupported(false);
    }
  }, []);

  const startARSession = async () => {
    try {
      // Request camera access for AR
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsARActive(true);

        toast({
          title: "AR-Modus aktiviert",
          description: "Richten Sie die Kamera auf eine Oberfläche",
        });

        // Simulate AR placement overlay
        drawAROverlay();
      }
    } catch (error) {
      console.error('AR Session Error:', error);
      toast({
        title: "Kamera-Zugriff verweigert",
        description: "Bitte erlauben Sie den Kamera-Zugriff für AR",
        variant: "destructive",
      });
    }
  };

  const drawAROverlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isARActive) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw AR product placeholder
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const boxSize = 200;

      // Draw 3D box representation
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        centerX - boxSize / 2,
        centerY - boxSize / 2,
        boxSize,
        boxSize
      );

      // Draw product info
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(centerX - 100, centerY + boxSize / 2 + 10, 200, 60);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(perfume.name, centerX, centerY + boxSize / 2 + 35);
      ctx.font = '14px Arial';
      ctx.fillText(`${perfume.variants[0]?.price}€`, centerX, centerY + boxSize / 2 + 55);

      requestAnimationFrame(draw);
    };

    draw();
  };

  const stopARSession = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsARActive(false);
  };

  const captureARPhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${perfume.name}-AR.png`;
        a.click();
        
        toast({
          title: "Foto gespeichert",
          description: "Ihr AR-Foto wurde heruntergeladen!",
        });
      }
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AR Produktansicht</h3>
        </div>

        {isARActive ? (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover opacity-0"
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={captureARPhoto}
              >
                <Camera className="h-4 w-4 mr-2" />
                Foto machen
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={stopARSession}
              >
                AR beenden
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Platzieren Sie das Produkt virtuell in Ihrem Raum
            </p>
            
            <Button
              onClick={startARSession}
              className="w-full"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              AR-Ansicht starten
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              💡 Funktioniert auf den meisten Smartphones mit Kamera
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>✨ 360° Ansicht</p>
          <p>📏 Größenverhältnisse sehen</p>
          <p>📸 Foto für Social Media</p>
        </div>
      </div>
    </Card>
  );
}

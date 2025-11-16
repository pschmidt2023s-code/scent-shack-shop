import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

interface ProductVideoProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
}

export function ProductVideo({ videoUrl, thumbnailUrl, title }: ProductVideoProps) {
  const [open, setOpen] = useState(false);

  if (!videoUrl) return null;

  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
  const thumb = thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '');

  return (
    <>
      <Card
        className="relative overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-video bg-muted">
          {thumb && (
            <img
              src={thumb}
              alt={title || 'Produktvideo'}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        </div>
        {title && (
          <div className="p-3 bg-card">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">Klicken um Video anzusehen</p>
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative aspect-video bg-black">
            <iframe
              src={embedUrl}
              title={title || 'Produktvideo'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Button } from '@/components/ui/button';
import { Share2, Facebook, Instagram, Mail, Link as LinkIcon, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SocialShareButtons({
  url = window.location.href,
  title = 'Entdecke dieses Parfüm',
  description = 'Schaue dir dieses tolle Produkt an!',
  image,
  variant = 'ghost',
  size = 'sm'
}: SocialShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link kopiert!",
        description: "Der Link wurde in die Zwischenablage kopiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Link konnte nicht kopiert werden.",
        variant: "destructive"
      });
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%20${encodedUrl}`,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="w-4 h-4 mr-2" />
          Teilen
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Native Share (Mobile) */}
        {navigator.share && (
          <DropdownMenuItem onClick={shareViaWebShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Teilen...
          </DropdownMenuItem>
        )}
        
        {/* WhatsApp */}
        <DropdownMenuItem asChild>
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </a>
        </DropdownMenuItem>

        {/* Facebook */}
        <DropdownMenuItem asChild>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
            <Facebook className="w-4 h-4 mr-2" />
            Facebook
          </a>
        </DropdownMenuItem>

        {/* Email */}
        <DropdownMenuItem asChild>
          <a href={shareLinks.email}>
            <Mail className="w-4 h-4 mr-2" />
            E-Mail
          </a>
        </DropdownMenuItem>

        {/* Copy Link */}
        <DropdownMenuItem onClick={copyToClipboard}>
          <LinkIcon className="w-4 h-4 mr-2" />
          Link kopieren
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

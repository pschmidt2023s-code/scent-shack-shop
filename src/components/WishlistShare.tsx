import { useState } from 'react';
import { Share2, Copy, Mail, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function WishlistShare() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [title, setTitle] = useState('Meine Favoriten');
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    if (!user) {
      toast.error('Bitte melde dich an, um deine Favoriten zu teilen');
      return;
    }

    setLoading(true);
    try {
      // Generate unique share code
      const code = `WL${Date.now().toString(36).toUpperCase()}`;
      
      const { error } = await supabase.from('wishlist_shares').insert({
        user_id: user.id,
        share_code: code,
        title,
        is_public: isPublic,
      });

      if (error) throw error;

      setShareCode(code);
      toast.success('Teilbarer Link erstellt!');
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Fehler beim Erstellen des Links');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/wishlist/${shareCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const link = `${window.location.origin}/wishlist/${shareCode}`;
    const text = `Schau dir meine Favoriten bei ALDENAIR an: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaEmail = () => {
    const link = `${window.location.origin}/wishlist/${shareCode}`;
    const subject = encodeURIComponent('Meine ALDENAIR Favoriten');
    const body = encodeURIComponent(`Schau dir meine Lieblings-Parfüms an:\n\n${link}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Favoriten teilen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Favoriten teilen</DialogTitle>
          <DialogDescription>
            Teile deine Lieblings-Parfüms mit Freunden und Familie
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareCode ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Titel (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Meine Sommerparfüms"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Öffentlich teilen</Label>
                  <p className="text-xs text-muted-foreground">
                    Jeder mit dem Link kann deine Favoriten sehen
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>

              <Button onClick={generateShareLink} disabled={loading} className="w-full">
                {loading ? 'Erstelle Link...' : 'Teilbaren Link erstellen'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Dein teilbarer Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/wishlist/${shareCode}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={copyLink}
                    size="icon"
                    variant="outline"
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={shareViaWhatsApp}
                  variant="outline"
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button onClick={shareViaEmail} variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  E-Mail
                </Button>
              </div>

              <Button
                onClick={() => {
                  setShareCode('');
                  setTitle('Meine Favoriten');
                }}
                variant="ghost"
                className="w-full"
              >
                Neuen Link erstellen
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

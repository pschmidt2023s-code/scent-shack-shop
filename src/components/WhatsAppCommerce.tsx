import { useState } from 'react';
import { Share2, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';
import type { Perfume } from '@/types/perfume';

interface WhatsAppCommerceProps {
  perfume: Perfume;
  variant?: any;
}

export function WhatsAppCommerce({ perfume, variant }: WhatsAppCommerceProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const shareToWhatsApp = () => {
    setIsSharing(true);
    const productUrl = `${window.location.origin}/product/${perfume.id}`;
    const selectedVariant = variant || perfume.variants[0];
    const message = `🌟 ${perfume.name} by ${perfume.brand}\n💰 ${selectedVariant?.price}€\n\n${selectedVariant?.description || 'Entdecke diesen exklusiven Duft!'}\n\n🛒 Jetzt bestellen: ${productUrl}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Auf WhatsApp geteilt",
      description: "Das Produkt wurde erfolgreich geteilt!",
    });
    
    setTimeout(() => setIsSharing(false), 1000);
  };

  const orderViaWhatsApp = () => {
    const phoneNumber = '4915123456789'; // Replace with actual business number
    const productUrl = `${window.location.origin}/product/${perfume.id}`;
    const message = `Hallo! Ich möchte folgendes Produkt bestellen:\n\n🌟 ${perfume.name}\n💰 ${variant?.price || perfume.variants[0]?.price}€\n🔗 ${productUrl}`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp geöffnet",
      description: "Vervollständigen Sie Ihre Bestellung im Chat!",
    });
  };

  const openWhatsAppSupport = () => {
    const phoneNumber = '4915123456789'; // Replace with actual support number
    const message = `Hallo! Ich habe eine Frage zu: ${perfume.name}`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold">WhatsApp Commerce</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          onClick={orderViaWhatsApp}
          className="w-full justify-start gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Per WhatsApp bestellen
        </Button>
        
        <Button
          variant="outline"
          onClick={shareToWhatsApp}
          disabled={isSharing}
          className="w-full justify-start gap-2"
        >
          <Share2 className="h-4 w-4" />
          Produkt teilen
        </Button>
        
        <Button
          variant="outline"
          onClick={openWhatsAppSupport}
          className="w-full justify-start gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          Support kontaktieren
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        💬 Schnelle Antwortzeit: ~2 Min
      </p>
    </Card>
  );
}

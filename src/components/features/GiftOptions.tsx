import { useState } from 'react';
import { Gift, Calendar, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface GiftOptionsProps {
  onChange: (options: GiftOptionsData) => void;
}

export interface GiftOptionsData {
  isGift: boolean;
  giftWrapping: boolean;
  recipientName?: string;
  recipientEmail?: string;
  giftMessage?: string;
  sendGiftNotification: boolean;
  notificationDate?: string;
}

export function GiftOptions({ onChange }: GiftOptionsProps) {
  const [isGift, setIsGift] = useState(false);
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [sendNotification, setSendNotification] = useState(false);
  const [notificationDate, setNotificationDate] = useState('');

  const updateOptions = (updates: Partial<GiftOptionsData>) => {
    const newOptions = {
      isGift,
      giftWrapping,
      recipientName,
      recipientEmail,
      giftMessage,
      sendGiftNotification: sendNotification,
      notificationDate,
      ...updates,
    };
    onChange(newOptions);
  };

  const handleIsGiftChange = (checked: boolean) => {
    setIsGift(checked);
    updateOptions({ isGift: checked });
  };

  const handleGiftWrappingChange = (checked: boolean) => {
    setGiftWrapping(checked);
    updateOptions({ giftWrapping: checked });
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="is-gift"
            checked={isGift}
            onCheckedChange={(checked) => handleIsGiftChange(checked as boolean)}
            data-testid="checkbox-is-gift"
          />
          <Label htmlFor="is-gift" className="flex items-center gap-2 cursor-pointer">
            <Gift className="w-4 h-4" />
            Als Geschenk versenden
          </Label>
        </div>
      </CardHeader>

      {isGift && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Geschenkverpackung</p>
                <p className="text-xs text-muted-foreground">Elegante Verpackung mit Schleife (+4,99 EUR)</p>
              </div>
            </div>
            <Switch
              checked={giftWrapping}
              onCheckedChange={handleGiftWrappingChange}
              data-testid="switch-gift-wrapping"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipient-name">Empfänger Name</Label>
              <Input
                id="recipient-name"
                placeholder="Name des Empfängers"
                value={recipientName}
                onChange={(e) => {
                  setRecipientName(e.target.value);
                  updateOptions({ recipientName: e.target.value });
                }}
                data-testid="input-recipient-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Empfänger E-Mail</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="email@beispiel.de"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  updateOptions({ recipientEmail: e.target.value });
                }}
                data-testid="input-recipient-email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gift-message">Geschenknachricht</Label>
            <Textarea
              id="gift-message"
              placeholder="Eine persönliche Nachricht für den Empfänger..."
              value={giftMessage}
              onChange={(e) => {
                setGiftMessage(e.target.value);
                updateOptions({ giftMessage: e.target.value });
              }}
              rows={3}
              data-testid="textarea-gift-message"
            />
            <p className="text-xs text-muted-foreground">Max. 500 Zeichen</p>
          </div>

          <div className="space-y-3 p-3 rounded-md bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Geschenkbenachrichtigung</p>
                  <p className="text-xs text-muted-foreground">Empfänger per E-Mail informieren</p>
                </div>
              </div>
              <Switch
                checked={sendNotification}
                onCheckedChange={(checked) => {
                  setSendNotification(checked);
                  updateOptions({ sendGiftNotification: checked });
                }}
                data-testid="switch-notification"
              />
            </div>

            {sendNotification && (
              <div className="space-y-2">
                <Label htmlFor="notification-date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Benachrichtigung senden am
                </Label>
                <Input
                  id="notification-date"
                  type="date"
                  value={notificationDate}
                  onChange={(e) => {
                    setNotificationDate(e.target.value);
                    updateOptions({ notificationDate: e.target.value });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-notification-date"
                />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

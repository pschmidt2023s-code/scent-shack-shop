import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Push-Benachrichtigungen werden nicht unterstützt');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast.success('Benachrichtigungen aktiviert!');
      await subscribeToPush();
      return true;
    } else if (result === 'denied') {
      toast.error('Benachrichtigungen wurden abgelehnt');
      return false;
    }

    return false;
  };

  const subscribeToPush = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;

      const registration = await navigator.serviceWorker.ready;
      
      // Generate VAPID key (in production, use server-generated keys)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBmYRJcY2a5lHoJRr6jk';
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(sub);

      // Save subscription to backend
      if (user) {
        await supabase.from('push_subscriptions').upsert({
          user_id: user.id,
          subscription_data: JSON.parse(JSON.stringify(sub)),
        });
      }

      console.log('Push subscription created:', sub);
    } catch (error) {
      console.error('Error subscribing to push:', error);
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
      
      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id);
      }
      
      toast.success('Benachrichtigungen deaktiviert');
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('ALDENAIR', {
        body: 'Test-Benachrichtigung erfolgreich!',
        icon: '/lovable-uploads/6b3ca60c-7598-4385-8d87-42839dc00836.png',
        badge: '/lovable-uploads/6b3ca60c-7598-4385-8d87-42839dc00836.png',
      });
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    unsubscribe,
    sendTestNotification,
    isSupported: 'Notification' in window,
  };
}

// Helper function
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

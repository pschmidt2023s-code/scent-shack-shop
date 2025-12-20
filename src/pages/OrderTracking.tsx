import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  CheckCircle2, 
  Truck, 
  Home, 
  Clock,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  shippingAddressData?: {
    firstName?: string;
    lastName?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  items?: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    productName?: string;
    variantName?: string;
  }>;
}

const ORDER_STAGES = [
  { key: 'pending', label: 'Bestellt', icon: Package, description: 'Bestellung eingegangen' },
  { key: 'processing', label: 'In Bearbeitung', icon: Clock, description: 'Wird verpackt' },
  { key: 'shipped', label: 'Versendet', icon: Truck, description: 'Unterwegs zu Ihnen' },
  { key: 'delivered', label: 'Zugestellt', icon: Home, description: 'Erfolgreich geliefert' },
];

function getOrderProgress(status: string): number {
  switch (status) {
    case 'pending':
    case 'pending_payment':
      return 0;
    case 'paid':
    case 'processing':
      return 33;
    case 'shipped':
      return 66;
    case 'delivered':
    case 'completed':
      return 100;
    case 'cancelled':
      return -1;
    default:
      return 0;
  }
}

function getStageStatus(stageKey: string, orderStatus: string): 'completed' | 'current' | 'upcoming' {
  const stageOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = stageOrder.indexOf(
    orderStatus === 'paid' ? 'processing' : 
    orderStatus === 'completed' ? 'delivered' : 
    orderStatus === 'pending_payment' ? 'pending' :
    orderStatus
  );
  const stageIndex = stageOrder.indexOf(stageKey);
  
  if (stageIndex < currentIndex) return 'completed';
  if (stageIndex === currentIndex) return 'current';
  return 'upcoming';
}

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Bestellung nicht gefunden');
        } else if (response.status === 401) {
          setError('Bitte melden Sie sich an, um Ihre Bestellung zu sehen');
        } else {
          setError('Fehler beim Laden der Bestellung');
        }
        return;
      }

      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Bestellung wird geladen...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center gap-4">
                <Package className="w-16 h-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold">{error || 'Bestellung nicht gefunden'}</h2>
                <p className="text-muted-foreground text-center">
                  Überprüfen Sie die Bestellnummer oder melden Sie sich an.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" asChild>
                    <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Zur Startseite</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">Anmelden</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = getOrderProgress(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile" data-testid="link-back-profile">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-order-number">Bestellung #{order.orderNumber}</h1>
            <p className="text-muted-foreground">
              Bestellt am {new Date(order.createdAt).toLocaleDateString('de-DE', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {isCancelled ? (
          <Card className="border-destructive">
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 rounded-full bg-destructive/10">
                  <Package className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-destructive">Bestellung storniert</h2>
                <p className="text-muted-foreground">Diese Bestellung wurde storniert.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                <span>Sendungsverfolgung</span>
                <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                  {progress === 100 ? 'Zugestellt' : `${progress}% abgeschlossen`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="relative">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(progress, 5)}%` }}
                    data-testid="progress-bar"
                  />
                </div>
                <div className="absolute -top-1 left-0 right-0 flex justify-between">
                  {ORDER_STAGES.map((stage, index) => {
                    const stageStatus = getStageStatus(stage.key, order.status);
                    return (
                      <div 
                        key={stage.key}
                        className="relative flex flex-col items-center"
                        style={{ left: index === 0 ? '0' : index === ORDER_STAGES.length - 1 ? '0' : 'auto' }}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            stageStatus === 'completed' 
                              ? 'bg-primary border-primary' 
                              : stageStatus === 'current'
                              ? 'bg-primary border-primary animate-pulse'
                              : 'bg-background border-muted-foreground/30'
                          }`}
                        >
                          {stageStatus === 'completed' && (
                            <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {ORDER_STAGES.map((stage) => {
                  const stageStatus = getStageStatus(stage.key, order.status);
                  const StageIcon = stage.icon;
                  return (
                    <div 
                      key={stage.key}
                      className={`text-center space-y-2 p-3 rounded-md transition-colors ${
                        stageStatus === 'current' 
                          ? 'bg-primary/5 border border-primary/20' 
                          : stageStatus === 'completed'
                          ? 'opacity-70'
                          : 'opacity-40'
                      }`}
                    >
                      <StageIcon className={`w-6 h-6 mx-auto ${
                        stageStatus === 'current' ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className={`text-sm font-medium ${
                        stageStatus === 'current' ? 'text-primary' : ''
                      }`}>
                        {stage.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                    </div>
                  );
                })}
              </div>

              {order.trackingNumber && (
                <div className="bg-muted/50 rounded-md p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Sendungsnummer</p>
                      <p className="font-mono font-medium" data-testid="text-tracking-number">{order.trackingNumber}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={`https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${order.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="link-dhl-tracking"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Bei DHL verfolgen
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Bestelldetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Lieferadresse</h4>
                {order.shippingAddressData ? (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{order.shippingAddressData.firstName} {order.shippingAddressData.lastName}</p>
                    <p>{order.shippingAddressData.street}</p>
                    <p>{order.shippingAddressData.postalCode} {order.shippingAddressData.city}</p>
                    <p>{order.shippingAddressData.country || 'Deutschland'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Adresse verfügbar</p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Zahlungsstatus</h4>
                <Badge variant={order.paymentStatus === 'completed' || order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                  {order.paymentStatus === 'completed' || order.paymentStatus === 'paid' ? 'Bezahlt' : 
                   order.paymentStatus === 'pending' ? 'Ausstehend' : 
                   order.paymentStatus === 'refunded' ? 'Erstattet' : order.paymentStatus}
                </Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Artikel</h4>
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.productName || 'Produkt'}</p>
                        {item.variantName && (
                          <p className="text-sm text-muted-foreground">{item.variantName}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Menge: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{(Number(item.unitPrice) * item.quantity).toFixed(2)} EUR</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Keine Artikeldetails verfügbar</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Gesamtsumme</span>
              <span data-testid="text-total-amount">{Number(order.totalAmount).toFixed(2)} EUR</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/contact" data-testid="link-contact">
              Fragen zur Bestellung? Kontaktieren Sie uns
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

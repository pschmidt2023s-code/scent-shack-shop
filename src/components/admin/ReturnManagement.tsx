import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package2, CheckCircle, XCircle, Image } from 'lucide-react';
import { getPerfumeNameById } from '@/lib/perfume-utils';

interface Return {
  id: string;
  userId: string;
  orderId: string;
  reason: string;
  status: string;
  adminNotes: string | null;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    orderItems: {
      perfumeId: string;
      variantId: string;
      quantity: number;
    }[];
  };
  profile: {
    fullName: string;
  } | null;
}

export default function ReturnManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<Return[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    if (user) {
      loadReturns();
    }
  }, [user]);

  const loadReturns = async () => {
    try {
      const response = await fetch('/api/admin/returns', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReturns(data || []);
      } else {
        setReturns([]);
      }
    } catch (error) {
      console.error('Error loading returns:', error);
      toast({
        title: 'Fehler',
        description: 'Retouren konnten nicht geladen werden',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (returnId: string, action: 'approve' | 'reject', notes?: string) => {
    setActionLoading(true);
    
    try {
      const response = await fetch(`/api/admin/returns/${returnId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes: notes || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      await loadReturns();
      toast({
        title: 'Erfolg',
        description: `Retoure wurde ${action === 'approve' ? 'genehmigt' : 'abgelehnt'} und der Kunde wurde benachrichtigt.`,
      });

      setIsDialogOpen(false);
      setSelectedReturn(null);
      setAdminNotes('');
      setActionType(null);
    } catch (error) {
      console.error('Error updating return:', error);
      toast({
        title: 'Fehler',
        description: 'Retoure konnte nicht aktualisiert werden',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openActionDialog = (returnItem: Return, action: 'approve' | 'reject') => {
    setSelectedReturn(returnItem);
    setActionType(action);
    setAdminNotes(returnItem.adminNotes || '');
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Package2 },
      approved: { variant: 'default' as const, icon: CheckCircle },
      rejected: { variant: 'destructive' as const, icon: XCircle },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status === 'pending' ? 'Ausstehend' : status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Retouren werden geladen...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="w-5 h-5" />
            Retouren-Verwaltung ({returns.length})
          </CardTitle>
          <CardDescription>
            Verwalten Sie Retouren-Anfragen von Kunden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {returns.map((returnItem) => (
              <div key={returnItem.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">#{returnItem.order?.orderNumber}</h4>
                      {getStatusBadge(returnItem.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Kunde: {returnItem.profile?.fullName || 'Unbekannt'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Eingereicht: {new Date(returnItem.createdAt).toLocaleDateString('de-DE')} um {new Date(returnItem.createdAt).toLocaleTimeString('de-DE')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bestellwert: EUR{(parseFloat(String(returnItem.order?.totalAmount || 0)) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h5 className="text-sm font-medium">Grund der Retoure:</h5>
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {returnItem.reason}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium">Artikel:</h5>
                    <div className="text-sm text-muted-foreground">
                      {returnItem.order?.orderItems?.map((item, index) => (
                        <div key={index}>
                          {item.quantity}x {getPerfumeNameById(item.perfumeId, item.variantId)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {returnItem.images && returnItem.images.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Bilder ({returnItem.images.length}):
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {returnItem.images.map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Return evidence ${index + 1}`}
                              className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                              onClick={() => window.open(imageUrl, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {returnItem.adminNotes && (
                    <div>
                      <h5 className="text-sm font-medium">Admin Notizen:</h5>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {returnItem.adminNotes}
                      </p>
                    </div>
                  )}
                </div>

                {returnItem.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => openActionDialog(returnItem, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Genehmigen
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openActionDialog(returnItem, 'reject')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Ablehnen
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {returns.length === 0 && (
              <div className="text-center py-8">
                <Package2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Keine Retouren-Anfragen gefunden.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Retoure {actionType === 'approve' ? 'genehmigen' : 'ablehnen'}
            </DialogTitle>
            <DialogDescription>
              {selectedReturn && (
                <>
                  Bestellung: #{selectedReturn.order?.orderNumber}
                  <br />
                  Kunde: {selectedReturn.profile?.fullName || 'Unbekannt'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedReturn && (
              <div className="bg-muted p-3 rounded">
                <h5 className="font-medium mb-1">Grund der Retoure:</h5>
                <p className="text-sm">{selectedReturn.reason}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                {actionType === 'approve' ? 'Anweisungen für den Kunden (optional):' : 'Grund für die Ablehnung:'}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'z.B. Rücksendeetikett wird per E-Mail verschickt...'
                    : 'Bitte geben Sie den Grund für die Ablehnung an...'
                }
                className="mt-1"
                rows={4}
              />
              {actionType === 'reject' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Dieser Grund wird dem Kunden per E-Mail mitgeteilt.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => selectedReturn && handleAction(selectedReturn.id, actionType!, adminNotes)}
              disabled={actionLoading || (actionType === 'reject' && !adminNotes.trim())}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actionType === 'approve' ? 'Genehmigen' : 'Ablehnen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

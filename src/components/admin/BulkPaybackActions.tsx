import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckSquare, XCircle, Loader2 } from 'lucide-react';

interface PaybackEarning {
  id: string;
  user_id: string;
  amount: number;
  percentage: number;
  status: string;
  earned_at: string;
  profiles?: {
    full_name: string;
  };
}

interface BulkPaybackActionsProps {
  earnings: PaybackEarning[];
  onUpdate: () => void;
}

export function BulkPaybackActions({ earnings, onUpdate }: BulkPaybackActionsProps) {
  const [selectedEarnings, setSelectedEarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pendingEarnings = earnings.filter(e => e.status === 'pending');

  const toggleSelection = (earningId: string) => {
    setSelectedEarnings(prev => 
      prev.includes(earningId) 
        ? prev.filter(id => id !== earningId)
        : [...prev, earningId]
    );
  };

  const selectAll = () => {
    setSelectedEarnings(pendingEarnings.map(e => e.id));
  };

  const clearSelection = () => {
    setSelectedEarnings([]);
  };

  const bulkUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (selectedEarnings.length === 0) {
      toast.error('Bitte wählen Sie mindestens eine Gutschrift aus');
      return;
    }

    setLoading(true);
    
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      if (status === 'approved') {
        // Group earnings by user for efficient balance updates
        const userBalanceUpdates = new Map<string, number>();
        
        selectedEarnings.forEach(earningId => {
          const earning = earnings.find(e => e.id === earningId);
          if (earning) {
            const currentAmount = userBalanceUpdates.get(earning.user_id) || 0;
            userBalanceUpdates.set(earning.user_id, currentAmount + earning.amount);
          }
        });

        // Update all earnings statuses in parallel
        await supabase
          .from('payback_earnings')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: currentUser?.id
          })
          .in('id', selectedEarnings);

        // Update user balances in parallel
        const balanceUpdates = Array.from(userBalanceUpdates.entries()).map(async ([userId, amount]) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('payback_balance')
            .eq('id', userId)
            .single();

          const currentBalance = profile?.payback_balance || 0;
          const newBalance = currentBalance + amount;

          return supabase
            .from('profiles')
            .update({ payback_balance: newBalance })
            .eq('id', userId);
        });

        await Promise.all(balanceUpdates);
        
      } else {
        // Just update the earnings status for rejections
        await supabase
          .from('payback_earnings')
          .update({
            status: 'rejected',
            approved_by: currentUser?.id
          })
          .in('id', selectedEarnings);
      }

      toast.success(
        `${selectedEarnings.length} Gutschrift(en) ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}`
      );
      
      setSelectedEarnings([]);
      onUpdate();
      
    } catch (error) {
      console.error('Error bulk updating earnings:', error);
      toast.error('Fehler beim Massenupdate der Gutschriften');
    } finally {
      setLoading(false);
    }
  };

  if (pendingEarnings.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-luxury-gold/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          Massenaktionen für Payback-Gutschriften
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={selectedEarnings.length === pendingEarnings.length}
            >
              Alle auswählen ({pendingEarnings.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={selectedEarnings.length === 0}
            >
              Auswahl aufheben
            </Button>
          </div>
          
          {selectedEarnings.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedEarnings.length} ausgewählt
              </span>
              <Button
                onClick={() => bulkUpdateStatus('approved')}
                disabled={loading}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '✓'}
                Alle genehmigen
              </Button>
              <Button
                onClick={() => bulkUpdateStatus('rejected')}
                disabled={loading}
                size="sm"
                variant="destructive"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Alle ablehnen
              </Button>
            </div>
          )}
        </div>

        {/* Selection List */}
        <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/20">
          {pendingEarnings.map((earning) => (
            <div key={earning.id} className="flex items-center space-x-2 p-2 hover:bg-muted/40 rounded">
              <Checkbox
                id={earning.id}
                checked={selectedEarnings.includes(earning.id)}
                onCheckedChange={() => toggleSelection(earning.id)}
              />
              <label
                htmlFor={earning.id}
                className="flex-1 text-sm cursor-pointer"
              >
                {earning.profiles?.full_name} - €{earning.amount.toFixed(2)}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
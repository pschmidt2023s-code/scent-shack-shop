import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit2, Save, X, Crown, Gift } from 'lucide-react';

interface CustomerTier {
  id: string;
  tier_name: string;
  base_cashback_bonus: number;
  description: string;
  min_lifetime_purchases: number;
  priority: number;
  is_active: boolean;
}

interface CashbackBonus {
  id: string;
  bonus_name: string;
  bonus_type: string;
  bonus_percentage: number;
  description: string;
  is_active: boolean;
}

interface CustomerTiersSettingsProps {
  onUpdate?: () => void;
}

export function CustomerTiersSettings({ onUpdate }: CustomerTiersSettingsProps) {
  const [tiers, setTiers] = useState<CustomerTier[]>([]);
  const [bonuses, setBonuses] = useState<CashbackBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<CustomerTier | null>(null);
  const [editingBonus, setEditingBonus] = useState<CashbackBonus | null>(null);
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [isAddingBonus, setIsAddingBonus] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tiersRes, bonusesRes] = await Promise.all([
        supabase
          .from('customer_tiers')
          .select('*')
          .order('priority', { ascending: false }),
        supabase
          .from('cashback_bonuses')
          .select('*')
          .order('bonus_type'),
      ]);

      if (tiersRes.data) setTiers(tiersRes.data);
      if (bonusesRes.data) setBonuses(bonusesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const saveTier = async (tier: Partial<CustomerTier>) => {
    try {
      if (tier.id) {
        // Update
        const { error } = await supabase
          .from('customer_tiers')
          .update(tier)
          .eq('id', tier.id);
        if (error) throw error;
        toast.success('Kundenstufe aktualisiert');
      } else {
        // Insert - validate required fields
        if (!tier.tier_name) {
          toast.error('Stufen-Name ist erforderlich');
          return;
        }
        const { error } = await supabase
          .from('customer_tiers')
          .insert([{
            tier_name: tier.tier_name,
            base_cashback_bonus: tier.base_cashback_bonus ?? 0,
            description: tier.description ?? '',
            min_lifetime_purchases: tier.min_lifetime_purchases ?? 0,
            priority: tier.priority ?? 1,
            is_active: tier.is_active ?? true
          }]);
        if (error) throw error;
        toast.success('Kundenstufe erstellt');
      }
      setEditingTier(null);
      setIsAddingTier(false);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving tier:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const saveBonus = async (bonus: Partial<CashbackBonus>) => {
    try {
      if (bonus.id) {
        // Update
        const { error } = await supabase
          .from('cashback_bonuses')
          .update(bonus)
          .eq('id', bonus.id);
        if (error) throw error;
        toast.success('Bonus aktualisiert');
      } else {
        // Insert - validate required fields
        if (!bonus.bonus_name || !bonus.bonus_type || bonus.bonus_percentage === undefined) {
          toast.error('Alle Pflichtfelder müssen ausgefüllt werden');
          return;
        }
        const { error } = await supabase
          .from('cashback_bonuses')
          .insert([{
            bonus_name: bonus.bonus_name,
            bonus_type: bonus.bonus_type,
            bonus_percentage: bonus.bonus_percentage,
            description: bonus.description ?? '',
            is_active: bonus.is_active ?? true
          }]);
        if (error) throw error;
        toast.success('Bonus erstellt');
      }
      setEditingBonus(null);
      setIsAddingBonus(false);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving bonus:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const toggleTierStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('customer_tiers')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      toast.success('Status aktualisiert');
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling tier:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const toggleBonusStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('cashback_bonuses')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      toast.success('Status aktualisiert');
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling bonus:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Lädt Kundenstufen...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Kundenstufen */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Kundenstufen
            </h3>
            <p className="text-sm text-muted-foreground">
              Verwalte Kundenstufen mit unterschiedlichen Cashback-Boni
            </p>
          </div>
          <Dialog open={isAddingTier} onOpenChange={setIsAddingTier}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Neue Stufe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neue Kundenstufe erstellen</DialogTitle>
              </DialogHeader>
              <TierForm
                onSave={saveTier}
                onCancel={() => setIsAddingTier(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stufe</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-right">Cashback-Bonus</TableHead>
                <TableHead className="text-right">Min. Einkaufswert</TableHead>
                <TableHead>Priorität</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-medium">{tier.tier_name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {tier.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-primary">
                      +{tier.base_cashback_bonus}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {tier.min_lifetime_purchases.toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{tier.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={tier.is_active}
                      onCheckedChange={() => toggleTierStatus(tier.id, tier.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Kundenstufe bearbeiten</DialogTitle>
                        </DialogHeader>
                        <TierForm
                          tier={tier}
                          onSave={saveTier}
                          onCancel={() => setEditingTier(null)}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Cashback-Boni */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-500" />
              Zusätzliche Cashback-Boni
            </h3>
            <p className="text-sm text-muted-foreground">
              Definiere zusätzliche Boni für Newsletter, Geburtstag, etc.
            </p>
          </div>
          <Dialog open={isAddingBonus} onOpenChange={setIsAddingBonus}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Neuer Bonus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Bonus erstellen</DialogTitle>
              </DialogHeader>
              <BonusForm
                onSave={saveBonus}
                onCancel={() => setIsAddingBonus(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bonus-Name</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-right">Bonus %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonuses.map((bonus) => (
                <TableRow key={bonus.id}>
                  <TableCell className="font-medium">{bonus.bonus_name}</TableCell>
                  <TableCell>
                    <Badge>{bonus.bonus_type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {bonus.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-green-600">
                      +{bonus.bonus_percentage}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={bonus.is_active}
                      onCheckedChange={() => toggleBonusStatus(bonus.id, bonus.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bonus bearbeiten</DialogTitle>
                        </DialogHeader>
                        <BonusForm
                          bonus={bonus}
                          onSave={saveBonus}
                          onCancel={() => setEditingBonus(null)}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Card className="p-4 bg-muted">
        <h4 className="font-semibold mb-2">💡 Wie funktioniert das Cashback-System?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Basis-Cashback:</strong> Wird pro Produkt festgelegt (z.B. 5%)</li>
          <li>• <strong>Kundenstufen-Bonus:</strong> Premium-Kunde bekommt zusätzlich 6,5%</li>
          <li>• <strong>Zusatz-Boni:</strong> Newsletter-Abonnent bekommt weitere 1,5%</li>
          <li>• <strong>Gesamt-Cashback:</strong> 5% + 6,5% + 1,5% = 13% auf das Produkt</li>
        </ul>
      </Card>
    </div>
  );
}

// Tier Form Component
function TierForm({ 
  tier, 
  onSave, 
  onCancel 
}: { 
  tier?: CustomerTier; 
  onSave: (tier: Partial<CustomerTier>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<CustomerTier>>(
    tier || {
      tier_name: '',
      base_cashback_bonus: 0,
      description: '',
      min_lifetime_purchases: 0,
      priority: 1,
      is_active: true,
    }
  );

  return (
    <div className="space-y-4">
      <div>
        <Label>Stufen-Name</Label>
        <Input
          value={formData.tier_name}
          onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
          placeholder="z.B. Premium"
        />
      </div>
      <div>
        <Label>Cashback-Bonus (%)</Label>
        <Input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={formData.base_cashback_bonus}
          onChange={(e) =>
            setFormData({ ...formData, base_cashback_bonus: Number(e.target.value) })
          }
        />
      </div>
      <div>
        <Label>Mindest-Einkaufswert (€)</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={formData.min_lifetime_purchases}
          onChange={(e) =>
            setFormData({ ...formData, min_lifetime_purchases: Number(e.target.value) })
          }
        />
      </div>
      <div>
        <Label>Priorität</Label>
        <Input
          type="number"
          min="0"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label>Beschreibung</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Beschreibung der Kundenstufe"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={() => onSave(formData)}>
          <Save className="h-4 w-4 mr-2" />
          Speichern
        </Button>
      </div>
    </div>
  );
}

// Bonus Form Component
function BonusForm({ 
  bonus, 
  onSave, 
  onCancel 
}: { 
  bonus?: CashbackBonus; 
  onSave: (bonus: Partial<CashbackBonus>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<CashbackBonus>>(
    bonus || {
      bonus_name: '',
      bonus_type: 'newsletter',
      bonus_percentage: 0,
      description: '',
      is_active: true,
    }
  );

  return (
    <div className="space-y-4">
      <div>
        <Label>Bonus-Name</Label>
        <Input
          value={formData.bonus_name}
          onChange={(e) => setFormData({ ...formData, bonus_name: e.target.value })}
          placeholder="z.B. Newsletter-Bonus"
        />
      </div>
      <div>
        <Label>Bonus-Typ</Label>
        <Input
          value={formData.bonus_type}
          onChange={(e) => setFormData({ ...formData, bonus_type: e.target.value })}
          placeholder="z.B. newsletter, birthday, first_order"
        />
      </div>
      <div>
        <Label>Bonus-Prozentsatz (%)</Label>
        <Input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={formData.bonus_percentage}
          onChange={(e) =>
            setFormData({ ...formData, bonus_percentage: Number(e.target.value) })
          }
        />
      </div>
      <div>
        <Label>Beschreibung</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Beschreibung des Bonus"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={() => onSave(formData)}>
          <Save className="h-4 w-4 mr-2" />
          Speichern
        </Button>
      </div>
    </div>
  );
}

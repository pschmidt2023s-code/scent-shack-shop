import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X } from 'lucide-react';
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

interface LoyaltyRule {
  id: string;
  rule_name: string;
  rule_type: string;
  points_earned: number;
  is_active: boolean;
  priority: number;
  conditions: any;
}

interface LoyaltyRulesSettingsProps {
  onUpdate?: () => void;
}

export function LoyaltyRulesSettings({ onUpdate }: LoyaltyRulesSettingsProps) {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loyalty_rules')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast.error('Fehler beim Laden der Regeln');
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('loyalty_rules')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success('Regel aktualisiert');
      fetchRules();
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const updateRulePoints = async (id: string, points: number) => {
    try {
      const { error } = await supabase
        .from('loyalty_rules')
        .update({ points_earned: points })
        .eq('id', id);

      if (error) throw error;
      toast.success('Punkte aktualisiert');
      setEditing(null);
      fetchRules();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating points:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Lädt Loyalty-Regeln...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Loyalty-Punkte Regeln</h3>
        <p className="text-sm text-muted-foreground">
          Konfiguriere, wie Kunden Treuepunkte verdienen können
        </p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Regelname</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead className="text-right">Punkte</TableHead>
              <TableHead>Priorität</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Keine Regeln vorhanden
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.rule_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.rule_type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {editing === rule.id ? (
                      <Input
                        type="number"
                        min="0"
                        defaultValue={rule.points_earned}
                        className="w-20 text-right"
                        onBlur={(e) => updateRulePoints(rule.id, Number(e.target.value))}
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-primary">
                        {rule.points_earned} Punkte
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{rule.priority}</TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(editing === rule.id ? null : rule.id)}
                    >
                      {editing === rule.id ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Card className="p-4 bg-muted">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tipp:</strong> Höhere Prioritäten werden zuerst angewendet. Deaktiviere Regeln,
          die nicht mehr verwendet werden sollen.
        </p>
      </Card>
    </div>
  );
}

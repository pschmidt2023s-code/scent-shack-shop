import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
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

interface SystemSetting {
  setting_key: string;
  setting_value: any;
  description: string;
}

export function LoyaltySettings() {
  const [rules, setRules] = useState<LoyaltyRule[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [rulesRes, settingsRes] = await Promise.all([
        supabase.from('loyalty_rules').select('*').order('priority', { ascending: false }),
        supabase
          .from('system_settings')
          .select('*')
          .eq('category', 'loyalty')
          .order('setting_key'),
      ]);

      if (rulesRes.data) setRules(rulesRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
      toast.success('Einstellung gespeichert');
      fetchData();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Fehler beim Speichern');
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
      fetchData();
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
      fetchData();
    } catch (error) {
      console.error('Error updating points:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  if (loading) {
    return <div>Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Treueprogramm Einstellungen</h2>
        <p className="text-muted-foreground mb-6">
          Konfiguriere Punktevergabe und Regeln für das Treueprogramm
        </p>

        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Allgemeine Einstellungen</h3>
            <div className="grid gap-4">
              {settings.map((setting) => (
                <div key={setting.setting_key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label className="font-semibold">{setting.description}</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Input
                        type="number"
                        value={setting.setting_value.points || setting.setting_value.points_per_euro || 0}
                        onChange={(e) => {
                          const newValue = {
                            ...setting.setting_value,
                            [setting.setting_value.points !== undefined ? 'points' : 'points_per_euro']:
                              parseInt(e.target.value),
                          };
                          updateSetting(setting.setting_key, newValue);
                        }}
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">Punkte</span>
                    </div>
                  </div>
                  <Switch
                    checked={setting.setting_value.enabled}
                    onCheckedChange={(checked) =>
                      updateSetting(setting.setting_key, {
                        ...setting.setting_value,
                        enabled: checked,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Loyalty Rules */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Punkteregeln</h3>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Neue Regel
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regel</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Punkte</TableHead>
                  <TableHead>Priorität</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.rule_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rule.rule_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {editing === rule.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            defaultValue={rule.points_earned}
                            className="w-24"
                            id={`points-${rule.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`points-${rule.id}`) as HTMLInputElement;
                              updateRulePoints(rule.id, parseInt(input.value));
                            }}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{rule.points_earned}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditing(rule.id)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => toggleRule(rule.id, rule.is_active)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Tier Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tier-Einstellungen</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: 'Bronze', min: 0, max: 499, color: '#CD7F32' },
                { name: 'Silber', min: 500, max: 1499, color: '#C0C0C0' },
                { name: 'Gold', min: 1500, max: 4999, color: '#FFD700' },
                { name: 'Platin', min: 5000, max: Infinity, color: '#E5E4E2' },
              ].map((tier) => (
                <Card key={tier.name} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <h4 className="font-semibold">{tier.name}</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Min. Punkte</Label>
                      <Input type="number" value={tier.min} className="mt-1" />
                    </div>
                    {tier.max !== Infinity && (
                      <div>
                        <Label className="text-xs">Max. Punkte</Label>
                        <Input type="number" value={tier.max} className="mt-1" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

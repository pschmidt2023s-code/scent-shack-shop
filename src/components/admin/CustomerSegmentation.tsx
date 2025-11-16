import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Plus, Trash2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Segment {
  id: string;
  name: string;
  description: string;
  conditions: any;
  is_active: boolean;
  created_at: string;
  member_count?: number;
}

export function CustomerSegmentation() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    conditions: '{}',
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get member counts
      const segmentsWithCounts = await Promise.all(
        (data || []).map(async (seg) => {
          const { count } = await supabase
            .from('segment_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('segment_id', seg.id);

          return { ...seg, member_count: count || 0 };
        })
      );

      setSegments(segmentsWithCounts);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Fehler beim Laden der Segmente');
    } finally {
      setLoading(false);
    }
  };

  const createSegment = async () => {
    try {
      let conditions;
      try {
        conditions = JSON.parse(newSegment.conditions);
      } catch {
        toast.error('Ungültige JSON-Bedingungen');
        return;
      }

      const { error } = await supabase.from('customer_segments').insert({
        name: newSegment.name,
        description: newSegment.description,
        conditions,
      });

      if (error) throw error;

      toast.success('Segment erstellt');
      setShowCreate(false);
      setNewSegment({ name: '', description: '', conditions: '{}' });
      fetchSegments();
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Fehler beim Erstellen des Segments');
    }
  };

  const toggleSegment = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('customer_segments')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast.success('Segment aktualisiert');
      fetchSegments();
    } catch (error) {
      console.error('Error toggling segment:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const deleteSegment = async (id: string) => {
    if (!confirm('Segment wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('customer_segments').delete().eq('id', id);

      if (error) throw error;

      toast.success('Segment gelöscht');
      fetchSegments();
    } catch (error) {
      console.error('Error deleting segment:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Kundensegmentierung</h2>
          <p className="text-muted-foreground">Verwalte Kundensegmente für gezieltes Marketing</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4 mr-2" />
          Neues Segment
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Neues Segment erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newSegment.name}
                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                placeholder="z.B. VIP Kunden"
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={newSegment.description}
                onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                placeholder="Beschreibe das Segment..."
              />
            </div>
            <div>
              <Label>Bedingungen (JSON)</Label>
              <Textarea
                value={newSegment.conditions}
                onChange={(e) => setNewSegment({ ...newSegment, conditions: e.target.value })}
                placeholder='{"min_lifetime_value": 500}'
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createSegment}>Erstellen</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{segment.name}</CardTitle>
                    <Badge variant={segment.is_active ? 'default' : 'secondary'}>
                      {segment.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                  <CardDescription>{segment.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={segment.is_active}
                    onCheckedChange={() => toggleSegment(segment.id, segment.is_active)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => deleteSegment(segment.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{segment.member_count || 0}</span>
                  <span className="text-muted-foreground">Mitglieder</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">
                    {JSON.stringify(segment.conditions)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Noch keine Segmente vorhanden. Erstelle dein erstes Segment!
          </CardContent>
        </Card>
      )}
    </div>
  );
}

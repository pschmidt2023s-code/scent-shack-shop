import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Plus, Send, Pause, Play, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Campaign {
  id: string;
  name: string;
  description: string;
  campaign_type: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  metrics: any;
  segment_id: string | null;
}

interface Segment {
  id: string;
  name: string;
}

export function MarketingCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    campaign_type: 'email',
    segment_id: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, segmentsRes] = await Promise.all([
        supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('customer_segments').select('id, name').eq('is_active', true),
      ]);

      if (campaignsRes.error) throw campaignsRes.error;
      if (segmentsRes.error) throw segmentsRes.error;

      setCampaigns(campaignsRes.data || []);
      setSegments(segmentsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Kampagnen');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      const { error } = await supabase.from('marketing_campaigns').insert({
        name: newCampaign.name,
        description: newCampaign.description,
        campaign_type: newCampaign.campaign_type,
        segment_id: newCampaign.segment_id || null,
        content: {
          subject: newCampaign.subject,
          body: newCampaign.content,
        },
        status: 'draft',
      });

      if (error) throw error;

      toast.success('Kampagne erstellt');
      setShowCreate(false);
      setNewCampaign({
        name: '',
        description: '',
        campaign_type: 'email',
        segment_id: '',
        subject: '',
        content: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Fehler beim Erstellen der Kampagne');
    }
  };

  const updateCampaignStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'active') {
        updates.sent_at = new Date().toISOString();
      }

      const { error } = await supabase.from('marketing_campaigns').update(updates).eq('id', id);

      if (error) throw error;

      toast.success(`Kampagne ${status === 'active' ? 'gestartet' : 'pausiert'}`);
      fetchData();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'paused':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Marketing Kampagnen</h2>
          <p className="text-muted-foreground">Automatisierte Marketing-Kampagnen verwalten</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4 mr-2" />
          Neue Kampagne
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Neue Kampagne erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="z.B. Sommer Sale 2024"
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                placeholder="Beschreibe die Kampagne..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Typ</Label>
                <Select
                  value={newCampaign.campaign_type}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, campaign_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">E-Mail</SelectItem>
                    <SelectItem value="push">Push-Benachrichtigung</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ziel-Segment</Label>
                <Select
                  value={newCampaign.segment_id}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, segment_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle Kunden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Alle Kunden</SelectItem>
                    {segments.map((seg) => (
                      <SelectItem key={seg.id} value={seg.id}>
                        {seg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Betreff / Titel</Label>
              <Input
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                placeholder="Betreff der Nachricht"
              />
            </div>
            <div>
              <Label>Inhalt</Label>
              <Textarea
                value={newCampaign.content}
                onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                placeholder="Nachrichteninhalt..."
                rows={6}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createCampaign}>Erstellen</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <CardTitle>{campaign.name}</CardTitle>
                    <Badge variant={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {campaign.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => updateCampaignStatus(campaign.id, 'active')}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Starten
                    </Button>
                  )}
                  {campaign.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pausieren
                    </Button>
                  )}
                  {campaign.status === 'paused' && (
                    <Button
                      size="sm"
                      onClick={() => updateCampaignStatus(campaign.id, 'active')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Fortsetzen
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Gesendet</div>
                  <div className="font-semibold">{campaign.metrics?.sent || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Geöffnet</div>
                  <div className="font-semibold">{campaign.metrics?.opened || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Geklickt</div>
                  <div className="font-semibold">{campaign.metrics?.clicked || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Konvertiert</div>
                  <div className="font-semibold">{campaign.metrics?.converted || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Noch keine Kampagnen vorhanden. Erstelle deine erste Kampagne!
          </CardContent>
        </Card>
      )}
    </div>
  );
}

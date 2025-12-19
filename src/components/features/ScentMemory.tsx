import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, Calendar, MapPin, Sparkles, X, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ScentMemoryEntry {
  id: string;
  perfumeName: string;
  memory: string;
  date: string;
  location?: string;
  mood?: string;
  createdAt: string;
}

const moodOptions = [
  { id: 'happy', label: 'Glücklich', emoji: 'happy' },
  { id: 'romantic', label: 'Romantisch', emoji: 'romantic' },
  { id: 'nostalgic', label: 'Nostalgisch', emoji: 'nostalgic' },
  { id: 'peaceful', label: 'Friedlich', emoji: 'peaceful' },
  { id: 'excited', label: 'Aufgeregt', emoji: 'excited' },
];

export function ScentMemory() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<ScentMemoryEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMemory, setNewMemory] = useState({
    perfumeName: '',
    memory: '',
    location: '',
    mood: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('scentMemories');
    if (stored) {
      setMemories(JSON.parse(stored));
    }
  }, []);

  const saveMemory = () => {
    if (!newMemory.perfumeName || !newMemory.memory) return;

    const entry: ScentMemoryEntry = {
      id: Date.now().toString(),
      perfumeName: newMemory.perfumeName,
      memory: newMemory.memory,
      date: new Date().toISOString(),
      location: newMemory.location,
      mood: newMemory.mood,
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...memories];
    setMemories(updated);
    localStorage.setItem('scentMemories', JSON.stringify(updated));
    setNewMemory({ perfumeName: '', memory: '', location: '', mood: '' });
    setIsDialogOpen(false);
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    localStorage.setItem('scentMemories', JSON.stringify(updated));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Scent Memory
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" data-testid="button-new-memory">
                <Plus className="w-4 h-4 mr-1" />
                Neu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Neue Duft-Erinnerung
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Parfum</label>
                  <Input
                    placeholder="z.B. Aventus, Sauvage..."
                    value={newMemory.perfumeName}
                    onChange={(e) => setNewMemory({ ...newMemory, perfumeName: e.target.value })}
                    data-testid="input-scent-perfume"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Deine Erinnerung</label>
                  <Textarea
                    placeholder="Beschreibe den Moment, den du mit diesem Duft verbindest..."
                    value={newMemory.memory}
                    onChange={(e) => setNewMemory({ ...newMemory, memory: e.target.value })}
                    rows={3}
                    data-testid="input-scent-memory"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ort (optional)</label>
                  <Input
                    placeholder="z.B. Paris, Hochzeit, Strand..."
                    value={newMemory.location}
                    onChange={(e) => setNewMemory({ ...newMemory, location: e.target.value })}
                    data-testid="input-scent-location"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Stimmung</label>
                  <div className="flex flex-wrap gap-2">
                    {moodOptions.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setNewMemory({ ...newMemory, mood: mood.id })}
                        data-testid={`button-memory-mood-${mood.id}`}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          newMemory.mood === mood.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {mood.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={saveMemory} disabled={!newMemory.perfumeName || !newMemory.memory} data-testid="button-save-memory">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Erinnerung speichern
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">
          Verknüpfe Düfte mit deinen schönsten Momenten
        </p>
      </CardHeader>
      <CardContent>
        {memories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-1">Noch keine Erinnerungen</p>
            <p className="text-sm">Erstelle deine erste Duft-Erinnerung</p>
          </div>
        ) : (
          <div className="space-y-3">
            {memories.slice(0, 3).map((memory) => (
              <div key={memory.id} className="group p-3 rounded-xl bg-muted/50 border border-border relative">
                <button
                  onClick={() => deleteMemory(memory.id)}
                  data-testid={`button-delete-memory-${memory.id}`}
                  className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm">{memory.perfumeName}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{memory.memory}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(memory.date)}
                      </span>
                      {memory.location && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {memory.location}
                        </span>
                      )}
                      {memory.mood && (
                        <Badge variant="secondary" className="text-xs">
                          {moodOptions.find((m) => m.id === memory.mood)?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {memories.length > 3 && (
              <Button variant="ghost" className="w-full text-sm">
                Alle {memories.length} Erinnerungen anzeigen
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

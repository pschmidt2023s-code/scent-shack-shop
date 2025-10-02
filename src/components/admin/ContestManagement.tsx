import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Trophy, Mail, Phone, Calendar, MessageSquare, Image, Trash2 } from 'lucide-react';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContestEntry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  birth_date: string;
  message: string;
  images: string[];
  is_winner: boolean;
  winner_position: number | null;
  created_at: string;
}

export function ContestManagement() {
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [numberOfWinners, setNumberOfWinners] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<ContestEntry | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('contest_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching contest entries:', error);
      toast.error('Fehler beim Laden der Einträge');
    } finally {
      setLoading(false);
    }
  };

  const drawWinners = async () => {
    if (numberOfWinners < 1) {
      toast.error('Bitte gib eine gültige Anzahl an Gewinnern ein');
      return;
    }

    // Reset all previous winners
    const { error: resetError } = await supabase
      .from('contest_entries')
      .update({ is_winner: false, winner_position: null })
      .eq('is_winner', true);

    if (resetError) {
      toast.error('Fehler beim Zurücksetzen der Gewinner');
      return;
    }

    // Get eligible entries (non-winners)
    const eligibleEntries = [...entries];
    const winners: ContestEntry[] = [];
    const winnersCount = Math.min(numberOfWinners, eligibleEntries.length);

    // Random selection
    for (let i = 0; i < winnersCount; i++) {
      const randomIndex = Math.floor(Math.random() * eligibleEntries.length);
      const winner = eligibleEntries.splice(randomIndex, 1)[0];
      winners.push(winner);
    }

    // Update winners in database
    for (let i = 0; i < winners.length; i++) {
      const { error } = await supabase
        .from('contest_entries')
        .update({ 
          is_winner: true, 
          winner_position: i + 1 
        })
        .eq('id', winners[i].id);

      if (error) {
        console.error('Error updating winner:', error);
      }
    }

    await fetchEntries();
    
    const winnerNames = winners.map(w => `${w.first_name} ${w.last_name}`).join(', ');
    toast.success(`🎉 Gewinner gezogen: ${winnerNames}`);
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Möchtest du diesen Eintrag wirklich löschen?')) return;

    try {
      const { error } = await supabase
        .from('contest_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchEntries();
      toast.success('Eintrag gelöscht');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const showDetails = (entry: ContestEntry) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const winners = entries.filter(e => e.is_winner);
  const totalEntries = entries.length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teilnehmer</p>
              <p className="text-2xl font-bold">{totalEntries}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gewinner</p>
              <p className="text-2xl font-bold">{winners.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Neueste Teilnahme</p>
              <p className="text-sm font-medium">
                {entries[0] ? new Date(entries[0].created_at).toLocaleDateString('de-DE') : '-'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Winner Draw */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Gewinner ziehen</h3>
          </div>
          
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="numberOfWinners">Anzahl der Gewinner</Label>
              <Input
                id="numberOfWinners"
                type="number"
                min="1"
                max={totalEntries}
                value={numberOfWinners}
                onChange={(e) => setNumberOfWinners(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <Button onClick={drawWinners} disabled={totalEntries === 0}>
              <Shuffle className="w-4 h-4 mr-2" />
              Gewinner ziehen
            </Button>
          </div>

          {winners.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                🎉 Aktuelle Gewinner:
              </p>
              <div className="space-y-1">
                {winners.map((winner) => (
                  <p key={winner.id} className="text-sm text-green-700 dark:text-green-300">
                    {winner.winner_position}. Platz: {winner.first_name} {winner.last_name} ({winner.email})
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Entries Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alle Teilnehmer</h3>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Geburtsdatum</TableHead>
                  <TableHead>Teilnahmedatum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Noch keine Teilnehmer
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {entry.first_name} {entry.last_name}
                      </TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell>{entry.phone || '-'}</TableCell>
                      <TableCell>
                        {new Date(entry.birth_date).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>
                        {new Date(entry.created_at).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>
                        {entry.is_winner ? (
                          <Badge className="bg-green-500">
                            <Trophy className="w-3 h-3 mr-1" />
                            Gewinner #{entry.winner_position}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Teilnehmer</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => showDetails(entry)}
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teilnehmer Details</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zum Gewinnspiel-Eintrag
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedEntry.first_name} {selectedEntry.last_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">E-Mail</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedEntry.email}
                  </p>
                </div>
                {selectedEntry.phone && (
                  <div>
                    <Label className="text-muted-foreground">Telefon</Label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedEntry.phone}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Geburtsdatum</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedEntry.birth_date).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Nachricht
                </Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedEntry.message}</p>
              </div>

              {selectedEntry.images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                    <Image className="w-4 h-4" />
                    Hochgeladene Bilder ({selectedEntry.images.length})
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedEntry.images.map((imageUrl, index) => (
                      <a
                        key={index}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={imageUrl}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.is_winner && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-green-800 dark:text-green-200">
                    🏆 Gewinner - Platz {selectedEntry.winner_position}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

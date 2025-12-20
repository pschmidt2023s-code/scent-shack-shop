import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductVideo {
  id: string;
  product_id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  is_active: boolean;
  view_count: number;
}

export function VideoManagement() {
  const [videos, setVideos] = useState<ProductVideo[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    videoUrl: '',
    title: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [videosRes, productsRes] = await Promise.all([
      ]);

      if (videosRes.data) setVideos(videosRes.data);
      if (productsRes.data) setProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  const createVideo = async () => {
    if (!formData.productId || !formData.videoUrl) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }

    try {
        product_id: formData.productId,
        video_url: formData.videoUrl,
        title: formData.title || 'Produktvideo',
      });

      if (error) throw error;

      toast.success('Video hinzugefügt');
      setCreateOpen(false);
      setFormData({ productId: '', videoUrl: '', title: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Fehler beim Erstellen');
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Video wirklich löschen?')) return;

    try {

      if (error) throw error;
      toast.success('Video gelöscht');
      fetchData();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video-Verwaltung</h2>
          <p className="text-muted-foreground">Füge Produktvideos hinzu</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Neues Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Produktvideo hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Produkt</Label>
                <Select value={formData.productId} onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Produkt wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.brand} - {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>YouTube URL</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Titel (optional)</Label>
                <Input
                  placeholder="Produktvorstellung"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <Button onClick={createVideo} className="w-full">
                Video hinzufügen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt Videos</p>
              <p className="text-2xl font-bold">{videos.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Videos</p>
              <p className="text-2xl font-bold">
                {videos.filter((v) => v.is_active).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt Aufrufe</p>
              <p className="text-2xl font-bold">
                {videos.reduce((sum, v) => sum + v.view_count, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titel</TableHead>
              <TableHead>Produkt ID</TableHead>
              <TableHead>Aufrufe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell className="font-mono text-xs">
                  {video.product_id.substring(0, 8)}...
                </TableCell>
                <TableCell>{video.view_count}</TableCell>
                <TableCell>
                  {video.is_active ? (
                    <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
                  ) : (
                    <Badge variant="secondary">Inaktiv</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(video.video_url, '_blank')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteVideo(video.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

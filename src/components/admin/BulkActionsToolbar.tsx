import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Archive, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => Promise<void>;
  actions?: BulkAction[];
}

interface BulkAction {
  id: string;
  label: string;
  icon: any;
  variant?: 'default' | 'destructive' | 'outline';
  requiresConfirmation?: boolean;
}

const defaultActions: BulkAction[] = [
  {
    id: 'activate',
    label: 'Aktivieren',
    icon: CheckCircle,
    variant: 'default'
  },
  {
    id: 'deactivate',
    label: 'Deaktivieren',
    icon: XCircle,
    variant: 'outline'
  },
  {
    id: 'delete',
    label: 'Löschen',
    icon: Trash2,
    variant: 'destructive',
    requiresConfirmation: true
  }
];

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkAction,
  actions = defaultActions
}: BulkActionsToolbarProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExecuteAction = async () => {
    if (!selectedAction) return;

    const action = actions.find(a => a.id === selectedAction);
    
    if (action?.requiresConfirmation && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkAction(selectedAction);
      toast({
        title: "Aktion erfolgreich",
        description: `${selectedCount} Element(e) wurden bearbeitet.`,
      });
      onClearSelection();
      setSelectedAction('');
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Aktion konnte nicht ausgeführt werden.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <div className="glass-card px-6 py-4 rounded-2xl shadow-2xl border border-border/20 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {selectedCount} ausgewählt
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              Auswahl aufheben
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Aktion auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>
                    <div className="flex items-center gap-2">
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleExecuteAction}
              disabled={!selectedAction || isProcessing}
              variant={actions.find(a => a.id === selectedAction)?.variant || 'default'}
            >
              {isProcessing ? 'Wird ausgeführt...' : 'Ausführen'}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktion bestätigen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Aktion wirklich für {selectedCount} Element(e) ausführen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteAction}>
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

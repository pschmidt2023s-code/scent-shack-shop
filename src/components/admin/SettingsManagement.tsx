import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  CreditCard, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const bankSettingsSchema = z.object({
  recipient: z.string().min(1, "Empfängername erforderlich"),
  iban: z.string().min(15, "IBAN muss mindestens 15 Zeichen haben"),
  bic: z.string().optional(),
  bankName: z.string().optional(),
});

type BankSettingsForm = z.infer<typeof bankSettingsSchema>;

export default function SettingsManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bank');
  const [bankSettings, setBankSettings] = useState<BankSettingsForm | null>(null);
  const [isLoadingBank, setIsLoadingBank] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const bankForm = useForm<BankSettingsForm>({
    resolver: zodResolver(bankSettingsSchema),
    defaultValues: {
      recipient: '',
      iban: '',
      bic: '',
      bankName: '',
    },
  });

  const loadBankSettings = useCallback(async () => {
    setIsLoadingBank(true);
    try {
      const response = await fetch('/api/admin/settings/bank', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setBankSettings(data);
        bankForm.reset({
          recipient: data.recipient || '',
          iban: data.iban || '',
          bic: data.bic || '',
          bankName: data.bankName || '',
        });
      }
    } catch (error) {
      console.error('Error loading bank settings:', error);
    } finally {
      setIsLoadingBank(false);
    }
  }, [bankForm]);

  useEffect(() => {
    loadBankSettings();
  }, [loadBankSettings]);

  const onSubmitBank = async (data: BankSettingsForm) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Speichern');
      }
      
      setBankSettings(data);
      toast({
        title: "Gespeichert",
        description: "Bankdaten wurden erfolgreich aktualisiert.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Bankdaten konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatIBAN = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Shop-Einstellungen</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bank" className="gap-2" data-testid="tab-bank-settings">
            <Building2 className="w-4 h-4" />
            Bankverbindung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bank" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Bankverbindung für Vorkasse
              </CardTitle>
              <CardDescription>
                Diese Daten werden Kunden bei der Zahlungsoption "Vorkasse" angezeigt
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBank ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={bankForm.handleSubmit(onSubmitBank)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Empfänger *</Label>
                      <Input
                        id="recipient"
                        placeholder="ALDENAIR GmbH"
                        {...bankForm.register('recipient')}
                        data-testid="input-bank-recipient"
                      />
                      {bankForm.formState.errors.recipient && (
                        <p className="text-sm text-destructive">
                          {bankForm.formState.errors.recipient.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Name der Bank</Label>
                      <Input
                        id="bankName"
                        placeholder="Deutsche Bank"
                        {...bankForm.register('bankName')}
                        data-testid="input-bank-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iban">IBAN *</Label>
                      <Input
                        id="iban"
                        placeholder="DE89 3704 0044 0532 0130 00"
                        {...bankForm.register('iban', {
                          onChange: (e) => {
                            e.target.value = formatIBAN(e.target.value);
                          }
                        })}
                        data-testid="input-bank-iban"
                      />
                      {bankForm.formState.errors.iban && (
                        <p className="text-sm text-destructive">
                          {bankForm.formState.errors.iban.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bic">BIC</Label>
                      <Input
                        id="bic"
                        placeholder="COBADEFFXXX"
                        {...bankForm.register('bic')}
                        data-testid="input-bank-bic"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {bankSettings?.iban ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Bankdaten konfiguriert
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          Keine Bankdaten hinterlegt
                        </>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      data-testid="btn-save-bank-settings"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Speichern
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

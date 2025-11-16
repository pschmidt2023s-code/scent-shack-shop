import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function VoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'de-DE';

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        // If final result, process search
        if (event.results[current].isFinal) {
          handleVoiceSearch(transcriptText);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          toast.error('Keine Sprache erkannt. Bitte versuche es erneut.');
        } else if (event.error === 'not-allowed') {
          toast.error('Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff.');
        } else {
          toast.error('Spracherkennung fehlgeschlagen.');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceSearch = (searchText: string) => {
    if (!searchText) return;

    console.log('Voice search:', searchText);
    
    // Parse search intent
    const lowerText = searchText.toLowerCase();
    
    // Navigate to products page with search
    if (lowerText.includes('suche') || lowerText.includes('finde') || lowerText.includes('zeige')) {
      const searchTerm = searchText.replace(/suche|finde|zeige|mir|nach|produkte?|parfüms?/gi, '').trim();
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      toast.success(`Suche nach: ${searchTerm}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(searchText)}`);
      toast.success(`Suche nach: ${searchText}`);
    }

    setTranscript('');
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Sprachsuche wird von deinem Browser nicht unterstützt.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
      toast.info('Höre zu... Sprich jetzt!');
    }
  };

  // Don't show on unsupported browsers
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={toggleListening}
        variant={isListening ? 'default' : 'outline'}
        size="icon"
        className={`relative ${isListening ? 'animate-pulse' : ''}`}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>

      {isListening && transcript && (
        <Card className="absolute top-14 right-0 p-4 min-w-[250px] z-50 shadow-lg">
          <div className="flex items-start gap-2">
            <Loader2 className="w-4 h-4 animate-spin mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Erkannt:</p>
              <p className="text-sm text-muted-foreground">{transcript}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

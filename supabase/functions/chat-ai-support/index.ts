import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages }: ChatRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with AI");

    const systemPrompt = `Du bist ein freundlicher Kundenservice-Assistent für ALDENAIR, einen Premium-Online-Shop für Parfums und Düfte.

Wichtige Informationen über ALDENAIR:
- Wir bieten hochwertige Parfums und Düfte in verschiedenen Größen (5ml Proben für 4,99€ und 50ml Flaschen)
- Versand: 3-7 Werktage innerhalb Deutschlands (On-Demand-Bestellung)
- Versandkosten: Kostenlos ab 50€, sonst 4,90€
- Zahlungsmethoden: Kreditkarte, PayPal, SEPA-Lastschrift, Sofortüberweisung
- Rückgaberecht: 30 Tage für ungeöffnete Artikel
- Rabatte: 10% für Neukunden bei Newsletter-Anmeldung
- Geschäftszeiten: Mo-Fr 9:00-18:00 Uhr

Dein Verhalten:
- Sei immer freundlich, professionell und hilfsbereit
- Beantworte Fragen klar und präzise
- Wenn du etwas nicht sicher weißt, gib das zu und schlage vor, dass sich ein menschlicher Mitarbeiter meldet
- Nutze Emojis sparsam und nur wo angemessen
- Halte Antworten kurz und auf den Punkt (max. 2-3 Sätze)
- Bei komplexen Anfragen biete an, die Anfrage an einen Mitarbeiter weiterzuleiten

Häufige Themen:
- Versand und Lieferzeiten
- Produktinformationen
- Rückgabe und Widerruf
- Rabatte und Angebote
- Zahlungsmethoden`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Zu viele Anfragen. Bitte versuchen Sie es in einer Minute erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // Return the streaming response directly
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: any) {
    console.error("Error in chat-ai-support function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Ein Fehler ist aufgetreten" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

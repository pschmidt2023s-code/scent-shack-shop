import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PerfumeMatchRequest {
  answers: {
    occasion: string;
    intensity: string;
    season: string;
    notes: string[];
    priceRange: string;
    gender: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers }: PerfumeMatchRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Finding perfect perfume match with AI:", answers);

    const systemPrompt = `Du bist ein Experte für Parfüms und Düfte bei ALDENAIR. 
    
Analysiere die Antworten des Kunden und empfehle die perfekten Düfte aus unserem Sortiment.

Wichtige Produktkategorien:
- Parfums (50ml, 100ml)
- Proben (3ml, 5ml)
- Autodüfte
- Raumdüfte
- Duftkerzen

Antworte im JSON-Format mit:
{
  "matches": [
    {
      "name": "Produktname",
      "category": "Kategorie",
      "description": "Warum dieser Duft passt",
      "confidence": 95,
      "notes": ["Note1", "Note2"]
    }
  ],
  "explanation": "Detaillierte Erklärung warum diese Düfte perfekt passen"
}`;

    const userPrompt = `Kunde sucht einen Duft mit folgenden Präferenzen:
- Anlass: ${answers.occasion}
- Intensität: ${answers.intensity}
- Jahreszeit: ${answers.season}
- Bevorzugte Noten: ${answers.notes.join(", ")}
- Preisbereich: ${answers.priceRange}
- Geschlecht: ${answers.gender}

Empfehle die 3-5 besten passenden Düfte aus dem ALDENAIR Sortiment.`;

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
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service vorübergehend nicht verfügbar." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    console.log("AI Response:", aiResponse);

    let result;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Ungültige Antwort vom AI Service");
    }

    return new Response(
      JSON.stringify({
        matches: result.matches,
        explanation: result.explanation,
        success: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in perfume-matcher-ai function:", error);
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

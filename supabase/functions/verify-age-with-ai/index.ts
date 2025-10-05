import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyAgeRequest {
  imageBase64: string;
  birthDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, birthDate }: VerifyAgeRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Verifying age with AI for birth date:", birthDate);

    // Call Lovable AI with vision capabilities
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Du bist ein Altersverifikations-Assistent. Analysiere das hochgeladene Ausweisdokument und stelle sicher, dass:
1. Es sich um ein gültiges Ausweisdokument handelt (Personalausweis, Reisepass, etc.)
2. Das Geburtsdatum klar erkennbar ist
3. Das Dokument nicht manipuliert oder gefälscht erscheint
4. Die Person mindestens 18 Jahre alt ist

Vergleiche das Geburtsdatum auf dem Ausweis mit dem angegebenen Datum: ${birthDate}

Antworte NUR mit einem JSON-Objekt in diesem Format (ohne zusätzlichen Text):
{
  "valid": true/false,
  "age": Alter in Jahren,
  "reason": "Kurze Begründung",
  "isAdult": true/false
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Bitte verifiziere dieses Ausweisdokument und prüfe das Alter."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
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
          JSON.stringify({ error: "Zahlungspflichtig. Bitte kontaktieren Sie den Support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    console.log("AI Response:", aiResponse);

    // Parse the AI response
    let verification;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      verification = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Ungültige Antwort vom Verifikationsservice");
    }

    return new Response(
      JSON.stringify({
        verified: verification.valid && verification.isAdult,
        age: verification.age,
        reason: verification.reason,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-age-with-ai function:", error);
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

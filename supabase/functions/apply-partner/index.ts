import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerApplication {
  application_data: {
    company_name?: string;
    website?: string;
    social_media: string;
    experience: string;
    motivation: string;
  };
  bank_details: {
    account_holder: string;
    iban: string;
    bic: string;
    bank_name: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== PARTNER APPLICATION START ===");
    
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseService.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const applicationData: PartnerApplication = await req.json();
    console.log("Partner application data:", applicationData);

    // Check if user already has a partner application
    const { data: existingPartner, error: checkError } = await supabaseService
      .from('partners')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingPartner) {
      throw new Error('Sie haben bereits eine Partner-Bewerbung eingereicht');
    }

    // Generate unique partner code
    const { data: partnerCode, error: codeError } = await supabaseService
      .rpc('generate_partner_code');

    if (codeError) {
      throw codeError;
    }

    // Create partner application
    const { data: partner, error: partnerError } = await supabaseService
      .from('partners')
      .insert({
        user_id: user.id,
        partner_code: partnerCode,
        status: 'pending',
        commission_rate: 2.50, // Default commission rate
        application_data: applicationData.application_data,
        bank_details: applicationData.bank_details
      })
      .select()
      .single();

    if (partnerError) {
      console.error("Partner creation error:", partnerError);
      throw partnerError;
    }

    console.log("Partner application created:", partner);

    // TODO: Send notification email to admin
    // You could add email notification here using Resend or similar service

    return new Response(JSON.stringify({ 
      success: true,
      partner_id: partner.id,
      partner_code: partnerCode,
      message: 'Partner-Bewerbung erfolgreich eingereicht'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in apply-partner:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Ein Fehler ist bei der Partner-Bewerbung aufgetreten"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerApplication {
  application_data: {
    first_name: string;
    last_name: string;
    address: string;
    motivation: string;
  };
  bank_details: {
    account_holder: string;
    iban: string;
    bic: string;
    bank_name: string;
  };
  email: string;
  user_id?: string;
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

    const applicationData: PartnerApplication = await req.json();
    console.log("Partner application data:", applicationData);

    let userId = applicationData.user_id;
    let userEmail = applicationData.email;

    // If user is logged in, verify the authentication
    if (userId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: { user }, error: userError } = await supabaseService.auth.getUser(
          authHeader.replace('Bearer ', '')
        );

        if (!userError && user) {
          userId = user.id;
          userEmail = user.email || applicationData.email;
        }
      }
    }

    // Check if there's already a partner application for this email
    const { data: existingPartner, error: checkError } = await supabaseService
      .from('partners')
      .select('id, status')
      .or(`user_id.eq.${userId},application_data->email.eq.${userEmail}`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingPartner) {
      throw new Error('Für diese E-Mail-Adresse wurde bereits eine Partner-Bewerbung eingereicht');
    }

    // Generate unique partner code
    const { data: partnerCode, error: codeError } = await supabaseService
      .rpc('generate_partner_code');

    if (codeError) {
      throw codeError;
    }

    // Create partner application
    const partnerData: any = {
      partner_code: partnerCode,
      status: 'pending',
      commission_rate: 2.50, // Default commission rate
      application_data: {
        ...applicationData.application_data,
        email: userEmail
      },
      bank_details: applicationData.bank_details
    };

    // Only add user_id if it exists and is valid
    if (userId && userId !== 'null') {
      partnerData.user_id = userId;
    }

    const { data: partner, error: partnerError } = await supabaseService
      .from('partners')
      .insert(partnerData)
      .select()
      .single();

    if (partnerError) {
      console.error("Partner creation error:", partnerError);
      throw partnerError;
    }

    console.log("Partner application created:", partner);

    const fullName = `${applicationData.application_data.first_name} ${applicationData.application_data.last_name}`;

    // Send confirmation email
    try {
      const { error: emailError } = await supabaseService.functions.invoke('send-partner-confirmation', {
        body: {
          email: userEmail,
          name: fullName,
          partnerCode: partnerCode,
          status: 'applied'
        }
      });

      if (emailError) {
        console.error('Error sending confirmation email:', emailError);
      } else {
        console.log('Partner application confirmation email sent');
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

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
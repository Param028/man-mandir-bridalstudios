import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from "https://deno.land/std@0.177.0/node/crypto.ts";

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
      throw new Error("Missing payment details")
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(text);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid signature")
    }

    // Update booking in Supabase
    // We need the service role key to bypass RLS since the user might be unauthenticated
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_URL_OVERRIDE') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
       throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('bookings')
      .update({ payment_status: 'paid', status: 'confirmed' })
      .eq('booking_id', booking_id)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, booking: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    )
  }
})

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.74.0";
import Stripe from "npm:stripe@17.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-12-18.acacia",
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      package_type,
      billing_cycle,
      email,
      gift_code_id,
      metadata
    } = await req.json();

    if (!package_type || !billing_cycle || !email) {
      return new Response(
        JSON.stringify({ error: "Manglende påkrævede felter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("code", package_type)
      .eq("is_active", true)
      .maybeSingle();

    if (!product) {
      return new Response(
        JSON.stringify({ error: "Produkt ikke fundet" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!product.stripe_product_id) {
      return new Response(
        JSON.stringify({
          error: "Produkt ikke synkroniseret med Stripe. Kontakt admin."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prices = await stripe.prices.list({
      product: product.stripe_product_id,
      active: true,
    });

    const selectedPrice = prices.data.find(p =>
      p.recurring?.interval === (billing_cycle === "yearly" ? "year" : "month")
    );

    if (!selectedPrice) {
      return new Response(
        JSON.stringify({ error: "Pris ikke fundet for valgte betalingsinterval" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let finalAmount = selectedPrice.unit_amount || 0;
    let discountAmount = 0;

    if (gift_code_id) {
      const { data: giftCode } = await supabaseAdmin
        .from("gift_codes")
        .select("*")
        .eq("id", gift_code_id)
        .eq("is_active", true)
        .maybeSingle();

      if (giftCode) {
        if (giftCode.type === "percentage") {
          discountAmount = Math.round((finalAmount * giftCode.discount_percentage) / 100);
        } else if (giftCode.type === "fixed_amount") {
          discountAmount = Math.min(
            Math.round(giftCode.discount_amount * 100),
            finalAmount
          );
        } else if (giftCode.type === "free_access") {
          finalAmount = 0;
          discountAmount = selectedPrice.unit_amount || 0;
        }

        finalAmount = Math.max(0, finalAmount - discountAmount);
      }
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";
    const successUrl = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/pricing`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPrice.id,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        product_code: package_type,
        subscription_type: billing_cycle,
        gift_code_id: gift_code_id || "",
        original_amount: ((selectedPrice.unit_amount || 0) / 100).toString(),
        discount_amount: (discountAmount / 100).toString(),
        ...metadata,
      },
      subscription_data: {
        metadata: {
          product_code: package_type,
          billing_cycle: billing_cycle,
        },
      },
    };

    if (discountAmount > 0 && finalAmount === 0) {
      sessionParams.discounts = [{
        coupon: await createOrGetCoupon(giftCode.code, 100),
      }];
    } else if (discountAmount > 0) {
      const discountPercentage = Math.round((discountAmount / (selectedPrice.unit_amount || 1)) * 100);
      sessionParams.discounts = [{
        coupon: await createOrGetCoupon(gift_code_id, discountPercentage),
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout session error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function createOrGetCoupon(code: string, percentOff: number): Promise<string> {
  try {
    const existingCoupons = await stripe.coupons.list({ limit: 100 });
    const existing = existingCoupons.data.find(c => c.name === code);

    if (existing) {
      return existing.id;
    }

    const coupon = await stripe.coupons.create({
      name: code,
      percent_off: percentOff,
      duration: "once",
    });

    return coupon.id;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
}

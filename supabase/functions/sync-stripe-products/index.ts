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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Manglende autorisation" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Uautoriseret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["super_admin", "admin"].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Kun admins kan synkronisere produkter" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (productsError) {
      throw productsError;
    }

    const syncResults = [];

    for (const product of products) {
      try {
        let stripeProduct;

        const existingProducts = await stripe.products.search({
          query: `metadata['product_code']:'${product.code}'`,
        });

        if (existingProducts.data.length > 0) {
          stripeProduct = existingProducts.data[0];

          await stripe.products.update(stripeProduct.id, {
            name: product.name,
            description: product.description,
            active: product.is_active,
          });

          syncResults.push({
            code: product.code,
            action: "updated",
            stripeProductId: stripeProduct.id,
          });
        } else {
          stripeProduct = await stripe.products.create({
            name: product.name,
            description: product.description,
            metadata: {
              product_code: product.code,
              product_type: product.type,
              product_tier: product.tier,
            },
            active: product.is_active,
          });

          syncResults.push({
            code: product.code,
            action: "created",
            stripeProductId: stripeProduct.id,
          });
        }

        const priceMonthly = parseFloat(product.price_monthly);
        const priceYearly = parseFloat(product.price_yearly);

        const existingPrices = await stripe.prices.list({
          product: stripeProduct.id,
          active: true,
        });

        const monthlyPrice = existingPrices.data.find(p =>
          p.recurring?.interval === "month"
        );

        const yearlyPrice = existingPrices.data.find(p =>
          p.recurring?.interval === "year"
        );

        if (!monthlyPrice) {
          await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(priceMonthly * 100),
            currency: product.currency.toLowerCase(),
            recurring: {
              interval: "month",
            },
            metadata: {
              product_code: product.code,
              billing_cycle: "monthly",
            },
          });
        }

        if (!yearlyPrice) {
          await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(priceYearly * 100),
            currency: product.currency.toLowerCase(),
            recurring: {
              interval: "year",
            },
            metadata: {
              product_code: product.code,
              billing_cycle: "yearly",
            },
          });
        }

        await supabaseAdmin
          .from("products")
          .update({
            stripe_product_id: stripeProduct.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

      } catch (error) {
        syncResults.push({
          code: product.code,
          action: "error",
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synkroniseret ${products.length} produkter med Stripe`,
        results: syncResults,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

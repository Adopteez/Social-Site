import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.74.0";
import Stripe from "npm:stripe@17.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No stripe signature found");
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabaseAdmin, session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(supabaseAdmin, paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(supabaseAdmin, paymentIntent);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabaseAdmin, subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(supabaseAdmin, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  const customerEmail = session.customer_email;
  const customerId = session.customer as string;
  const paymentIntentId = session.payment_intent as string;

  const metadata = session.metadata || {};
  const productCode = metadata.product_code;
  const giftCodeId = metadata.gift_code_id;
  const subscriptionType = metadata.subscription_type || "monthly";

  if (!customerEmail || !productCode) {
    console.error("Missing customer email or product code");
    return;
  }

  let profile;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", customerEmail)
    .maybeSingle();

  if (existingProfile) {
    profile = existingProfile;
  } else {
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: customerEmail,
      email_confirm: true,
      user_metadata: {
        full_name: metadata.customer_name || customerEmail.split("@")[0],
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return;
    }

    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.user.id,
        email: customerEmail,
        full_name: metadata.customer_name || customerEmail.split("@")[0],
        relation_to_adoption: metadata.relation_to_adoption || "unknown",
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return;
    }

    profile = newProfile;
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("code", productCode)
    .maybeSingle();

  if (!product) {
    console.error("Product not found:", productCode);
    return;
  }

  const expiresAt = new Date();
  if (subscriptionType === "yearly") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  const { error: accessError } = await supabase
    .from("user_product_access")
    .upsert({
      profile_id: profile.id,
      product_id: product.id,
      package_type: productCode,
      is_active: true,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    });

  if (accessError) {
    console.error("Error creating user access:", accessError);
  }

  const amount = session.amount_total ? session.amount_total / 100 : 0;

  await supabase
    .from("payments")
    .insert({
      profile_id: profile.id,
      product_id: product.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_customer_id: customerId,
      amount: amount,
      currency: session.currency?.toUpperCase() || "DKK",
      status: "completed",
      payment_method: session.payment_method_types?.[0] || "card",
      gift_code_id: giftCodeId || null,
      original_amount: metadata.original_amount ? parseFloat(metadata.original_amount) : amount,
      discount_amount: metadata.discount_amount ? parseFloat(metadata.discount_amount) : 0,
      subscription_type: subscriptionType,
    });

  if (giftCodeId) {
    await supabase
      .from("gift_code_usage")
      .insert({
        gift_code_id: giftCodeId,
        profile_id: profile.id,
      });
  }

  console.log(`Successfully activated membership for ${customerEmail}`);
}

async function handlePaymentSuccess(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  await supabase
    .from("payments")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("stripe_payment_intent_id", paymentIntent.id);
}

async function handlePaymentFailed(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  await supabase
    .from("payments")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("stripe_payment_intent_id", paymentIntent.id);
}

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: payment } = await supabase
    .from("payments")
    .select("profile_id, product_id")
    .eq("stripe_customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment) return;

  const expiresAt = new Date(subscription.current_period_end * 1000);

  await supabase
    .from("user_product_access")
    .update({
      is_active: subscription.status === "active",
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", payment.profile_id)
    .eq("product_id", payment.product_id);
}

async function handleSubscriptionCancelled(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: payment } = await supabase
    .from("payments")
    .select("profile_id, product_id")
    .eq("stripe_customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment) return;

  await supabase
    .from("user_product_access")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("profile_id", payment.profile_id)
    .eq("product_id", payment.product_id);
}

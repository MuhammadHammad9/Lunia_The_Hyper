import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
    }

    console.log(`Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        const orderNumber = session.metadata?.order_number;
        const userId = session.metadata?.user_id;

        if (orderId) {
          // Update order status
          await supabase
            .from("orders")
            .update({
              status: "processing",
              payment_status: "paid",
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq("id", orderId);

          // Get order details for email
          const { data: order } = await supabase
            .from("orders")
            .select(`
              *,
              order_items (*)
            `)
            .eq("id", orderId)
            .single();

          if (order) {
            // Send order confirmation email
            const supabasePublicUrl = Deno.env.get("SUPABASE_URL")!;
            await fetch(`${supabasePublicUrl}/functions/v1/send-order-confirmation`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                user_email: session.customer_email,
                user_name: `${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || ""}`.trim(),
                order_number: orderNumber,
                order_id: orderId,
                items: order.order_items?.map((item: any) => ({
                  product_name: item.product_name,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  total_price: item.total_price,
                })),
                subtotal: order.subtotal,
                shipping_cost: order.shipping_cost,
                tax: order.tax,
                total: order.total,
                discount_amount: order.discount_amount,
                shipping_address: order.shipping_address,
              }),
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for intent: ${paymentIntent.id}`);
        
        // Find and update order
        const { data: orders } = await supabase
          .from("orders")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (orders && orders.length > 0) {
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
            })
            .eq("id", orders[0].id);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

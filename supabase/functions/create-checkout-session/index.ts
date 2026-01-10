import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone: string;
  };
  email: string;
  discount_code_id?: string;
  discount_amount?: number;
  success_url: string;
  cancel_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const body: CheckoutRequest = await req.json();
    const { items, shipping_address, email, discount_code_id, discount_amount, success_url, cancel_url } = body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity * 100, 0);
    const discount = (discount_amount || 0) * 100;
    const taxRate = 0.08;
    const taxableAmount = subtotal - discount;
    const tax = Math.round(taxableAmount * taxRate);
    const total = taxableAmount + tax;

    // Create line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add tax as a line item
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax (8%)",
          images: [],
        },
        unit_amount: tax,
      },
      quantity: 1,
    });

    // Add discount as a negative line item if applicable
    if (discount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Discount Applied",
            images: [],
          },
          unit_amount: -discount,
        },
        quantity: 1,
      });
    }

    // Generate order number
    const randomBytes = new Uint8Array(6);
    crypto.getRandomValues(randomBytes);
    const orderNumber = `LUN-${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;

    // Create order in database first
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        subtotal: subtotal / 100,
        shipping_cost: 0,
        tax: tax / 100,
        total: total / 100,
        discount_amount: discount / 100,
        discount_code_id: discount_code_id || null,
        shipping_address: shipping_address,
        payment_method: "stripe",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: cancel_url,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        user_id: user.id,
      },
    });

    // Update order with stripe session id
    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    // Apply discount code if used
    if (discount_code_id) {
      await supabase.rpc("apply_discount_code", {
        p_discount_code_id: discount_code_id,
        p_user_id: user.id,
        p_order_id: order.id,
      });
    }

    // Mark abandoned cart as recovered if exists
    await supabase
      .from("abandoned_carts")
      .update({ recovered_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("recovered_at", null);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
        order_id: order.id,
        order_number: orderNumber,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Checkout session error:", error);
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AbandonedCartRequest {
  user_email: string;
  user_name: string;
  cart_items: CartItem[];
  cart_total: number;
  discount_code?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_email, user_name, cart_items, cart_total, discount_code }: AbandonedCartRequest = await req.json();

    if (!user_email) {
      throw new Error("User email is required");
    }

    const itemsHtml = cart_items
      .map(
        (item) => `
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />` : ""}
                <div>
                  <p style="margin: 0; font-weight: 600; color: #1f2937;">${item.name}</p>
                  <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Qty: ${item.quantity}</p>
                </div>
              </div>
            </td>
            <td style="padding: 16px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600;">
              $${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        `
      )
      .join("");

    const discountSection = discount_code
      ? `
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px; border-radius: 12px; margin: 24px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Use code</p>
          <p style="margin: 8px 0 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">${discount_code}</p>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">for 10% off your order!</p>
        </div>
      `
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 32px; text-align: center;">
                <h1 style="margin: 0; color: white; font-size: 28px; font-style: italic;">lunia™</h1>
                <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Premium Skincare</p>
              </div>

              <!-- Content -->
              <div style="padding: 32px;">
                <h2 style="margin: 0 0 8px; font-size: 24px; color: #1f2937;">
                  You left something behind, ${user_name || "there"}! 👋
                </h2>
                <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                  Your skincare routine is waiting for you. Complete your purchase before these items sell out!
                </p>

                <!-- Cart Items -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 16px; font-weight: bold; font-size: 18px;">Total</td>
                    <td style="padding: 16px; text-align: right; font-weight: bold; font-size: 18px; color: #10b981;">
                      $${cart_total.toFixed(2)}
                    </td>
                  </tr>
                </table>

                ${discountSection}

                <!-- CTA Button -->
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://lunia.lovable.app/checkout" 
                     style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px;">
                    Complete Your Order →
                  </a>
                </div>

                <p style="margin: 32px 0 0; text-align: center; color: #9ca3af; font-size: 14px;">
                  Free shipping on all orders • 30-day returns • Secure checkout
                </p>
              </div>

              <!-- Footer -->
              <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  © 2026 Lunia Skincare. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Lunia <onboarding@resend.dev>",
        to: [user_email],
        subject: `${user_name || "Hey"}, you left items in your cart! 🛒`,
        html,
      }),
    });

    const data = await emailResponse.json();
    console.log("Abandoned cart email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending abandoned cart email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

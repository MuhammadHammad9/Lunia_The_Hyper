import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderConfirmationRequest {
  user_email: string;
  user_name?: string;
  order_number: string;
  order_id: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Order confirmation email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      user_email,
      user_name,
      order_number,
      order_id,
      items,
      subtotal,
      shipping_cost,
      tax,
      total,
      shipping_address,
    }: OrderConfirmationRequest = await req.json();

    console.log(`Sending order confirmation for ${order_number} to ${user_email}`);

    if (!user_email) {
      console.error("No user email provided");
      return new Response(
        JSON.stringify({ error: "User email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const displayName = user_name || 'Valued Customer';
    const siteUrl = Deno.env.get("SITE_URL") || "https://lovable.dev";

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
          <p style="margin: 0; font-size: 14px; color: #1a1a1a;">${item.product_name}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #888888;">Qty: ${item.quantity}</p>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right;">
          <p style="margin: 0; font-size: 14px; color: #1a1a1a;">$${item.total_price.toFixed(2)}</p>
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f8f8;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%);">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 300; color: #ffffff; letter-spacing: 2px;">lunia<sup style="font-size: 10px;">™</sup></h1>
                    </td>
                  </tr>
                  
                  <!-- Confirmation Icon -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <span style="font-size: 64px;">✅</span>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 20px; text-align: center;">
                      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                        Order Confirmed!
                      </h2>
                      <p style="margin: 0 0 8px; font-size: 16px; color: #666666; line-height: 1.6;">
                        Thank you for your order, ${displayName}!
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #666666; line-height: 1.6;">
                        We're preparing your items with care and will notify you once they ship.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Order Number -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f8f8; border-radius: 12px;">
                        <tr>
                          <td style="padding: 20px; text-align: center;">
                            <p style="margin: 0 0 4px; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a; font-family: monospace;">${order_number}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Order Items -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h3 style="margin: 0 0 16px; font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        ${itemsHtml}
                        <tr>
                          <td style="padding: 12px 0;">
                            <p style="margin: 0; font-size: 14px; color: #888888;">Subtotal</p>
                          </td>
                          <td style="padding: 12px 0; text-align: right;">
                            <p style="margin: 0; font-size: 14px; color: #1a1a1a;">$${subtotal.toFixed(2)}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0;">
                            <p style="margin: 0; font-size: 14px; color: #888888;">Shipping</p>
                          </td>
                          <td style="padding: 4px 0; text-align: right;">
                            <p style="margin: 0; font-size: 14px; color: #1a1a1a;">${shipping_cost === 0 ? 'Free' : '$' + shipping_cost.toFixed(2)}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0;">
                            <p style="margin: 0; font-size: 14px; color: #888888;">Tax</p>
                          </td>
                          <td style="padding: 4px 0; text-align: right;">
                            <p style="margin: 0; font-size: 14px; color: #1a1a1a;">$${tax.toFixed(2)}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 16px 0 0; border-top: 2px solid #1a1a1a;">
                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Total</p>
                          </td>
                          <td style="padding: 16px 0 0; border-top: 2px solid #1a1a1a; text-align: right;">
                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2d5016;">$${total.toFixed(2)}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  ${shipping_address ? `
                  <!-- Shipping Address -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <h3 style="margin: 0 0 12px; font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Shipping To</h3>
                      <p style="margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.6;">
                        ${shipping_address.first_name || ''} ${shipping_address.last_name || ''}<br>
                        ${shipping_address.address || ''}<br>
                        ${shipping_address.city || ''}, ${shipping_address.state || ''} ${shipping_address.zip_code || ''}
                      </p>
                    </td>
                  </tr>
                  ` : ''}
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <a href="${siteUrl}/order-tracking/${order_id}" style="display: inline-block; padding: 16px 32px; background-color: #2d5016; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 8px; letter-spacing: 0.5px;">
                        Track Your Order
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f8f8; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 8px; font-size: 14px; color: #888888;">
                        Thank you for choosing lunia™
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #aaaaaa;">
                        Luxury skincare crafted with nature's finest ingredients
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "lunia <onboarding@resend.dev>",
        to: [user_email],
        subject: `Order Confirmed — ${order_number} ✅`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Order confirmation email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-order-confirmation function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

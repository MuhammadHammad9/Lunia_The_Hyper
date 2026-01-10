import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  user_email: string;
  user_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Welcome email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_email, user_name }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${user_email}`);

    if (!user_email) {
      console.error("No user email provided");
      return new Response(
        JSON.stringify({ error: "User email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const displayName = user_name || 'there';
    const siteUrl = Deno.env.get("SITE_URL") || "https://lovable.dev";

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
                  
                  <!-- Welcome Emoji -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <span style="font-size: 64px;">🌿</span>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 20px; text-align: center;">
                      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 600; color: #1a1a1a;">
                        Welcome to lunia™
                      </h2>
                      <p style="margin: 0 0 8px; font-size: 16px; color: #666666; line-height: 1.6;">
                        Hi ${displayName}! 👋
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #666666; line-height: 1.6;">
                        Thank you for joining our community of skincare enthusiasts. We're thrilled to have you on this journey to radiant, healthy skin.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Benefits -->
                  <tr>
                    <td style="padding: 20px 40px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 16px; text-align: center; background-color: #f8f8f8; border-radius: 12px;">
                            <p style="margin: 0 0 12px; font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">As a member, you get</p>
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 8px; text-align: center;">
                                  <span style="font-size: 24px;">🎁</span>
                                  <p style="margin: 8px 0 0; font-size: 14px; color: #1a1a1a;">Exclusive Offers</p>
                                </td>
                                <td style="padding: 8px; text-align: center;">
                                  <span style="font-size: 24px;">✨</span>
                                  <p style="margin: 8px 0 0; font-size: 14px; color: #1a1a1a;">Early Access</p>
                                </td>
                                <td style="padding: 8px; text-align: center;">
                                  <span style="font-size: 24px;">💚</span>
                                  <p style="margin: 8px 0 0; font-size: 14px; color: #1a1a1a;">Skincare Tips</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <a href="${siteUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2d5016; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 8px; letter-spacing: 0.5px;">
                        Start Shopping
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f8f8; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 8px; font-size: 14px; color: #888888;">
                        Questions? Reply to this email or visit our FAQ
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
        subject: "Welcome to lunia™ — Your Skincare Journey Begins! 🌿",
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Welcome email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-welcome-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

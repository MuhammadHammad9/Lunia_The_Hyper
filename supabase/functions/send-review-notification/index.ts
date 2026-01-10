import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewNotificationRequest {
  type: 'like' | 'new_review';
  recipient_email: string;
  recipient_name?: string;
  liker_name?: string;
  reviewer_name?: string;
  product_name: string;
  review_title?: string;
  rating?: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Review notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReviewNotificationRequest = await req.json();
    const { type, recipient_email, recipient_name, liker_name, reviewer_name, product_name, review_title, rating } = data;

    console.log(`Sending ${type} notification to ${recipient_email}`);

    if (!recipient_email) {
      return new Response(
        JSON.stringify({ error: "Recipient email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const displayName = recipient_name || 'there';
    const siteUrl = Deno.env.get("SITE_URL") || "https://lovable.dev";

    let subject: string;
    let headline: string;
    let message: string;
    let emoji: string;

    if (type === 'like') {
      emoji = '❤️';
      subject = `${liker_name || 'Someone'} liked your review!`;
      headline = 'Your review got some love!';
      message = `${liker_name || 'Someone'} appreciated your review on <strong>${product_name}</strong>. Keep sharing your skincare experiences!`;
    } else {
      emoji = '⭐';
      const stars = '★'.repeat(rating || 5) + '☆'.repeat(5 - (rating || 5));
      subject = `New review on ${product_name}`;
      headline = 'New Review Alert!';
      message = `${reviewer_name || 'A customer'} just reviewed <strong>${product_name}</strong> with ${rating} stars.<br><br>${review_title ? `"${review_title}"` : ''}`;
    }

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
                  
                  <!-- Emoji -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <span style="font-size: 64px;">${emoji}</span>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 40px 20px; text-align: center;">
                      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                        ${headline}
                      </h2>
                      <p style="margin: 0 0 8px; font-size: 16px; color: #666666; line-height: 1.6;">
                        Hi ${displayName}!
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #666666; line-height: 1.6;">
                        ${message}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <a href="${siteUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2d5016; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 8px; letter-spacing: 0.5px;">
                        View on lunia™
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f8f8; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; font-size: 12px; color: #aaaaaa;">
                        You're receiving this because you have an account with lunia™
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
        to: [recipient_email],
        subject,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Review notification sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-review-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

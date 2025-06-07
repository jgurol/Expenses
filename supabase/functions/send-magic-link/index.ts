
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('SUPABASE_AUTH_EXTERNAL_EMAIL_HOOK_SECRET') as string;

// Initialize Supabase client for edge function
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface AuthWebhookPayload {
  user: {
    email: string;
    id: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

serve(async (req) => {
  console.log('Magic link email function triggered');
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify the webhook signature if secret is configured
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      try {
        wh.verify(payload, headers);
      } catch (err) {
        console.error('Webhook verification failed:', err);
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const data: AuthWebhookPayload = JSON.parse(payload);
    const { user, email_data } = data;
    
    console.log('Sending magic link to:', user.email);

    // Construct the magic link URL correctly - use the base Supabase URL without duplicating auth/v1
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const magicLinkUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

    // Send email using Resend
    const emailResult = await resend.emails.send({
      from: 'Expense Manager <noreply@californiatelecom.com>',
      to: [user.email],
      subject: 'Sign in to Expense Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Expense Manager</h1>
          <h2 style="color: #555;">Sign in to your account</h2>
          <p>Click the button below to sign in to your Expense Manager account:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Sign In
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="word-break: break-all; color: #3b82f6; font-size: 12px;">
            ${magicLinkUrl}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ success: true, messageId: emailResult.data?.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending magic link email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

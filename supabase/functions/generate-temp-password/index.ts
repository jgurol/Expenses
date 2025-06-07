
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

// Initialize Supabase client for edge function
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface TempPasswordRequest {
  email: string;
}

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

serve(async (req) => {
  console.log('Generate temp password function triggered');
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email }: TempPasswordRequest = await req.json();
    
    console.log('Generating temporary password for:', email);

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error listing users:', userError);
      throw new Error('Failed to check user existence');
    }

    const userExists = userData.users.find(user => user.email === email);
    
    if (!userExists) {
      console.log('User not found:', email);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    
    console.log('Generated temp password for user:', email);

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userExists.id,
      { password: tempPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw new Error('Failed to update password');
    }

    // Send email with temporary password
    const emailResult = await resend.emails.send({
      from: 'Expense Manager <noreply@californiatelecom.com>',
      to: [email],
      subject: 'Your Temporary Password - Expense Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Expense Manager</h1>
          <h2 style="color: #555;">Your Temporary Password</h2>
          <p>We've generated a temporary password for your account as requested.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <h3 style="color: #333; margin: 0;">Temporary Password:</h3>
            <p style="font-size: 24px; font-weight: bold; color: #dc2626; letter-spacing: 2px; margin: 10px 0;">
              ${tempPassword}
            </p>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>Use this temporary password to sign in to your account</li>
            <li>You will be prompted to set a new password after signing in</li>
            <li>This temporary password will expire after your first use</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'https://3d2ba720-9430-45df-8d5e-ccb3448ad9b9.lovableproject.com'}/auth" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Sign In Now
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px; text-align: center;">
            If you didn't request this temporary password, please contact support immediately.
          </p>
        </div>
      `,
    });

    console.log('Temporary password email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Temporary password sent successfully',
        messageId: emailResult.data?.id 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error generating temporary password:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate temporary password',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

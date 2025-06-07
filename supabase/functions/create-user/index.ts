
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, password, firstName, lastName, roles } = await req.json();

    console.log('Creating user:', { email, firstName, lastName, roles });

    // Create user in auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      throw userError;
    }

    console.log('User created successfully:', userData.user?.id);

    // Add user roles
    if (roles && roles.length > 0) {
      const roleInserts = roles.map((role: string) => ({
        user_id: userData.user?.id,
        role: role
      }));

      const { error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .insert(roleInserts);

      if (rolesError) {
        console.error('Error adding user roles:', rolesError);
        // Clean up user if role assignment fails
        await supabaseAdmin.auth.admin.deleteUser(userData.user?.id);
        throw rolesError;
      }

      console.log('User roles added successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData.user,
        message: 'User created successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});


-- Fix the search_path parameter for existing functions to resolve warnings

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Update get_user_roles function
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
 RETURNS SETOF app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name');
  RETURN NEW;
END;
$function$;

-- Update create_user_with_role function
CREATE OR REPLACE FUNCTION public.create_user_with_role(user_email text, user_password text, user_role app_role, user_first_name text DEFAULT NULL::text, user_last_name text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Only admins can create users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- This would need to be implemented via an edge function
  -- as we cannot directly create auth.users from SQL
  RAISE EXCEPTION 'User creation must be done via edge function';
END;
$function$;

-- Fix security issue: Restrict profile visibility to authenticated users only
-- This prevents public access to user email addresses stored in display_name

-- Drop the existing public policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: Create a more restrictive policy where users can only see their own profiles
-- Uncomment the lines below if you want users to only see their own profile data:
-- DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
-- CREATE POLICY "Users can view their own profile" 
-- ON public.profiles 
-- FOR SELECT 
-- TO authenticated
-- USING (auth.uid() = user_id);
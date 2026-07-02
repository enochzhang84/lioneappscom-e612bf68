
-- Remove the public INSERT policy on page_views. All page-view writes now go
-- through a server function that uses the service-role client.
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

-- Remove the RLS-based first-admin self-claim policy. Bootstrapping the first
-- admin is now handled exclusively server-side via a service-role check that
-- verifies no admin exists before inserting.
DROP POLICY IF EXISTS "First signed-in user can claim admin" ON public.user_roles;

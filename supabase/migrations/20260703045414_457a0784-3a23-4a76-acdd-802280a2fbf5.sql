-- Explicitly deny public/client access to sensitive tables so intent is clear (in addition to default-deny + admin-only policies already in place). Trusted server functions use service_role which bypasses RLS.

-- media_assets: block anon/authenticated from reading directly via Data API
CREATE POLICY "Deny public select on media_assets"
ON public.media_assets
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- page_views: block any client-side inserts; writes must go through trusted server function (service_role)
CREATE POLICY "Deny client inserts on page_views"
ON public.page_views
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);
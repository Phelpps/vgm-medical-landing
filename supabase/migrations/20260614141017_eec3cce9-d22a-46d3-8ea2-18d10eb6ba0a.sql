-- Remove the no-longer-needed first-admin claim function (signup will be admin-only)
DROP FUNCTION IF EXISTS public.claim_first_admin();

-- Lock down has_role: revoke broad EXECUTE; only authenticated users need it for RLS evaluation.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
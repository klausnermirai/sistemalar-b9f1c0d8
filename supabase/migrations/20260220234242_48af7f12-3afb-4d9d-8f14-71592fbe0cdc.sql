
-- Add fields to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS cnpj text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS central_council_name text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS metropolitan_council_name text;

-- Add role_title to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_title text;

-- Add is_primary to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT true;

-- Allow admins to update their own organization
CREATE POLICY "Admins can update own org"
ON public.organizations
FOR UPDATE
USING (user_belongs_to_org(auth.uid(), id) AND has_role(auth.uid(), 'admin'));

-- Allow admins to view org members' profiles
CREATE POLICY "Users can view org members profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur1
    JOIN public.user_roles ur2 ON ur1.organization_id = ur2.organization_id
    WHERE ur1.user_id = auth.uid() AND ur2.user_id = profiles.user_id
  )
);

-- Allow admins to manage user_roles in their org
CREATE POLICY "Admins can insert org user_roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') AND user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Admins can update org user_roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'admin') AND user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Admins can delete org user_roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin') AND user_belongs_to_org(auth.uid(), organization_id));

-- Allow users to view all roles in their org (not just their own)
CREATE POLICY "Users can view org user_roles"
ON public.user_roles
FOR SELECT
USING (
  user_belongs_to_org(auth.uid(), organization_id)
);

-- Function to find org by CNPJ
CREATE OR REPLACE FUNCTION public.get_org_by_cnpj(_cnpj text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.organizations WHERE cnpj = _cnpj LIMIT 1
$$;

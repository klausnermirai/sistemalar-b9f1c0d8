
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS total_male_beds integer NOT NULL DEFAULT 30;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS total_female_beds integer NOT NULL DEFAULT 22;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS total_male_rooms integer NOT NULL DEFAULT 12;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS total_female_rooms integer NOT NULL DEFAULT 8;

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  identifier text NOT NULL,
  type text NOT NULL DEFAULT 'masculino',
  beds integer NOT NULL DEFAULT 1,
  observations text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org rooms" ON public.rooms FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Admins can insert org rooms" ON public.rooms FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Admins can update org rooms" ON public.rooms FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role) AND user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Admins can delete org rooms" ON public.rooms FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role) AND user_belongs_to_org(auth.uid(), organization_id));

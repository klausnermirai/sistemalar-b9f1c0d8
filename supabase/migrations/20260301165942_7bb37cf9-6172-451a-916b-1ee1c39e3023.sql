
-- 1. PIA table
CREATE TABLE public.pia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ativo',
  team_synthesis text,
  interventions_psychology text,
  interventions_nutrition text,
  interventions_other text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org pia" ON public.pia FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = pia.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org pia" ON public.pia FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = pia.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org pia" ON public.pia FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = pia.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org pia" ON public.pia FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = pia.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE TRIGGER update_pia_updated_at BEFORE UPDATE ON public.pia FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. PIA Goals table
CREATE TABLE public.pia_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pia_id uuid NOT NULL REFERENCES public.pia(id) ON DELETE CASCADE,
  competency text NOT NULL DEFAULT 'geral',
  goal_text text,
  status text NOT NULL DEFAULT 'em_andamento',
  review_deadline date,
  observations text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pia_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org pia_goals" ON public.pia_goals FOR SELECT USING (EXISTS (SELECT 1 FROM pia p JOIN residents r ON r.id = p.resident_id WHERE p.id = pia_goals.pia_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org pia_goals" ON public.pia_goals FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM pia p JOIN residents r ON r.id = p.resident_id WHERE p.id = pia_goals.pia_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org pia_goals" ON public.pia_goals FOR UPDATE USING (EXISTS (SELECT 1 FROM pia p JOIN residents r ON r.id = p.resident_id WHERE p.id = pia_goals.pia_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org pia_goals" ON public.pia_goals FOR DELETE USING (EXISTS (SELECT 1 FROM pia p JOIN residents r ON r.id = p.resident_id WHERE p.id = pia_goals.pia_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- 3. PIA Revisions table
CREATE TABLE public.pia_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pia_id uuid NOT NULL REFERENCES public.pia(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  revised_by text,
  changes_description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pia_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org pia_revisions" ON public.pia_revisions FOR SELECT USING (EXISTS (SELECT 1 FROM pia p JOIN residents r ON r.id = p.resident_id WHERE p.id = pia_revisions.pia_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org pia_revisions" ON public.pia_revisions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM pia p JOIN residents r ON r.id = p.resident_id WHERE p.id = pia_revisions.pia_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org pia_revisions" ON public.pia_revisions FOR DELETE USING (EXISTS (SELECT 1 FROM pia p JOIN residents r ON r.id = p.resident_id WHERE p.id = pia_revisions.pia_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- 4. Mural Messages table
CREATE TABLE public.mural_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text,
  content text NOT NULL,
  source_type text DEFAULT 'manual',
  source_resident_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mural_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org mural_messages" ON public.mural_messages FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can insert org mural_messages" ON public.mural_messages FOR INSERT WITH CHECK (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can delete org mural_messages" ON public.mural_messages FOR DELETE USING (user_belongs_to_org(auth.uid(), organization_id));

-- 5. Mural Reads table
CREATE TABLE public.mural_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);
ALTER TABLE public.mural_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mural_reads" ON public.mural_reads FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can upsert own mural_reads" ON public.mural_reads FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own mural_reads" ON public.mural_reads FOR UPDATE USING (user_id = auth.uid());

-- 6. Add whatsapp phone to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS mural_whatsapp_phone text;

-- 7. Enable realtime for mural_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.mural_messages;

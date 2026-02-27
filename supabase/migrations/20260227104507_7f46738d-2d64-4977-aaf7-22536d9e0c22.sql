
-- 1. psychology_anamnesis
CREATE TABLE public.psychology_anamnesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  institutionalization_awareness text,
  initial_emotional_reaction jsonb DEFAULT '[]'::jsonb,
  recent_griefs_and_losses text,
  traumas_and_emotional_triggers text,
  orientation_level text,
  mood_screening_gds text,
  cognitive_screening_mmse numeric,
  family_bond_quality text,
  visit_expectations text,
  initial_psychological_synthesis text,
  pia_psychological_goals text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. psychology_assessments
CREATE TABLE public.psychology_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  institutionalization_awareness text,
  initial_emotional_reaction jsonb DEFAULT '[]'::jsonb,
  recent_griefs_and_losses text,
  traumas_and_emotional_triggers text,
  orientation_level text,
  mood_screening_gds text,
  cognitive_screening_mmse numeric,
  family_bond_quality text,
  visit_expectations text,
  initial_psychological_synthesis text,
  pia_psychological_goals text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. psychology_evolutions
CREATE TABLE public.psychology_evolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  institutional_adaptation_status text,
  mood_behavior_evolution text,
  current_socialization_quality jsonb DEFAULT '[]'::jsonb,
  pia_goal_status text,
  new_conduct text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. psychology_attendances
CREATE TABLE public.psychology_attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date_time timestamptz NOT NULL DEFAULT now(),
  intervention_type text,
  attendance_evolution text,
  mural_notes text,
  private_notes text,
  needs_team_report boolean NOT NULL DEFAULT false,
  signature text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.psychology_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_attendances ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as other resident sub-tables)
CREATE POLICY "Users can view org psychology_anamnesis" ON public.psychology_anamnesis FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_anamnesis.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org psychology_anamnesis" ON public.psychology_anamnesis FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_anamnesis.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org psychology_anamnesis" ON public.psychology_anamnesis FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_anamnesis.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org psychology_anamnesis" ON public.psychology_anamnesis FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_anamnesis.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

CREATE POLICY "Users can view org psychology_assessments" ON public.psychology_assessments FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org psychology_assessments" ON public.psychology_assessments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org psychology_assessments" ON public.psychology_assessments FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org psychology_assessments" ON public.psychology_assessments FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

CREATE POLICY "Users can view org psychology_evolutions" ON public.psychology_evolutions FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org psychology_evolutions" ON public.psychology_evolutions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org psychology_evolutions" ON public.psychology_evolutions FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org psychology_evolutions" ON public.psychology_evolutions FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

CREATE POLICY "Users can view org psychology_attendances" ON public.psychology_attendances FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org psychology_attendances" ON public.psychology_attendances FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org psychology_attendances" ON public.psychology_attendances FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org psychology_attendances" ON public.psychology_attendances FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = psychology_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- updated_at triggers
CREATE TRIGGER update_psychology_anamnesis_updated_at BEFORE UPDATE ON public.psychology_anamnesis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_psychology_assessments_updated_at BEFORE UPDATE ON public.psychology_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- nutrition_assessments
CREATE TABLE public.nutrition_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg numeric,
  height_m numeric,
  imc numeric,
  circ_arm numeric,
  circ_waist numeric,
  circ_abdomen numeric,
  circ_hip numeric,
  circ_thigh numeric,
  circ_calf numeric,
  measurements_not_possible boolean NOT NULL DEFAULT false,
  chronic_diseases jsonb DEFAULT '[]'::jsonb,
  feeding_route text,
  recommended_consistency text,
  oral_health jsonb DEFAULT '[]'::jsonb,
  food_preferences text,
  aversions_restrictions text,
  severe_allergies text,
  sex text,
  age numeric,
  activity_level text,
  tmb numeric,
  get numeric,
  skinfold_tricipital numeric,
  skinfold_bicipital numeric,
  skinfold_subscapular numeric,
  skinfold_suprailiac numeric,
  body_fat_percentage numeric,
  screening_score numeric,
  screening_classification text,
  screening_observations text,
  nutritional_diagnosis text,
  needs_supplementation boolean NOT NULL DEFAULT false,
  supplementation_details text,
  pia_nutritional_goals text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nutrition_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org nutrition_assessments" ON public.nutrition_assessments FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org nutrition_assessments" ON public.nutrition_assessments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org nutrition_assessments" ON public.nutrition_assessments FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org nutrition_assessments" ON public.nutrition_assessments FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

CREATE TRIGGER update_nutrition_assessments_updated_at BEFORE UPDATE ON public.nutrition_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- nutrition_evolutions
CREATE TABLE public.nutrition_evolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  current_weight numeric,
  weight_variation_percent numeric,
  weight_alert boolean NOT NULL DEFAULT false,
  food_acceptance text,
  consistency_change boolean NOT NULL DEFAULT false,
  consistency_change_justification text,
  pia_goal_status text,
  new_conduct text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nutrition_evolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org nutrition_evolutions" ON public.nutrition_evolutions FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org nutrition_evolutions" ON public.nutrition_evolutions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org nutrition_evolutions" ON public.nutrition_evolutions FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org nutrition_evolutions" ON public.nutrition_evolutions FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- nutrition_attendances
CREATE TABLE public.nutrition_attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date_time timestamptz NOT NULL DEFAULT now(),
  visit_reason text,
  attendance_notes text,
  mural_notes text,
  signature text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nutrition_attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org nutrition_attendances" ON public.nutrition_attendances FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org nutrition_attendances" ON public.nutrition_attendances FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org nutrition_attendances" ON public.nutrition_attendances FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org nutrition_attendances" ON public.nutrition_attendances FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = nutrition_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

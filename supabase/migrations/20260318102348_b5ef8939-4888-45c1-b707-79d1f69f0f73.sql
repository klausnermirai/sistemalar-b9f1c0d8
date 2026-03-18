
-- Add terapeuta_ocupacional to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'terapeuta_ocupacional';

-- OT Assessments
CREATE TABLE public.ot_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  functional_independence_level text,
  adl_evaluation text,
  cognitive_motor_screening text,
  leisure_interests text,
  environmental_adaptation_needs text,
  pia_ot_goals text,
  initial_ot_synthesis text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ot_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org ot_assessments" ON public.ot_assessments FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org ot_assessments" ON public.ot_assessments FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org ot_assessments" ON public.ot_assessments FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org ot_assessments" ON public.ot_assessments FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_assessments.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- OT Evolutions
CREATE TABLE public.ot_evolutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  functional_status text,
  adl_progress text,
  pia_goal_status text,
  new_conduct text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ot_evolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org ot_evolutions" ON public.ot_evolutions FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org ot_evolutions" ON public.ot_evolutions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org ot_evolutions" ON public.ot_evolutions FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org ot_evolutions" ON public.ot_evolutions FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_evolutions.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- OT Attendances
CREATE TABLE public.ot_attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date_time timestamptz NOT NULL DEFAULT now(),
  activity_type text,
  attendance_notes text,
  mural_notes text,
  signature text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ot_attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org ot_attendances" ON public.ot_attendances FOR SELECT USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org ot_attendances" ON public.ot_attendances FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org ot_attendances" ON public.ot_attendances FOR UPDATE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org ot_attendances" ON public.ot_attendances FOR DELETE USING (EXISTS (SELECT 1 FROM residents r WHERE r.id = ot_attendances.resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- Group Activities
CREATE TABLE public.group_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  time_start text,
  time_end text,
  competency text,
  activity_title text,
  activity_description text,
  objectives text,
  observations text,
  mural_notes text,
  signature text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.group_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org group_activities" ON public.group_activities FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can insert org group_activities" ON public.group_activities FOR INSERT WITH CHECK (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can update org group_activities" ON public.group_activities FOR UPDATE USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can delete org group_activities" ON public.group_activities FOR DELETE USING (user_belongs_to_org(auth.uid(), organization_id));

-- Group Activity Participants
CREATE TABLE public.group_activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_activity_id uuid NOT NULL REFERENCES public.group_activities(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  participated boolean NOT NULL DEFAULT true,
  observation text
);
ALTER TABLE public.group_activity_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view org group_activity_participants" ON public.group_activity_participants FOR SELECT USING (EXISTS (SELECT 1 FROM group_activities ga WHERE ga.id = group_activity_participants.group_activity_id AND user_belongs_to_org(auth.uid(), ga.organization_id)));
CREATE POLICY "Users can insert org group_activity_participants" ON public.group_activity_participants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM group_activities ga WHERE ga.id = group_activity_participants.group_activity_id AND user_belongs_to_org(auth.uid(), ga.organization_id)));
CREATE POLICY "Users can delete org group_activity_participants" ON public.group_activity_participants FOR DELETE USING (EXISTS (SELECT 1 FROM group_activities ga WHERE ga.id = group_activity_participants.group_activity_id AND user_belongs_to_org(auth.uid(), ga.organization_id)));

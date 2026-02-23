
-- =============================================
-- TABELA: residents (dados pessoais + documentos + acolhimento)
-- =============================================
CREATE TABLE public.residents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  name text NOT NULL,
  nickname text,
  gender text,
  birth_date date,
  nationality text DEFAULT 'Brasileira',
  naturalness text,
  marital_status text,
  education text,
  profession text,
  father_name text,
  mother_name text,
  spouse text,
  religion text,
  preferred_hospitals text,
  observations text,
  photo_url text,
  cpf text,
  rg text,
  issuing_body text,
  voter_title text,
  voter_section text,
  voter_zone text,
  cert_type text,
  cert_number text,
  cert_page text,
  cert_book text,
  cert_city text,
  cert_state text,
  cert_date date,
  sus_card text,
  sams_card text,
  cad_unico text,
  inss_number text,
  inss_status text,
  cep text,
  city text,
  state text,
  neighborhood text,
  address text,
  address_number text,
  reference text,
  complement text,
  stay_type text,
  admission_date date,
  room text,
  income text,
  admission_reason text,
  dependency_level text,
  previous_institution text,
  stay_time text,
  change_reason text,
  discharge_date date,
  discharge_reason text,
  favorite_activities text,
  status text NOT NULL DEFAULT 'ativo',
  candidate_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org residents" ON public.residents
  FOR SELECT USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can insert org residents" ON public.residents
  FOR INSERT WITH CHECK (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can update org residents" ON public.residents
  FOR UPDATE USING (user_belongs_to_org(auth.uid(), organization_id));
CREATE POLICY "Users can delete org residents" ON public.residents
  FOR DELETE USING (user_belongs_to_org(auth.uid(), organization_id));

CREATE TRIGGER update_residents_updated_at
  BEFORE UPDATE ON public.residents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABELA: resident_relatives (familiares/contatos)
-- =============================================
CREATE TABLE public.resident_relatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  name text,
  kinship text,
  phone text,
  observation text,
  is_responsible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resident_relatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org resident_relatives" ON public.resident_relatives
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org resident_relatives" ON public.resident_relatives
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org resident_relatives" ON public.resident_relatives
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org resident_relatives" ON public.resident_relatives
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- =============================================
-- TABELA: resident_visits (controle de portaria)
-- =============================================
CREATE TABLE public.resident_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  visitor_name text,
  visitor_doc text,
  time_in text,
  time_out text,
  observation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resident_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org resident_visits" ON public.resident_visits
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org resident_visits" ON public.resident_visits
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org resident_visits" ON public.resident_visits
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org resident_visits" ON public.resident_visits
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- =============================================
-- TABELA: resident_financials (lançamentos financeiros)
-- =============================================
CREATE TABLE public.resident_financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL,
  description text,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resident_financials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org resident_financials" ON public.resident_financials
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org resident_financials" ON public.resident_financials
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org resident_financials" ON public.resident_financials
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org resident_financials" ON public.resident_financials
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

-- =============================================
-- TABELA: resident_personal_items (itens pessoais)
-- =============================================
CREATE TABLE public.resident_personal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id uuid NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  description text,
  status text NOT NULL DEFAULT 'Entrada',
  date date NOT NULL DEFAULT CURRENT_DATE,
  observation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resident_personal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org resident_personal_items" ON public.resident_personal_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can insert org resident_personal_items" ON public.resident_personal_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can update org resident_personal_items" ON public.resident_personal_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));
CREATE POLICY "Users can delete org resident_personal_items" ON public.resident_personal_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.residents r WHERE r.id = resident_id AND user_belongs_to_org(auth.uid(), r.organization_id)));

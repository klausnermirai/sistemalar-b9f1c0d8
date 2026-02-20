
-- 1. Enum for organization types
CREATE TYPE public.org_type AS ENUM ('conselho_nacional', 'conselho_metropolitano', 'conselho_central', 'obra_unida');

-- 2. Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'coordinator', 'social_worker', 'viewer');

-- 3. Enum for candidate stages
CREATE TYPE public.candidate_stage AS ENUM ('agendamento', 'entrevista', 'lista_espera', 'acolhido', 'arquivado');

-- 4. Enum for priority
CREATE TYPE public.candidate_priority AS ENUM ('padrao', 'social_urgente', 'dependencia_duvidosa');

-- 5. Organizations table (multi-tenant hierarchy)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_type public.org_type NOT NULL,
  parent_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 6. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 7. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Candidates table (main screening data)
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  stage public.candidate_stage NOT NULL DEFAULT 'agendamento',
  priority public.candidate_priority NOT NULL DEFAULT 'padrao',
  
  -- Basic info (agendamento)
  elder_name TEXT NOT NULL,
  phone TEXT,
  contact_date DATE,
  visit_address TEXT,
  
  -- Archive info
  archive_reason TEXT,
  archived_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 9. Interview data (full social interview - stored as structured JSONB per section)
CREATE TABLE public.interview_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Section 1: Identificação do Idoso
  identification JSONB DEFAULT '{}',
  -- Section 2: Responsável Legal/Familiar
  legal_guardian JSONB DEFAULT '{}',
  -- Section 3: Composição Familiar e Rede de Apoio
  family_support JSONB DEFAULT '{}',
  -- Section 4: Composição Familiar Detalhada
  family_detail JSONB DEFAULT '[]',
  -- Section 5: Condições de Moradia
  housing JSONB DEFAULT '{}',
  -- Section 6: Situação Socioeconômica
  socioeconomic JSONB DEFAULT '{}',
  -- Section 7: Condições de Saúde
  health JSONB DEFAULT '{}',
  -- Section 8: Grau de Dependência
  dependency JSONB DEFAULT '{}',
  -- Section 9: Aspectos Psicossociais
  psychosocial JSONB DEFAULT '{}',
  -- Section 10: Motivo da Solicitação
  admission_reason TEXT,
  -- Section 11: Parecer Social
  social_opinion TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interview_data ENABLE ROW LEVEL SECURITY;

-- 10. Security definer function to get user's org
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- 11. Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 12. Function to check if user belongs to org (or parent org)
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND organization_id = _org_id
  )
$$;

-- 13. RLS Policies

-- Organizations: authenticated users can see their own org
CREATE POLICY "Users can view their organization"
ON public.organizations FOR SELECT TO authenticated
USING (public.user_belongs_to_org(auth.uid(), id));

-- User roles: users can see their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Profiles: users can manage their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Candidates: users can CRUD within their org
CREATE POLICY "Users can view org candidates"
ON public.candidates FOR SELECT TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can insert org candidates"
ON public.candidates FOR INSERT TO authenticated
WITH CHECK (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can update org candidates"
ON public.candidates FOR UPDATE TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id));

CREATE POLICY "Users can delete org candidates"
ON public.candidates FOR DELETE TO authenticated
USING (public.user_belongs_to_org(auth.uid(), organization_id));

-- Interview data: inherit access from candidate's org
CREATE POLICY "Users can view org interviews"
ON public.interview_data FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.candidates c 
  WHERE c.id = candidate_id AND public.user_belongs_to_org(auth.uid(), c.organization_id)
));

CREATE POLICY "Users can insert org interviews"
ON public.interview_data FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.candidates c 
  WHERE c.id = candidate_id AND public.user_belongs_to_org(auth.uid(), c.organization_id)
));

CREATE POLICY "Users can update org interviews"
ON public.interview_data FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.candidates c 
  WHERE c.id = candidate_id AND public.user_belongs_to_org(auth.uid(), c.organization_id)
));

-- 14. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_data_updated_at
  BEFORE UPDATE ON public.interview_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 1. Adicionar novos valores ao enum candidate_stage
ALTER TYPE public.candidate_stage ADD VALUE IF NOT EXISTS 'decisao_diretoria';
ALTER TYPE public.candidate_stage ADD VALUE IF NOT EXISTS 'avaliacao_medica';
ALTER TYPE public.candidate_stage ADD VALUE IF NOT EXISTS 'integracao';

-- 2. Novas colunas na tabela candidates
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS board_opinion text,
  ADD COLUMN IF NOT EXISTS medical_status text,
  ADD COLUMN IF NOT EXISTS medical_opinion text,
  ADD COLUMN IF NOT EXISTS integration_date date,
  ADD COLUMN IF NOT EXISTS integration_report text,
  ADD COLUMN IF NOT EXISTS contract_status text DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS admission_date date;

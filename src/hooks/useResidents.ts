import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Resident {
  id: string;
  organization_id: string;
  name: string;
  nickname: string | null;
  gender: string | null;
  birth_date: string | null;
  nationality: string | null;
  naturalness: string | null;
  marital_status: string | null;
  education: string | null;
  profession: string | null;
  father_name: string | null;
  mother_name: string | null;
  spouse: string | null;
  religion: string | null;
  preferred_hospitals: string | null;
  observations: string | null;
  photo_url: string | null;
  cpf: string | null;
  rg: string | null;
  issuing_body: string | null;
  voter_title: string | null;
  voter_section: string | null;
  voter_zone: string | null;
  cert_type: string | null;
  cert_number: string | null;
  cert_page: string | null;
  cert_book: string | null;
  cert_city: string | null;
  cert_state: string | null;
  cert_date: string | null;
  sus_card: string | null;
  sams_card: string | null;
  cad_unico: string | null;
  inss_number: string | null;
  inss_status: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  address: string | null;
  address_number: string | null;
  reference: string | null;
  complement: string | null;
  stay_type: string | null;
  admission_date: string | null;
  room: string | null;
  income: string | null;
  admission_reason: string | null;
  dependency_level: string | null;
  previous_institution: string | null;
  stay_time: string | null;
  change_reason: string | null;
  discharge_date: string | null;
  discharge_reason: string | null;
  favorite_activities: string | null;
  status: string;
  candidate_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useResidents() {
  const { userOrgId } = useAuth();

  return useQuery({
    queryKey: ["residents", userOrgId],
    queryFn: async () => {
      if (!userOrgId) return [];
      const { data, error } = await supabase
        .from("residents")
        .select("*")
        .eq("organization_id", userOrgId)
        .order("name");
      if (error) throw error;
      return data as Resident[];
    },
    enabled: !!userOrgId,
  });
}

export function useCreateResident() {
  const qc = useQueryClient();
  const { userOrgId } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Omit<Resident, "id" | "organization_id" | "created_at" | "updated_at">> & { name: string }) => {
      if (!userOrgId) throw new Error("Não autenticado");
      const { error } = await supabase.from("residents").insert({
        ...data,
        organization_id: userOrgId,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["residents"] }),
  });
}

export function useUpdateResident() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Resident> & { id: string }) => {
      const { error } = await supabase.from("residents").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["residents"] }),
  });
}

export function useArchiveResident() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      discharge_date,
      discharge_reason,
    }: {
      id: string;
      status: string;
      discharge_date: string;
      discharge_reason: string;
    }) => {
      const { error } = await supabase
        .from("residents")
        .update({ status, discharge_date, discharge_reason })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["residents"] });
      qc.invalidateQueries({ queryKey: ["occupancy"] });
    },
  });
}

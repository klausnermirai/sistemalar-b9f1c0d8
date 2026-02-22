import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Candidate = Tables<"candidates">;
type CandidateInsert = TablesInsert<"candidates">;
type CandidateUpdate = TablesUpdate<"candidates">;

export function useCandidates(stage?: string) {
  const { userOrgId } = useAuth();

  return useQuery({
    queryKey: ["candidates", stage, userOrgId],
    queryFn: async () => {
      if (!userOrgId) return [];
      let query = supabase
        .from("candidates")
        .select("*")
        .eq("organization_id", userOrgId)
        .order("created_at", { ascending: false });

      if (stage) {
        query = query.eq("stage", stage as Candidate["stage"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Candidate[];
    },
    enabled: !!userOrgId,
  });
}

export function useCandidateCounts() {
  const { userOrgId } = useAuth();

  return useQuery({
    queryKey: ["candidate-counts", userOrgId],
    queryFn: async () => {
      const defaults = { agendamento: 0, entrevista: 0, lista_espera: 0, decisao_diretoria: 0, avaliacao_medica: 0, integracao: 0, acolhido: 0, arquivado: 0 };
      if (!userOrgId) return defaults;
      const { data, error } = await supabase
        .from("candidates")
        .select("stage")
        .eq("organization_id", userOrgId);

      if (error) throw error;

      const counts = { ...defaults };
      data?.forEach((c) => {
        const stage = c.stage as keyof typeof counts;
        if (stage in counts) counts[stage]++;
      });
      return counts;
    },
    enabled: !!userOrgId,
  });
}

export function useCreateCandidate() {
  const qc = useQueryClient();
  const { userOrgId, user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<CandidateInsert, "organization_id" | "created_by">) => {
      if (!userOrgId || !user) throw new Error("Não autenticado");
      const { error } = await supabase.from("candidates").insert({
        ...data,
        organization_id: userOrgId,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate-counts"] });
    },
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: CandidateUpdate & { id: string }) => {
      const { error } = await supabase.from("candidates").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate-counts"] });
    },
  });
}

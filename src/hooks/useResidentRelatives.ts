import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResidentRelative {
  id: string;
  resident_id: string;
  name: string | null;
  kinship: string | null;
  phone: string | null;
  observation: string | null;
  is_responsible: boolean;
  created_at: string;
}

export function useResidentRelatives(residentId: string | null) {
  return useQuery({
    queryKey: ["resident-relatives", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("resident_relatives")
        .select("*")
        .eq("resident_id", residentId)
        .order("is_responsible", { ascending: false });
      if (error) throw error;
      return data as ResidentRelative[];
    },
    enabled: !!residentId,
  });
}

export function useCreateRelative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ResidentRelative, "id" | "created_at">) => {
      const { error } = await supabase.from("resident_relatives").insert(data);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["resident-relatives", vars.resident_id] }),
  });
}

export function useDeleteRelative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, residentId }: { id: string; residentId: string }) => {
      const { error } = await supabase.from("resident_relatives").delete().eq("id", id);
      if (error) throw error;
      return residentId;
    },
    onSuccess: (residentId) => qc.invalidateQueries({ queryKey: ["resident-relatives", residentId] }),
  });
}

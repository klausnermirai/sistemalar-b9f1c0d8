import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResidentFinancial {
  id: string;
  resident_id: string;
  date: string;
  type: string;
  description: string | null;
  amount: number;
  created_at: string;
}

export function useResidentFinancials(residentId: string | null) {
  return useQuery({
    queryKey: ["resident-financials", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("resident_financials")
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as ResidentFinancial[];
    },
    enabled: !!residentId,
  });
}

export function useCreateFinancial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ResidentFinancial, "id" | "created_at">) => {
      const { error } = await supabase.from("resident_financials").insert(data);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["resident-financials", vars.resident_id] }),
  });
}

export function useDeleteFinancial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, residentId }: { id: string; residentId: string }) => {
      const { error } = await supabase.from("resident_financials").delete().eq("id", id);
      if (error) throw error;
      return residentId;
    },
    onSuccess: (residentId) => qc.invalidateQueries({ queryKey: ["resident-financials", residentId] }),
  });
}

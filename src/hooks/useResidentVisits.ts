import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResidentVisit {
  id: string;
  resident_id: string;
  date: string;
  visitor_name: string | null;
  visitor_doc: string | null;
  time_in: string | null;
  time_out: string | null;
  observation: string | null;
  created_at: string;
}

export function useResidentVisits(residentId: string | null) {
  return useQuery({
    queryKey: ["resident-visits", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("resident_visits")
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as ResidentVisit[];
    },
    enabled: !!residentId,
  });
}

export function useCreateVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ResidentVisit, "id" | "created_at">) => {
      const { error } = await supabase.from("resident_visits").insert(data);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["resident-visits", vars.resident_id] }),
  });
}

export function useDeleteVisit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, residentId }: { id: string; residentId: string }) => {
      const { error } = await supabase.from("resident_visits").delete().eq("id", id);
      if (error) throw error;
      return residentId;
    },
    onSuccess: (residentId) => qc.invalidateQueries({ queryKey: ["resident-visits", residentId] }),
  });
}

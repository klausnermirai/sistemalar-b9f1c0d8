import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ResidentItem {
  id: string;
  resident_id: string;
  description: string | null;
  status: string;
  date: string;
  observation: string | null;
  created_at: string;
}

export function useResidentItems(residentId: string | null) {
  return useQuery({
    queryKey: ["resident-items", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("resident_personal_items")
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as ResidentItem[];
    },
    enabled: !!residentId,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ResidentItem, "id" | "created_at">) => {
      const { error } = await supabase.from("resident_personal_items").insert(data);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["resident-items", vars.resident_id] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, residentId }: { id: string; residentId: string }) => {
      const { error } = await supabase.from("resident_personal_items").delete().eq("id", id);
      if (error) throw error;
      return residentId;
    },
    onSuccess: (residentId) => qc.invalidateQueries({ queryKey: ["resident-items", residentId] }),
  });
}

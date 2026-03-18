import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface OTEvolution {
  id: string;
  resident_id: string;
  date: string;
  functional_status: string | null;
  adl_progress: string | null;
  pia_goal_status: string | null;
  new_conduct: string | null;
  created_by: string | null;
  created_at: string;
}

export function useOTEvolutions(residentId: string | undefined) {
  return useQuery({
    queryKey: ["ot_evolutions", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("ot_evolutions" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as OTEvolution[];
    },
    enabled: !!residentId,
  });
}

export function useCreateOTEvolution() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Omit<OTEvolution, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("ot_evolutions" as any).insert({
        ...data,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ot_evolutions"] }),
  });
}

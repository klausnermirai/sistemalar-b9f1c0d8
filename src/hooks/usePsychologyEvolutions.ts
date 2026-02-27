import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface PsychologyEvolution {
  id: string;
  resident_id: string;
  date: string;
  institutional_adaptation_status: string | null;
  mood_behavior_evolution: string | null;
  current_socialization_quality: string[] | null;
  pia_goal_status: string | null;
  new_conduct: string | null;
  created_by: string | null;
  created_at: string;
}

export function usePsychologyEvolutions(residentId: string | undefined) {
  return useQuery({
    queryKey: ["psychology_evolutions", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("psychology_evolutions" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PsychologyEvolution[];
    },
    enabled: !!residentId,
  });
}

export function useCreatePsychologyEvolution() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Omit<PsychologyEvolution, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("psychology_evolutions" as any).insert({
        ...data,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["psychology_evolutions"] }),
  });
}

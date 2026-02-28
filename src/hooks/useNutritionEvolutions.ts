import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface NutritionEvolution {
  id: string;
  resident_id: string;
  date: string;
  current_weight: number | null;
  weight_variation_percent: number | null;
  weight_alert: boolean;
  food_acceptance: string | null;
  consistency_change: boolean;
  consistency_change_justification: string | null;
  pia_goal_status: string | null;
  new_conduct: string | null;
  created_by: string | null;
  created_at: string;
}

export function useNutritionEvolutions(residentId: string | undefined) {
  return useQuery({
    queryKey: ["nutrition_evolutions", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("nutrition_evolutions" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as NutritionEvolution[];
    },
    enabled: !!residentId,
  });
}

export function useCreateNutritionEvolution() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Omit<NutritionEvolution, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("nutrition_evolutions" as any).insert({
        ...data,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition_evolutions"] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NutritionAssessment {
  id: string;
  resident_id: string;
  date: string;
  weight_kg: number | null;
  height_m: number | null;
  imc: number | null;
  circ_arm: number | null;
  circ_waist: number | null;
  circ_abdomen: number | null;
  circ_hip: number | null;
  circ_thigh: number | null;
  circ_calf: number | null;
  measurements_not_possible: boolean;
  chronic_diseases: string[] | null;
  feeding_route: string | null;
  recommended_consistency: string | null;
  oral_health: string[] | null;
  food_preferences: string | null;
  aversions_restrictions: string | null;
  severe_allergies: string | null;
  sex: string | null;
  age: number | null;
  activity_level: string | null;
  tmb: number | null;
  get: number | null;
  skinfold_tricipital: number | null;
  skinfold_bicipital: number | null;
  skinfold_subscapular: number | null;
  skinfold_suprailiac: number | null;
  body_fat_percentage: number | null;
  screening_score: number | null;
  screening_classification: string | null;
  screening_observations: string | null;
  nutritional_diagnosis: string | null;
  needs_supplementation: boolean;
  supplementation_details: string | null;
  pia_nutritional_goals: string | null;
  created_at: string;
  updated_at: string;
}

export function useNutritionAssessment(residentId: string | undefined) {
  return useQuery({
    queryKey: ["nutrition_assessments", residentId],
    queryFn: async () => {
      if (!residentId) return null;
      const { data, error } = await supabase
        .from("nutrition_assessments" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as NutritionAssessment | null;
    },
    enabled: !!residentId,
  });
}

export function useUpsertNutritionAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<NutritionAssessment> & { resident_id: string }) => {
      if (data.id) {
        const { id, created_at, updated_at, ...rest } = data as any;
        const { error } = await supabase.from("nutrition_assessments" as any).update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { id, created_at, updated_at, ...rest } = data as any;
        const { error } = await supabase.from("nutrition_assessments" as any).insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition_assessments"] }),
  });
}

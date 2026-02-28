import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface NutritionAttendance {
  id: string;
  resident_id: string;
  date_time: string;
  visit_reason: string | null;
  attendance_notes: string | null;
  mural_notes: string | null;
  signature: string | null;
  created_by: string | null;
  created_at: string;
}

export function useNutritionAttendances(residentId: string | undefined) {
  return useQuery({
    queryKey: ["nutrition_attendances", residentId],
    queryFn: async () => {
      if (!residentId) return [];
      const { data, error } = await supabase
        .from("nutrition_attendances" as any)
        .select("*")
        .eq("resident_id", residentId)
        .order("date_time", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as NutritionAttendance[];
    },
    enabled: !!residentId,
  });
}

export function useCreateNutritionAttendance() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Omit<NutritionAttendance, "id" | "created_at" | "created_by">) => {
      const { error } = await supabase.from("nutrition_attendances" as any).insert({
        ...data,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition_attendances"] }),
  });
}

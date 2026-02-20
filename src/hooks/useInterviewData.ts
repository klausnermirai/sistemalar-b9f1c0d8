import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type InterviewData = Tables<"interview_data">;

export function useInterviewData(candidateId: string | null) {
  return useQuery({
    queryKey: ["interview-data", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      const { data, error } = await supabase
        .from("interview_data")
        .select("*")
        .eq("candidate_id", candidateId)
        .maybeSingle();
      if (error) throw error;
      return data as InterviewData | null;
    },
    enabled: !!candidateId,
  });
}

export function useUpsertInterviewData() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: TablesInsert<"interview_data">) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from("interview_data")
        .select("id")
        .eq("candidate_id", data.candidate_id)
        .maybeSingle();

      if (existing) {
        const { candidate_id, ...updateData } = data;
        const { error } = await supabase
          .from("interview_data")
          .update(updateData as TablesUpdate<"interview_data">)
          .eq("candidate_id", candidate_id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("interview_data").insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["interview-data"] });
    },
  });
}

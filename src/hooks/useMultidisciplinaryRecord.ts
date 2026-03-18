import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TimelineEntry {
  id: string;
  date: string;
  competency: "psicologia" | "nutricao" | "terapia_ocupacional";
  type: string;
  professional: string | null;
  summary: string;
  hasPrivateContent: boolean;
  hasMuralContent: boolean;
  fullData: Record<string, any>;
}

export function useMultidisciplinaryRecord(residentId: string | undefined) {
  return useQuery({
    queryKey: ["multidisciplinary_record", residentId],
    queryFn: async (): Promise<TimelineEntry[]> => {
      if (!residentId) return [];

      const [
        { data: psyAnamnesis },
        { data: psyAssessments },
        { data: psyEvolutions },
        { data: psyAttendances },
        { data: nutAssessments },
        { data: nutEvolutions },
        { data: nutAttendances },
      ] = await Promise.all([
        supabase.from("psychology_anamnesis" as any).select("*").eq("resident_id", residentId),
        supabase.from("psychology_assessments" as any).select("*").eq("resident_id", residentId),
        supabase.from("psychology_evolutions" as any).select("*").eq("resident_id", residentId),
        supabase.from("psychology_attendances" as any).select("*").eq("resident_id", residentId),
        supabase.from("nutrition_assessments" as any).select("*").eq("resident_id", residentId),
        supabase.from("nutrition_evolutions" as any).select("*").eq("resident_id", residentId),
        supabase.from("nutrition_attendances" as any).select("*").eq("resident_id", residentId),
      ]);

      const entries: TimelineEntry[] = [];

      (psyAnamnesis || []).forEach((r: any) => {
        entries.push({
          id: r.id, date: r.date || r.created_at, competency: "psicologia", type: "Anamnese",
          professional: null, summary: r.initial_psychological_synthesis || "Anamnese psicológica registrada",
          hasPrivateContent: false, hasMuralContent: false, fullData: r,
        });
      });

      (psyAssessments || []).forEach((r: any) => {
        entries.push({
          id: r.id, date: r.date || r.created_at, competency: "psicologia", type: "Avaliação",
          professional: null, summary: r.initial_psychological_synthesis || "Avaliação psicológica registrada",
          hasPrivateContent: false, hasMuralContent: false, fullData: r,
        });
      });

      (psyEvolutions || []).forEach((r: any) => {
        entries.push({
          id: r.id, date: r.date || r.created_at, competency: "psicologia", type: "Evolução",
          professional: null, summary: r.mood_behavior_evolution || "Evolução psicológica registrada",
          hasPrivateContent: false, hasMuralContent: false, fullData: r,
        });
      });

      (psyAttendances || []).forEach((r: any) => {
        entries.push({
          id: r.id, date: r.date_time || r.created_at, competency: "psicologia", type: "Atendimento",
          professional: r.signature || null, summary: r.attendance_evolution || "Atendimento psicológico registrado",
          hasPrivateContent: !!r.private_notes, hasMuralContent: !!r.mural_notes, fullData: r,
        });
      });

      (nutAssessments || []).forEach((r: any) => {
        entries.push({
          id: r.id, date: r.date || r.created_at, competency: "nutricao", type: "Avaliação Nutricional",
          professional: null, summary: r.nutritional_diagnosis || "Avaliação nutricional registrada",
          hasPrivateContent: false, hasMuralContent: false, fullData: r,
        });
      });

      (nutEvolutions || []).forEach((r: any) => {
        entries.push({
          id: r.id, date: r.date || r.created_at, competency: "nutricao", type: "Evolução Nutricional",
          professional: null, summary: r.food_acceptance || "Evolução nutricional registrada",
          hasPrivateContent: false, hasMuralContent: !!r.mural_notes, fullData: r,
        });
      });

      (nutAttendances || []).forEach((r: any) => {
        entries.push({
          id: r.id, date: r.date_time || r.created_at, competency: "nutricao", type: "Atendimento Nutricional",
          professional: r.signature || null, summary: r.attendance_notes || "Atendimento nutricional registrado",
          hasPrivateContent: false, hasMuralContent: !!r.mural_notes, fullData: r,
        });
      });

      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return entries;
    },
    enabled: !!residentId,
  });
}

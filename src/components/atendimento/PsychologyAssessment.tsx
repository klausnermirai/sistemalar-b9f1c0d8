import { usePsychologyAssessment, useUpsertPsychologyAssessment } from "@/hooks/usePsychologyAssessments";
import { PsychologicalAssessmentForm } from "./PsychologicalAssessmentForm";

interface Props {
  residentId: string;
}

export function PsychologyAssessment({ residentId }: Props) {
  const { data: existing, isLoading } = usePsychologyAssessment(residentId);
  const upsert = useUpsertPsychologyAssessment();

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <PsychologicalAssessmentForm
      residentId={residentId}
      existingData={existing}
      onSave={(data) => upsert.mutateAsync(data)}
      isSaving={upsert.isPending}
    />
  );
}

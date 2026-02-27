import { usePsychologyAnamnesis, useUpsertPsychologyAnamnesis } from "@/hooks/usePsychologyAnamnesis";
import { PsychologicalAssessmentForm } from "./PsychologicalAssessmentForm";

interface Props {
  residentId: string;
}

export function PsychologyAnamnese({ residentId }: Props) {
  const { data: existing, isLoading } = usePsychologyAnamnesis(residentId);
  const upsert = useUpsertPsychologyAnamnesis();

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <PsychologicalAssessmentForm
      residentId={residentId}
      existingData={existing}
      isAnamnese
      onSave={(data) => upsert.mutateAsync(data)}
      isSaving={upsert.isPending}
    />
  );
}

import { useOccupancy } from "@/hooks/useOccupancy";
import { Users, BedDouble } from "lucide-react";

export function OccupancyPanel() {
  const { data } = useOccupancy();

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acolhidos ♂</p>
          <p className="text-lg font-extrabold text-foreground">{data.maleResidents}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acolhidas ♀</p>
          <p className="text-lg font-extrabold text-foreground">{data.femaleResidents}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10">
          <BedDouble className="h-4 w-4 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vagas ♂</p>
          <p className="text-lg font-extrabold text-foreground">{data.maleAvailable}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10">
          <BedDouble className="h-4 w-4 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vagas ♀</p>
          <p className="text-lg font-extrabold text-foreground">{data.femaleAvailable}</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useResidents, Resident } from "@/hooks/useResidents";
import { ResidentList } from "@/components/residentes/ResidentList";
import { ResidentForm } from "@/components/residentes/ResidentForm";
import { ImportResidents } from "@/components/residentes/ImportResidents";
import { OccupancyPanel } from "@/components/shared/OccupancyPanel";

export default function Residentes() {
  const { data: residents = [], isLoading, refetch } = useResidents();
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="space-y-6">
        <ResidentForm
          resident={selectedResident}
          onBack={() => { setShowForm(false); setSelectedResident(null); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wide text-foreground">
            Residentes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os residentes da instituição
          </p>
        </div>
        <ImportResidents onDone={() => refetch()} />
      </div>

      <OccupancyPanel />

      <ResidentList
        residents={residents}
        isLoading={isLoading}
        onSelect={(r) => { setSelectedResident(r); setShowForm(true); }}
        onNew={() => { setSelectedResident(null); setShowForm(true); }}
      />
    </div>
  );
}

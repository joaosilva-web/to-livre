// src/app/dashboard/appointments/components/Filters.tsx
"use client";

import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";

export interface FiltersState {
  status: string;
  from: string;
  to: string;
}

interface FiltersProps {
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
}

export default function Filters({ filters, setFilters }: FiltersProps) {
  return (
    <div className="flex gap-4 mb-4">
      <Input
        type="date"
        value={filters.from}
        onChange={(e) => setFilters({ ...filters, from: e.target.value })}
      />
      <Input
        type="date"
        value={filters.to}
        onChange={(e) => setFilters({ ...filters, to: e.target.value })}
      />
      <Select
        placeholder="Todos os status"
        options={[
          { label: "Todos os status", value: "ALL" },
          { label: "Pendente", value: "PENDING" },
          { label: "Confirmado", value: "CONFIRMED" },
          { label: "Concluído", value: "COMPLETED" },
          { label: "Cancelado", value: "CANCELED" },
        ]}
        defaultValue={filters.status || undefined}
        onValueChange={(value) => setFilters({ ...filters, status: value })}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/app/components/ui/ToastErrorProvider";
import AppointmentCard from "./AppointmentCard";
import { UIAppointment, default as prismaToUI } from "@/lib/appointments";
import { Appointment } from "@/generated/prisma";

interface Props {
  companyId: string;
  date: string; // YYYY-MM-DD
  onEdit: (appt: UIAppointment) => void;
}

export default function AppointmentsBoard({ companyId, date, onEdit }: Props) {
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [columns, setColumns] = useState<Record<string, UIAppointment[]>>({});
  const [professionalsList, setProfessionalsList] = useState<
    { id: string; name: string }[]
  >([]);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  // no DnD activeDrag state when using buttons only
  const toast = useToast();
  const [filterProfessionalId, setFilterProfessionalId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!companyId) return;
    const fetchAppts = async () => {
      let q = `companyId=${encodeURIComponent(
        companyId
      )}&from=${date}&to=${date}`;
      if (filterProfessionalId)
        q += `&professionalId=${encodeURIComponent(filterProfessionalId)}`;
      const readApi = async <T,>(res: Response): Promise<T[]> => {
        const body = await res.json().catch(() => null);
        const list = Array.isArray(body) ? body : body?.data ?? [];
        if (!Array.isArray(list)) return [];
        return list as T[];
      };

      const res = await fetch(`/api/appointments?${q}`);
      const raw = await readApi<unknown>(res);
      const ui = raw
        .map((r) => {
          if (r && typeof r === "object") return prismaToUI(r as Appointment);
          return null;
        })
        .filter((x): x is UIAppointment => Boolean(x));
      setAppointments(ui);
    };
    fetchAppts();

    // fetch professionals for mapping name -> id and list
    const fetchProfs = async () => {
      try {
        const res = await fetch(
          `/api/company/${encodeURIComponent(companyId)}/professionals`
        );
        const readApi = async <T,>(res: Response): Promise<T[]> => {
          const body = await res.json().catch(() => null);
          const list = Array.isArray(body) ? body : body?.data ?? [];
          if (!Array.isArray(list)) return [];
          return list as T[];
        };

        const list = await readApi<unknown>(res);
        const arr: { id: string; name: string }[] = [];
        list.forEach((p) => {
          if (p && typeof p === "object") {
            const obj = p as Record<string, unknown>;
            const id = typeof obj.id === "string" ? obj.id : undefined;
            const name = typeof obj.name === "string" ? obj.name : undefined;
            if (id && name) arr.push({ id, name });
          }
        });
        setProfessionalsList(arr);
      } catch {
        // ignore silently; mapping is best-effort
      }
    };
    fetchProfs();
  }, [companyId, date, filterProfessionalId]);

  useEffect(() => {
    // Group by status (PENDING, CONFIRMED, COMPLETED, CANCELED) and optionally filter by professional
    const filtered = filterProfessionalId
      ? appointments.filter((a) => a.professionalId === filterProfessionalId)
      : appointments;
    const map: Record<string, UIAppointment[]> = {};
    filtered.forEach((a) => {
      const key = a.status || "PENDING";
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    // Ensure all status keys exist even if empty
    const allKeys = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"];
    allKeys.forEach((k) => {
      if (!map[k]) map[k] = [];
    });
    setColumns(map);
  }, [appointments, filterProfessionalId]);

  // Centralized status update helper used by drag and keyboard menu
  const updateAppointmentStatus = async (
    apptId: string,
    targetStatus: string
  ) => {
    const appt = appointments.find((x) => x.id === apptId);
    if (!appt) return;
    if (appt.status === targetStatus) return;

    // optimistic update: move locally
    setColumns((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = (next[k] || []).filter((x) => x.id !== apptId);
      });
      const updated = { ...appt, status: targetStatus } as UIAppointment;
      if (!next[targetStatus]) next[targetStatus] = [];
      next[targetStatus] = [updated, ...next[targetStatus]];
      return next;
    });

    setUpdatingIds((s) => ({ ...s, [apptId]: true }));

    try {
      const res = await fetch(`/api/appointments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: apptId, status: targetStatus }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar agendamento");
      toast.success?.("Status do agendamento atualizado");
    } catch {
      toast.error?.("Erro ao atualizar status. Recarregando...");
      // rollback: refetch
      try {
        const res = await fetch(
          `/api/appointments?companyId=${encodeURIComponent(
            companyId
          )}&from=${date}&to=${date}`
        );
        const body = await res.json().catch(() => null);
        const raw = Array.isArray(body) ? body : body?.data ?? [];
        const ui = (raw as unknown[])
          .map((r) => prismaToUI(r as Appointment))
          .filter((x): x is UIAppointment => Boolean(x));
        setAppointments(ui);
      } catch {}
    } finally {
      setUpdatingIds((s) => {
        const next = { ...s };
        delete next[apptId];
        return next;
      });
    }
  };

  // No native drag handlers required when using buttons only

  // Precompute column nodes in a fixed order: PENDING, CONFIRMED, COMPLETED, CANCELED
  const orderedKeys = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"];
  const statusColorVarMap: Record<string, string> = {
    PENDING: "--color-feedback-warning",
    CONFIRMED: "--color-feedback-info",
    COMPLETED: "--color-feedback-success",
    CANCELED: "--color-feedback-error",
  };

  const columnNodes = orderedKeys.map((statusKey) => {
    const appts = columns[statusKey] || [];
    const labelMap: Record<string, string> = {
      PENDING: "Pendente",
      CONFIRMED: "Confirmado",
      COMPLETED: "Concluído",
      CANCELED: "Cancelado",
    };
    const header = labelMap[statusKey] ?? statusKey;

    const colorVar = statusColorVarMap[statusKey] || "--color-feedback-info";
    const borderStyle: React.CSSProperties = {
      borderLeft: `6px solid var(${colorVar})`,
    };
    // If PENDING use the darker warning for header and white text for contrast
    const headerBgVar =
      statusKey === "PENDING" ? "--color-feedback-warning-dark" : colorVar;
    const headerStyle: React.CSSProperties = {
      backgroundColor: `var(${headerBgVar})`,
    };
    const headerTextClass = "text-white";

    // Use an absolutely-positioned overlay with the status color and low opacity so
    // the column is tinted but child cards remain fully opaque.
    const overlayStyle: React.CSSProperties = {
      backgroundColor: `var(${colorVar})`,
      opacity: 0.08,
      pointerEvents: "none",
    };

    return (
      <div
        key={statusKey}
        className="min-w-[260px] p-3 rounded relative overflow-hidden"
        style={{ ...borderStyle }}
      >
        {/* background overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 8,
            ...overlayStyle,
          }}
        />

        <div className="relative z-10">
          <h3
            className={`font-semibold mb-2 px-2 py-1 rounded ${headerTextClass}`}
            style={headerStyle}
          >
            {header}
          </h3>
          <div className="min-h-[100px]">
            {appts.map((a) => (
              <div key={a.id}>
                <AppointmentCard
                  appt={a}
                  onEdit={onEdit}
                  updating={Boolean(updatingIds[a.id])}
                  onRequestStatusChange={updateAppointmentStatus}
                  showProfessionalWhenNoFilter={!filterProfessionalId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  });

  const renderProfessionalOptions = () => {
    return professionalsList.map((p) => (
      <option key={p.id} value={p.id}>
        {p.name}
      </option>
    ));
  };

  return (
    <div className="flex gap-4 overflow-x-auto">
      <div className="w-full">
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm">Filtrar por profissional:</label>
          <select
            value={filterProfessionalId ?? ""}
            onChange={(e) => setFilterProfessionalId(e.target.value || null)}
            className="border rounded px-2 py-1"
          >
            <option value="">Todos</option>
            {renderProfessionalOptions()}
          </select>
        </div>

        {Object.keys(columns).length === 0 ? (
          <div>Nenhum agendamento para esta data.</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto">{columnNodes}</div>
        )}
      </div>
    </div>
  );
}

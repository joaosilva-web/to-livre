// src/app/dashboard/appointments/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSession from "@/hooks/useSession";
// import Filters from "./FilterProps";
// import AppointmentsList from "./AppointmentList";
import AppointmentsBoard from "./board/AppointmentsBoard";
import { formatDateLocal } from "@/lib/date";
import AppointmentForm from "./AppointmentForm";
import AuthBanner from "@/app/components/AuthBanner";
import prismaToUI, { UIAppointment } from "@/lib/appointments";
import Button from "@/app/components/ui/Button";
import { Appointment } from "@/generated/prisma"; // <-- Importa o tipo do Prisma

interface FiltersState {
  status: string;
  from: string;
  to: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const router = useRouter();
  const { user, error: sessionError } = useSession();
  const companyId = user?.companyId ?? null;
  const [selectedAppointment, setSelectedAppointment] =
    useState<UIAppointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    status: "",
    from: "",
    to: "",
  });
  // unused handlers kept for future functionality
  void appointments;
  void router;
  void setFilters;

  const fetchAppointments = useCallback(async () => {
    if (sessionError) return;
    if (!companyId) return;
    const query: string[] = [];
    // ensure companyId is always sent
    query.push(`companyId=${encodeURIComponent(companyId)}`);
    if (filters.status && filters.status !== "ALL")
      query.push(`status=${filters.status}`);
    if (filters.from) query.push(`from=${filters.from}`);
    if (filters.to) query.push(`to=${filters.to}`);

    try {
      const res = await fetch(
        `/api/appointments${query.length ? `?${query.join("&")}` : ""}`
      );

      const readApi = async <T,>(r: Response): Promise<T[]> => {
        const body = await r.json().catch(() => null);
        const list = Array.isArray(body) ? body : body?.data ?? [];
        return Array.isArray(list) ? (list as T[]) : [];
      };

      const raw = await readApi<Appointment>(res);

      if (!res.ok) {
        console.error(
          "Erro fetch appointments:",
          raw.length ? raw : res.statusText
        );
        setAppointments([]);
        return;
      }

      const ui = raw
        .map((d) => prismaToUI(d)!)
        .filter(Boolean) as UIAppointment[];
      setAppointments(ui);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setAppointments([]);
    }
  }, [filters, companyId, sessionError]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // If session errored, keep control in the UI (banner) so user can retry/login
  useEffect(() => {
    if (!sessionError) return;
  }, [sessionError]);

  // edit handler is provided inline to AppointmentsBoard; keep logic close to usage

  const handleFormClose = () => {
    setSelectedAppointment(null);
    setShowForm(false);
    fetchAppointments();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 bg-background p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-text">Agendamentos</h1>
        <Button size="sm" asLink href="/dashboard/appointments/new">
          Novo Agendamento
        </Button>
      </div>
      <AuthBanner />
      <div className="p-4 bg-background rounded-lg shadow-sm w-full">
        <div className="mb-4">
          {/* Filters removed for MVP with board; we show confirmed appointments per professional for the day */}
        </div>
        <AppointmentsBoard
          companyId={companyId ?? ""}
          date={filters.from || formatDateLocal(new Date())}
          onEdit={(a) => {
            setSelectedAppointment(a);
            setShowForm(true);
          }}
        />
      </div>
      {showForm && (
        <AppointmentForm
          appointment={selectedAppointment}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

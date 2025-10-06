// src/app/dashboard/appointments/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSession from "@/hooks/useSession";
import Filters from "./FilterProps";
import AppointmentsList from "./AppointmentList";
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
  const {
    user,
    loading: sessionLoading,
    error: sessionError,
    refresh: refreshSession,
  } = useSession();
  const companyId = user?.companyId ?? null;
  const [selectedAppointment, setSelectedAppointment] =
    useState<UIAppointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    status: "",
    from: "",
    to: "",
  });

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
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("Erro fetch appointments:", body || res.statusText);
        setAppointments([]);
        return;
      }

      const raw = Array.isArray(body) ? body : body?.data ?? [];
      const ui = (raw as Appointment[])
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

  const handleEdit = (appointment: UIAppointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleNew = () => {
    setSelectedAppointment(null); // garante que é criação
    setShowForm(true);
  };

  const handleFormClose = () => {
    setSelectedAppointment(null);
    setShowForm(false);
    fetchAppointments();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 bg-background p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-text">Agendamentos</h1>
        <Button size="sm" onClick={handleNew}>
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

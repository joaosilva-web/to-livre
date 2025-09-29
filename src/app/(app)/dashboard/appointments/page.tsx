// src/app/dashboard/appointments/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Filters from "./FilterProps";
import AppointmentsList from "./AppointmentList";
import AppointmentForm from "./AppointmentForm";
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
  const [selectedAppointment, setSelectedAppointment] =
    useState<UIAppointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    status: "",
    from: "",
    to: "",
  });

  const fetchAppointments = useCallback(async () => {
    const query: string[] = [];
    if (filters.status && filters.status !== "ALL")
      query.push(`status=${filters.status}`);
    if (filters.from) query.push(`from=${filters.from}`);
    if (filters.to) query.push(`to=${filters.to}`);

    const res = await fetch(
      `/api/appointments${query.length ? `?${query.join("&")}` : ""}`
    );
  const data: Appointment[] = await res.json();
  const ui = data.map((d) => prismaToUI(d)!).filter(Boolean) as UIAppointment[];
  setAppointments(ui);
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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
      <div className="p-4 bg-background rounded-lg shadow-sm">
        <Filters filters={filters} setFilters={setFilters} />
        <AppointmentsList
          appointments={appointments}
          onEdit={handleEdit}
          refresh={fetchAppointments}
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

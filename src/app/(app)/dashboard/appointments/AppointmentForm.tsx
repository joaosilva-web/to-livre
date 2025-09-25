// src/app/dashboard/appointments/components/AppointmentForm.tsx
"use client";

import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { useState, useEffect } from "react";
import { z } from "zod";

const updateAppointmentSchema = z.object({
  clientName: z.string().optional(),
  service: z.string().optional(),
  price: z.number().optional(),
  date: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]).optional(),
});

interface Props {
  appointment: any | null;
  onClose: () => void;
}

export default function AppointmentForm({ appointment, onClose }: Props) {
  const [form, setForm] = useState({
    clientName: "",
    service: "",
    price: 0,
    date: "",
    status: "PENDING",
  });

  useEffect(() => {
    if (appointment)
      setForm({
        ...appointment,
        date: new Date(appointment.date).toISOString().slice(0, 16),
      });
  }, [appointment]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      updateAppointmentSchema.parse(form);
      console.log("TESTE FORM: ", form);
      const method = appointment ? "PUT" : "POST";
      const url = appointment
        ? `/api/appointments/${appointment.id}`
        : "/api/appointments";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: new Date(form.date) }),
      });
      onClose();
    } catch (err: any) {
      alert(err.message || "Erro ao salvar agendamento");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96 flex flex-col gap-3"
      >
        <h2 className="text-xl text-text font-bold mb-2">
          {appointment ? "Editar Agendamento" : "Novo Agendamento"}
        </h2>
        <Input
          type="text"
          placeholder="Nome do cliente"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
        />
        <Input
          type="text"
          placeholder="Serviço"
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Preço"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <Input
          type="datetime-local"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <select
          className="px-4 py-2 transition text-text-secondary focus:outline-none rounded-md border-2 border-gray-300 focus:border-primary"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="PENDING">Pendente</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="COMPLETED">Concluído</option>
          <option value="CANCELED">Cancelado</option>
        </select>
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="outlined" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm">
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}

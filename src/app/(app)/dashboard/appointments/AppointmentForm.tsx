"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import { z } from "zod";
import { AppointmentStatus, Appointment as PrismaAppointment } from "@/generated/prisma";
import prismaToUI, { UIAppointment as HelperUIAppointment } from "@/lib/appointments";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const updateAppointmentSchema = z.object({
  clientName: z.string().optional(),
  service: z.string().optional(),
  price: z.number().optional(),
  date: z.string().optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
});

type UIAppointment = HelperUIAppointment;

interface Props {
  appointment: UIAppointment | null;
  onClose: () => void;
}

interface AvailableSlot {
  time: string; // "HH:mm"
  available: boolean;
}

export default function AppointmentForm({ appointment, onClose }: Props) {
  const [form, setForm] = useState<{
    clientName: string;
    service: string;
    price: number;
    date: string;
    status: AppointmentStatus;
  }>({
    clientName: "",
    service: "",
    price: 0,
    date: "",
    status: AppointmentStatus.PENDING,
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    if (!appointment) return;

    // runtime type guard: detect Prisma shape (has startTime)
    const isPrisma = (a: unknown): a is PrismaAppointment => {
      return !!a && typeof a === "object" && "startTime" in (a as Record<string, unknown>);
    };

    const ui = isPrisma(appointment) ? prismaToUI(appointment) ?? appointment : appointment;

    const safeDate = ui.date ? new Date(ui.date) : new Date();

    setForm({
      clientName: ui.clientName ?? "",
      service: ui.service ?? "",
      price: ui.price ?? 0,
      date: safeDate.toISOString().slice(0, 16),
      status: ui.status ?? AppointmentStatus.PENDING,
    });

    setSelectedDate(safeDate);
    const slot = `${safeDate.getHours().toString().padStart(2, "0")}:00`;
    setSelectedSlot(slot);
  }, [appointment]);

  // Buscar horários livres
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      const from = selectedDate.toISOString().split("T")[0];
      const to = from;
      const res = await fetch(`/api/appointments?from=${from}&to=${to}`);
  const data: UIAppointment[] = await res.json();

      const slots: AvailableSlot[] = Array.from({ length: 10 }, (_, i) => {
        const hour = 9 + i;
        const time = `${hour.toString().padStart(2, "0")}:00`;
        return {
          time,
          available: !data.some((a) => new Date(a.date).getHours() === hour),
        };
      });

      setAvailableSlots(slots);
    };

    fetchSlots();
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      updateAppointmentSchema.parse(form);
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
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar agendamento");
    }
  };

  const handleSlotClick = (time: string) => {
    if (!selectedDate) return;
    const [hour, minute] = time.split(":").map(Number);
    const dt = new Date(selectedDate);
    dt.setHours(hour, minute, 0, 0);
    setForm({ ...form, date: dt.toISOString().slice(0, 16) });
    setSelectedSlot(time);
  };

  // Dados do gráfico
  const chartData = {
    labels: availableSlots.map((slot) => slot.time),
    datasets: [
      {
        label: "Horários",
        data: availableSlots.map(() => 1), // todas barras com mesma altura
        backgroundColor: availableSlots.map(
          (slot) =>
            slot.time === selectedSlot
              ? "#014e78" // selecionado
              : slot.available
              ? "#1ac897" // livre
              : "#e0e0e0" // ocupado
        ),
        borderRadius: 6,
        barThickness: 20,
        hoverBackgroundColor: availableSlots.map(
          (slot) =>
            slot.time === selectedSlot
              ? "#014e78" // destaque do selecionado ao passar o mouse
              : slot.available
              ? "#15a079" // destaque do livre
              : "#a3a3a3" // destaque do ocupado
        ),
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: unknown) {
            const idx = (context as { dataIndex?: number }).dataIndex ?? 0;
            return availableSlots[idx]?.available ? "Livre" : "Ocupado";
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: {
        ticks: { color: "#111827", font: { size: 14 } },
      },
    },
    onClick: (event: unknown, elements: unknown) => {
      const els = elements as Array<{ index?: number }> | null;
      if (els && els.length > 0) {
        const index = els[0].index ?? 0;
        const slot = availableSlots[index];
        if (slot?.available) handleSlotClick(slot.time);
      }
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start z-50 pt-10 overflow-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl flex flex-col gap-4"
      >
        <h2 className="text-xl text-text font-bold mb-2">
          {appointment ? "Editar Agendamento" : "Novo Agendamento"}
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
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
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />
            <select
              className="px-4 py-2 mt-2 transition text-text-secondary focus:outline-none rounded-md border-2 border-gray-300 focus:border-primary w-full"
              value={String(form.status)}
              onChange={(e) => {
                const val = e.target.value as AppointmentStatus;
                if (Object.values(AppointmentStatus).includes(val)) {
                  setForm({ ...form, status: val });
                }
              }}
            >
              {Object.values(AppointmentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <Calendar
              // react-calendar's onChange can be Date or Date[] (range). Normalize safely.
              onChange={(value: Date | Date[] | unknown) => {
                if (value instanceof Date) setSelectedDate(value);
                else if (Array.isArray(value) && value[0] instanceof Date) setSelectedDate(value[0]);
              }}
              value={selectedDate}
              className="rounded-lg shadow-sm"
              tileClassName={({ date }) =>
                date.toDateString() === new Date().toDateString()
                  ? "bg-primary text-white"
                  : ""
              }
            />
            {selectedDate && availableSlots.length > 0 && (
              <div className="mt-2 p-2 border rounded-lg shadow-inner bg-gray-50">
                <p className="text-sm font-semibold mb-1">
                  Horários disponíveis em {selectedDate.toLocaleDateString()}:
                </p>
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
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

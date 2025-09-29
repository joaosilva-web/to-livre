"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import { z } from "zod";
import { Appointment as PrismaAppointment } from "@/generated/prisma";
import prismaToUI from '@/lib/appointments';

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

const appointmentSchema = z.object({
  clientName: z.string().min(1),
  serviceId: z.string().min(1),
  startTime: z.string().min(1),
});

// Interfaces
// appointment server shape is read as Prisma Appointment and then normalized via `prismaToUI`

interface Service {
  id: string;
  name: string;
  duration: number;
}

interface AvailableSlot {
  time: string;
  available: boolean;
}

// Skeleton
function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
  );
}

// Função para extrair payload do JWT
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [services, setServices] = useState<Service[]>([]);
  // local appointments are fetched and normalized below; no persistent state needed
  const [form, setForm] = useState({
    clientName: "",
    serviceId: "",
    startTime: "",
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Pega companyId do JWT
  useEffect(() => {
    const token = localStorage.getItem("token"); // ou do cookie
    if (!token) return;
    const payload = parseJwt(token);
    if (!payload?.companyId)
      return console.error("CompanyId não encontrado no JWT");
    setCompanyId(payload.companyId);
  }, []);

  // Fetch serviços
  useEffect(() => {
    console.log("Fetching services, companyId:", companyId);
    if (!companyId) return;
    console.log("companyId is null, skipping fetch");
    setLoadingServices(true);
    fetch(`/api/services?companyId=${companyId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (Array.isArray(resData.data)) setServices(resData.data);
        else setServices([]);
      })
      .catch((err) => {
        console.error("Erro ao buscar serviços:", err);
        setServices([]);
      })
      .finally(() => setLoadingServices(false));
  }, [companyId]);

  // Fetch appointments e gera slots
  useEffect(() => {
    if (!selectedDate || !form.serviceId || !companyId) return;

    const selectedService = services.find((s) => s.id === form.serviceId);
    if (!selectedService) return;

    setLoadingSlots(true);

    const fetchSlots = async () => {
      const dateStr = selectedDate.toISOString().split("T")[0];

      // Horários de funcionamento
      const resHours = await fetch(
        `/api/companies/${companyId}/working-hours?date=${dateStr}`
      );
      const workingHours: { start: string; end: string }[] =
        await resHours.json();

      // Agendamentos existentes
      const resAppointments = await fetch(
        `/api/appointments?companyId=${companyId}&from=${dateStr}&to=${dateStr}`
      );
      const raw = await resAppointments.json();
      // normalize server appointments to UI-friendly shape
      const data = Array.isArray(raw)
        ? (raw as PrismaAppointment[])
            .map((r) => prismaToUI(r))
            .filter((x): x is NonNullable<typeof x> => Boolean(x))
        : [];

      // Gera slots
      const slots: AvailableSlot[] = [];

          workingHours.forEach((wh) => {
        const [startHour, startMinute] = wh.start.split(":").map(Number);
        const [endHour, endMinute] = wh.end.split(":").map(Number);

        const start = new Date(selectedDate);
        start.setHours(startHour, startMinute, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(endHour, endMinute, 0, 0);

        const current = new Date(start);

        while (current.getTime() + selectedService.duration * 60_000 <= end.getTime()) {
          const timeStr = current.toTimeString().slice(0, 5);
          const isOccupied = data.some((appt) => {
            // `data` items are UI-normalized (have `date` and derived duration)
            const apptStart = new Date(appt.date);
            const apptEnd = new Date(appt.date);
            apptEnd.setMinutes(apptEnd.getMinutes() + (services.find((s) => s.id === appt.serviceId)?.duration ?? selectedService.duration));
            return !(
              current.getTime() + selectedService.duration * 60_000 <= apptStart.getTime() || current.getTime() >= apptEnd.getTime()
            );
          });
          slots.push({ time: timeStr, available: !isOccupied });
          current.setMinutes(current.getMinutes() + selectedService.duration);
        }
      });

      setAvailableSlots(slots);
      setLoadingSlots(false);
    };

    fetchSlots();
  }, [selectedDate, form.serviceId, services, companyId]);

  const handleSlotClick = (time: string) => {
    if (!selectedDate || !form.serviceId) return;

    const [hour, minute] = time.split(":").map(Number);
    const dt = new Date(selectedDate);
    dt.setHours(hour, minute, 0, 0);

    setForm({ ...form, startTime: dt.toISOString() });
    setSelectedSlot(time);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      appointmentSchema.parse(form);
      if (!companyId) throw new Error("CompanyId não encontrado");

      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, companyId }),
      });

      router.push("/dashboard/appointments");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar agendamento");
    }
  };

  const isSaveDisabled =
    !selectedSlot ||
    !availableSlots.find((s) => s.time === selectedSlot)?.available;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)]">
      <h1 className="text-2xl font-bold mb-2">Novo Agendamento</h1>

      {step === 1 && (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <p className="text-md font-semibold mb-1 text-center">
            Escolha a data do agendamento
          </p>
          <Calendar
            onChange={(date: unknown) => {
              setSelectedDate(date as Date);
              setStep(2);
            }}
            value={selectedDate}
            minDate={new Date()}
            className="w-full rounded-lg! border-2! border-gray-300! p-2!"
          />
        </div>
      )}

      {step === 2 && selectedDate && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-4">
          <Select
            placeholder="Selecione um serviço"
            value={form.serviceId}
            onChange={(value) => setForm({ ...form, serviceId: value })}
            options={services.map((s) => ({ label: s.name, value: s.id }))}
            disabled={loadingServices}
          />

          {form.serviceId ? (
            loadingSlots ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <div className="h-[400px] w-full">
                <Bar
                  data={{
                    labels: availableSlots.map((slot) => slot.time),
                    datasets: [
                      {
                        label: "Horários",
                        data: availableSlots.map(() => 1),
                        backgroundColor: availableSlots.map((slot, i) => {
                          if (!form.serviceId) return "#e0e0e0";
                          if (selectedSlot) {
                            const startIndex = availableSlots.findIndex(
                              (s) => s.time === selectedSlot
                            );
                            const durationSlots = Math.ceil(
                              (services.find((s) => s.id === form.serviceId)
                                ?.duration ?? 0) / 30
                            );
                            if (
                              i >= startIndex &&
                              i < startIndex + durationSlots
                            )
                              return "#1ac897";
                          }
                          return slot.available ? "#b1f0dc" : "#e0e0e0";
                        }),
                        borderRadius: 6,
                        barThickness: 20,
                      },
                    ],
                  }}
                  options={{
                    indexAxis: "y" as const,
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    onClick: (event, elements) => {
                      if (elements.length > 0) {
                        const index = elements[0].index;
                        const slot = availableSlots[index];
                        if (slot.available) handleSlotClick(slot.time);
                      }
                    },
                  }}
                />
              </div>
            )
          ) : (
            <p className="text-gray-500">
              Selecione um serviço para ver os horários disponíveis.
            </p>
          )}

          <div className="flex justify-center mt-1 gap-2">
            <Button onClick={() => setStep(1)} variant="outlined" size="sm">
              Voltar
            </Button>
            {form.serviceId && (
              <Button
                onClick={() => setStep(3)}
                variant="outlined"
                size="sm"
                disabled={!selectedSlot}
              >
                Próximo
              </Button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg flex flex-col gap-4"
        >
          <Input
            type="text"
            placeholder="Nome do cliente"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          />

          <Select
            placeholder="Selecione um serviço"
            value={form.serviceId}
            onChange={(value) => setForm({ ...form, serviceId: value })}
            options={services.map((s) => ({ label: s.name, value: s.id }))}
            disabled={loadingServices}
          />

          <div className="flex justify-between mt-4">
            <Button onClick={() => setStep(2)} type="button" variant="outlined">
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isSaveDisabled}
              className="disabled:opacity-50"
            >
              Salvar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

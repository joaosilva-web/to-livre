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
import prismaToUI, { UIAppointment } from "@/lib/appointments";

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

// ...existing code...

export default function NewAppointmentPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<
    { id: string; name: string }[]
  >([]);
  // local appointments are fetched and normalized below; no persistent state needed
  const [form, setForm] = useState({
    clientName: "",
    serviceId: "",
    professionalId: "",
    startTime: "",
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [professionalsError, setProfessionalsError] = useState<string | null>(
    null
  );
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pega companyId por meio do endpoint /api/auth/whoami (cookie-based JWT)
  useEffect(() => {
    const fetchWhoami = async () => {
      try {
        const res = await fetch("/api/auth/whoami");
        if (!res.ok) {
          setAuthError("Não autenticado. Faça login para continuar.");
          return console.warn("whoami returned not ok");
        }
        const body = await res.json();
        if (body?.user?.companyId) {
          setCompanyId(body.user.companyId);
          setAuthError(null);
        } else {
          setAuthError("Conta sem empresa vinculada ou sessão inválida.");
        }
      } catch (err) {
        console.error("Erro ao chamar whoami:", err);
        setAuthError("Erro ao verificar autenticação. Tente novamente.");
      }
    };

    fetchWhoami();
  }, []);

  // Redirect to auth page if we detected an auth error
  useEffect(() => {
    if (authError) {
      // redirect to auth page with next param so user can return after login
      try {
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "/";
        router.push(`/auth?next=${encodeURIComponent(currentPath)}`);
      } catch {
        router.push("/auth");
      }
    }
  }, [authError, router]);

  // Fetch serviços
  useEffect(() => {
    if (!companyId) return;
    // If we have an auth error, skip fetching services
    if (authError) return;
    setServicesError(null);
    setLoadingServices(true);
    fetch(`/api/services?companyId=${companyId}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            body?.error || res.statusText || "Erro ao buscar serviços";
          throw new Error(msg);
        }
        return body ?? [];
      })
      .then((resData) => {
        // API may return either a raw array or an ApiResponse with `.data`
        const list = Array.isArray(resData)
          ? resData
          : Array.isArray(resData?.data)
          ? resData.data
          : [];
        setServices(list);
      })
      .catch((err) => {
        console.error("Erro ao buscar serviços:", err);
        setServices([]);
        setServicesError(String(err?.message ?? err));
      })
      .finally(() => setLoadingServices(false));
  }, [companyId, authError]);

  // Fetch professionals for the company so we can attach a professionalId to the appointment
  useEffect(() => {
    if (!companyId) return;
    setProfessionalsError(null);
    fetch(`/api/company/${companyId}/professionals`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            body?.error || res.statusText || "Erro ao buscar profissionais";
          throw new Error(msg);
        }
        return body ?? { data: [] };
      })
      .then((resData) => {
        const list = Array.isArray(resData)
          ? resData
          : Array.isArray(resData?.data)
          ? resData.data
          : [];
        setProfessionals(list);
        // set default professionalId if none selected, but avoid reading `form` from closure
        if (list.length > 0) {
          setForm((prev) =>
            prev.professionalId ? prev : { ...prev, professionalId: list[0].id }
          );
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar profissionais:", err);
        setProfessionals([]);
        setProfessionalsError(String(err?.message ?? err));
      });
  }, [companyId]);

  // Fetch appointments e gera slots
  useEffect(() => {
    if (!selectedDate || !form.serviceId || !companyId) return;

    const selectedService = services.find((s) => s.id === form.serviceId);
    if (!selectedService) return;

    setSlotsError(null);
    setLoadingSlots(true);

    const fetchSlots = async () => {
      const dateStr = selectedDate.toISOString().split("T")[0];

      // Horários de funcionamento
      // the API is exposed at /api/working-hours?companyId=... (not under /api/companies/...)
      const resHours = await fetch(
        `/api/working-hours?companyId=${companyId}&date=${dateStr}`
      );
      const resHoursJson = await resHours.json();
      type WorkingHour = {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
      };
      const workingHours: WorkingHour[] = Array.isArray(resHoursJson)
        ? resHoursJson
        : Array.isArray(resHoursJson?.data)
        ? resHoursJson.data
        : [];

      // Agendamentos existentes
      const resAppointments = await fetch(
        `/api/appointments?companyId=${companyId}&from=${dateStr}&to=${dateStr}`
      );
      const resAppointmentsJson = await resAppointments.json();
      const rawArray: PrismaAppointment[] = Array.isArray(resAppointmentsJson)
        ? resAppointmentsJson
        : Array.isArray(resAppointmentsJson?.data)
        ? resAppointmentsJson.data
        : [];

      // normalize server appointments to UI-friendly shape
      const data = rawArray
        .map((r) => prismaToUI(r))
        .filter((x): x is NonNullable<typeof x> => Boolean(x));

      // Use shared slot generation util to compute availability
      try {
        const { default: generateSlots } = await import("@/lib/slotGeneration");
        // Note: generateSlots currently uses the provided durationMinutes for appt overlap checks
        // build a map serviceId -> duration from services state
        const serviceDurationMap: Record<string, number> = Object.fromEntries(
          services.map((s) => [s.id, s.duration])
        );
        const debug = process.env.NODE_ENV === "development";

        const slots = generateSlots(
          selectedDate,
          workingHours,
          selectedService.duration,
          data as unknown as UIAppointment[],
          serviceDurationMap,
          debug
        );
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Erro ao gerar slots:", err);
        setSlotsError(String(err ?? "Erro ao gerar slots"));
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
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

      const professionalId = form.professionalId || professionals[0]?.id;
      if (!professionalId) throw new Error("professionalId não informado");

      setSubmitError(null);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, professionalId, companyId }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body?.error ||
          body?.message ||
          res.statusText ||
          "Erro ao criar agendamento";
        setSubmitError(String(msg));
        throw new Error(msg);
      }

      router.push("/dashboard/appointments");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar agendamento: " + String(err));
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
          <div className="flex flex-row gap-2">
            <Select
              placeholder="Selecione um serviço"
              value={form.serviceId}
              onChange={(value) => setForm({ ...form, serviceId: value })}
              options={services.map((s) => ({ label: s.name, value: s.id }))}
              disabled={loadingServices}
            />
            {servicesError && (
              <p className="text-red-500 text-sm mt-1">{servicesError}</p>
            )}

            <Select
              placeholder="Selecione um profissional"
              value={form.professionalId}
              onChange={(value) => setForm({ ...form, professionalId: value })}
              options={professionals.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
              disabled={professionals.length === 0}
            />
            {professionalsError && (
              <p className="text-red-500 text-sm mt-1">{professionalsError}</p>
            )}
          </div>

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
          {slotsError && (
            <p className="text-red-500 text-sm mt-2">{slotsError}</p>
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
            {submitError && (
              <p className="text-red-600 text-sm mr-2 self-center">
                {submitError}
              </p>
            )}
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

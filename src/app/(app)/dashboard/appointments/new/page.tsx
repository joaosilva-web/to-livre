"use client";

import { useState, useEffect } from "react";
import useSession from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Select from "@/app/components/ui/Select";
import { useToast } from "@/app/components/ui/ToastErrorProvider";
import { z } from "zod";
import { Appointment as PrismaAppointment } from "@/generated/prisma";
import prismaToUI, { UIAppointment } from "@/lib/appointments";
import { formatDateLocal } from "@/lib/date";

import SlotGrid from "../components/SlotGrid";
import AuthBanner from "@/app/components/AuthBanner";

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
  const { user, error: sessionError } = useSession();
  const companyId = user?.companyId ?? null;

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
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [professionalsError, setProfessionalsError] = useState<string | null>(
    null
  );
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  const getErrMessage = (err: unknown) => {
    if (!err) return String(err);
    if (typeof err === "string") return err;
    if (err instanceof Error) return err.message;
    try {
      return String((err as { message?: unknown }).message ?? err);
    } catch {
      return String(err);
    }
  };

  // If session error exists, banner will be shown to allow Retry/Login

  // Fetch serviços
  useEffect(() => {
    if (!companyId) return;
    // If we have a session error, skip fetching services
    if (sessionError) return;
    setServicesError(null);
    setLoadingServices(true);
    (async () => {
      try {
        const res = await fetch(`/api/services?companyId=${companyId}`);
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            body?.error || res.statusText || "Erro ao buscar serviços";
          throw new Error(msg);
        }
        const list = Array.isArray(body)
          ? body
          : Array.isArray(body?.data)
          ? body.data
          : [];
        setServices(list as Service[]);
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
        setServices([]);
        const msg = getErrMessage(err);
        setServicesError(msg);
        try {
          showToast.error?.(msg as string);
        } catch {}
      } finally {
        setLoadingServices(false);
      }
    })();
  }, [companyId, sessionError, showToast]);

  // Fetch professionals for the company so we can attach a professionalId to the appointment
  useEffect(() => {
    if (!companyId) return;
    setProfessionalsError(null);
    setLoadingProfessionals(true);
    (async () => {
      try {
        const res = await fetch(`/api/company/${companyId}/professionals`);
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            body?.error || res.statusText || "Erro ao buscar profissionais";
          throw new Error(msg);
        }
        const list = Array.isArray(body)
          ? body
          : Array.isArray(body?.data)
          ? body.data
          : [];
        setProfessionals(list as { id: string; name: string }[]);
        if (list.length > 0) {
          setForm((prev) =>
            prev.professionalId ? prev : { ...prev, professionalId: list[0].id }
          );
        }
      } catch (err) {
        console.error("Erro ao buscar profissionais:", err);
        setProfessionals([]);
        const msg = getErrMessage(err);
        setProfessionalsError(msg);
        try {
          showToast.error?.(msg as string);
        } catch {}
      } finally {
        setLoadingProfessionals(false);
      }
    })();
  }, [companyId, showToast]);

  // Fetch appointments e gera slots
  useEffect(() => {
    if (!selectedDate || !form.serviceId || !companyId) return;

    const selectedService = services.find((s) => s.id === form.serviceId);
    if (!selectedService) return;

    setSlotsError(null);
    setLoadingSlots(true);

    const fetchSlots = async () => {
      const dateStr = formatDateLocal(selectedDate);

      // Horários de funcionamento
      const resHours = await fetch(
        `/api/working-hours?companyId=${companyId}&date=${dateStr}`
      );
      const hoursBody = await resHours.json().catch(() => null);
      if (!resHours.ok) {
        const msg =
          hoursBody?.error || resHours.statusText || "Erro ao buscar horários";
        throw new Error(msg);
      }
      type WorkingHour = {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
      };
      const workingHours: WorkingHour[] = Array.isArray(hoursBody)
        ? hoursBody
        : Array.isArray(hoursBody?.data)
        ? hoursBody.data
        : [];

      // Agendamentos existentes
      const resAppointments = await fetch(
        `/api/appointments?companyId=${companyId}&from=${dateStr}&to=${dateStr}`
      );
      const apptsBody = await resAppointments.json().catch(() => null);
      if (!resAppointments.ok) {
        const msg =
          apptsBody?.error ||
          resAppointments.statusText ||
          "Erro ao buscar agendamentos";
        throw new Error(msg);
      }
      const rawArray: PrismaAppointment[] = Array.isArray(apptsBody)
        ? apptsBody
        : Array.isArray(apptsBody?.data)
        ? apptsBody.data
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
        const msg = String(err ?? "Erro ao gerar slots");
        setSlotsError(msg);
        try {
          showToast.error?.(msg);
        } catch {}
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, form.serviceId, services, companyId, showToast]);

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
      setSaving(true);
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

      try {
        showToast.success?.("Agendamento criado com sucesso.");
      } catch {}
      // small delay to allow toast to appear before redirect
      setTimeout(() => router.push("/dashboard/appointments"), 700);
    } catch (err) {
      console.error(err);
      try {
        showToast.error?.("Erro ao criar agendamento: " + String(err));
      } catch {}
    } finally {
      setSaving(false);
    }
  };

  const isSaveDisabled =
    !selectedSlot ||
    !availableSlots.find((s) => s.time === selectedSlot)?.available;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)]">
      <h1 className="text-2xl font-bold mb-2">Novo Agendamento</h1>

      <AuthBanner />

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
              loading={loadingServices}
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
              loading={loadingProfessionals}
              disabled={loadingProfessionals || professionals.length === 0}
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
                <SlotGrid
                  slots={availableSlots}
                  selected={selectedSlot}
                  onSelect={(time: string) => handleSlotClick(time)}
                  cols={10}
                />
                {slotsError && (
                  <p className="text-red-500 text-sm mt-2">{slotsError}</p>
                )}
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
            <Button
              onClick={() => setStep(2)}
              type="button"
              variant="outlined"
              size="sm"
            >
              Voltar
            </Button>
            {submitError && (
              <p className="text-red-600 text-sm mr-2 self-center">
                {submitError}
              </p>
            )}
            <div className="flex items-center gap-3">
              {/* success is shown via toast */}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaveDisabled}
                loading={saving}
              >
                Salvar
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

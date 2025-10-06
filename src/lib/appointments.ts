import { Appointment as PrismaAppointment } from "@/generated/prisma";

export interface UIAppointment {
  id: string;
  clientName: string;
  service: string; // service name (if relation expanded) or serviceId fallback
  serviceId?: string; // original serviceId from Prisma
  professionalId?: string;
  professionalName?: string;
  price: number;
  date: string; // ISO-like yyyy-mm-ddTHH:MM
  status: PrismaAppointment["status"];
}

/**
 * Converte um objeto Appointment do Prisma para o formato usado pela UI.
 * Faz parsing seguro de campos opcionais (price, serviceId/startTime etc.).
 */
export function prismaToUI(
  appt: PrismaAppointment | null | undefined
): UIAppointment | null {
  if (!appt) return null;

  const start = appt.startTime ? new Date(appt.startTime) : new Date();
  // prefer relational `service.name` if relation is expanded, otherwise fallback to serviceId
  const apptRecord = appt as Record<string, unknown>;
  let service = "";
  if (apptRecord.service) {
    // if the relation was expanded by Prisma include, `service` will be an object
    if (typeof apptRecord.service === "object" && apptRecord.service !== null) {
      const svc = apptRecord.service as Record<string, unknown>;
      if (typeof svc.name === "string") service = svc.name as string;
    } else if (typeof apptRecord.service === "string") {
      // support legacy cases where `service` might be a string
      service = apptRecord.service as string;
    }
  }
  if (!service) service = appt.serviceId ?? "";

  // professional name fallback
  let professionalName = "";
  if (apptRecord.professional) {
    if (
      typeof apptRecord.professional === "object" &&
      apptRecord.professional !== null
    ) {
      const prof = apptRecord.professional as Record<string, unknown>;
      if (typeof prof.name === "string") professionalName = prof.name as string;
    } else if (typeof apptRecord.professional === "string") {
      professionalName = apptRecord.professional as string;
    }
  }
  const professionalId = appt.professionalId ?? undefined;
  // determine price: prefer explicit appointment price, otherwise try related service.price
  let price = typeof appt.price === "number" ? appt.price : undefined;
  if (
    price === undefined &&
    apptRecord.service &&
    typeof apptRecord.service === "object"
  ) {
    const svc = apptRecord.service as Record<string, unknown>;
    if (typeof svc.price === "number") price = svc.price;
  }
  if (price === undefined) price = 0;

  return {
    id: appt.id,
    clientName: appt.clientName ?? "",
    service: String(service),
    serviceId: appt.serviceId,
    price,
    // keep full ISO timestamp (with timezone) so client comparisons are accurate
    date: start.toISOString(),
    status: appt.status,
    professionalId,
    professionalName,
  };
}

/**
 * Converte o formato UI para o payload esperado pela API/Prisma.
 * Recebe um UIAppointment parcial (form) e converte date (string) para ISO.
 */
import { parseDateTimeLocal } from "@/lib/date";

export function uiToPrisma(
  form: Partial<UIAppointment> & { serviceId?: string }
) {
  const startTime = form.date
    ? parseDateTimeLocal(String(form.date)).toISOString()
    : undefined;
  return {
    clientName: form.clientName,
    // support legacy `service` field from UI forms (fallback) and prefer explicit serviceId
    serviceId:
      form.serviceId ?? (form as Record<string, unknown>).service ?? undefined,
    price: form.price,
    startTime,
  };
}

export default prismaToUI;

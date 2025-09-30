import { Appointment as PrismaAppointment } from "@/generated/prisma";

export interface UIAppointment {
  id: string;
  clientName: string;
  service: string; // service name (if relation expanded) or serviceId fallback
  serviceId?: string; // original serviceId from Prisma
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
  // prefer relational `service` string if populated, otherwise fallback to serviceId
  const hasServiceProp = (o: unknown): o is { service?: unknown } => {
    return (
      !!o &&
      typeof o === "object" &&
      "service" in (o as Record<string, unknown>)
    );
  };

  const apptRecord = appt as Record<string, unknown>;
  const service =
    hasServiceProp(appt) && typeof apptRecord.service === "string"
      ? (apptRecord.service as string)
      : appt.serviceId ?? "";
  return {
    id: appt.id,
    clientName: appt.clientName ?? "",
    service: String(service),
    serviceId: appt.serviceId,
    price: appt.price ?? 0,
    // keep full ISO timestamp (with timezone) so client comparisons are accurate
    date: start.toISOString(),
    status: appt.status,
  };
}

/**
 * Converte o formato UI para o payload esperado pela API/Prisma.
 * Recebe um UIAppointment parcial (form) e converte date (string) para ISO.
 */
export function uiToPrisma(
  form: Partial<UIAppointment> & { serviceId?: string }
) {
  const startTime = form.date ? new Date(form.date).toISOString() : undefined;
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

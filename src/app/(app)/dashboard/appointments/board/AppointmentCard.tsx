"use client";

"use client";

import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Clock, CheckCircle, Check, Edit as EditIcon } from "lucide-react";
import { UIAppointment } from "@/lib/appointments";
import formatBRL from "@/lib/currency";

interface Props {
  appt: UIAppointment;
  onEdit: (appt: UIAppointment) => void;
  updating?: boolean;
  onRequestStatusChange?: (
    apptId: string,
    targetStatus: string
  ) => Promise<void>;
  showProfessionalWhenNoFilter?: boolean;
}

export default function AppointmentCard({
  appt,
  onEdit,
  updating,
  onRequestStatusChange,
  showProfessionalWhenNoFilter,
}: Props) {
  // No DnD: simple non-draggable card

  return (
    <div className={`bg-white rounded-md shadow p-3 mb-3`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-semibold text-sm">{appt.clientName}</div>
          <div className="text-xs text-gray-500">{appt.service}</div>
          {/* show professional name when requested (board has no specific professional filter) */}
          {showProfessionalWhenNoFilter && appt.professionalName ? (
            <div className="text-xs text-gray-600">{appt.professionalName}</div>
          ) : null}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {new Date(appt.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-xs text-gray-500">{formatBRL(appt.price)}</div>
        </div>
      </div>

      {/* drag removed - controls only via buttons */}

      {/* Single-line controls: status buttons + edit */}
      <div className="mt-2 flex justify-end items-center gap-2">
        {updating && <div className="loader mr-2" aria-hidden />}

        <div className="flex gap-1 items-center">
          {/* Pendente */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label="Mudar para Pendente"
                  onClick={() => {
                    if (appt.status !== "PENDING")
                      onRequestStatusChange?.(appt.id, "PENDING");
                  }}
                  className={`btn-status status-btn btn-status ${
                    appt.status === "PENDING"
                      ? "status-active bg-feedback-warning-dark text-on-primary"
                      : "opacity-60 hover:opacity-100 bg-feedback-warning text-on-warning"
                  }`}
                >
                  <Clock size={14} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="top"
                align="center"
                className="rounded bg-black text-white text-xs px-2 py-1"
              >
                Mudar para Pendente
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>

          {/* Confirmado */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label="Mudar para Confirmado"
                  onClick={() => {
                    if (appt.status !== "CONFIRMED")
                      onRequestStatusChange?.(appt.id, "CONFIRMED");
                  }}
                  className={`btn-status status-btn ${
                    appt.status === "CONFIRMED"
                      ? "status-active bg-feedback-info text-on-primary"
                      : "opacity-60 hover:opacity-100 bg-feedback-info text-on-primary"
                  }`}
                >
                  <Check size={14} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="top"
                align="center"
                className="rounded bg-black text-white text-xs px-2 py-1"
              >
                Mudar para Confirmado
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>

          {/* Concluído */}
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label="Mudar para Concluído"
                  onClick={() => {
                    if (appt.status !== "COMPLETED")
                      onRequestStatusChange?.(appt.id, "COMPLETED");
                  }}
                  className={`btn-status status-btn ${
                    appt.status === "COMPLETED"
                      ? "status-active bg-feedback-success text-on-primary"
                      : "opacity-60 hover:opacity-100 bg-feedback-success text-on-primary"
                  }`}
                >
                  <CheckCircle size={14} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content
                side="top"
                align="center"
                className="rounded bg-black text-white text-xs px-2 py-1"
              >
                Mudar para Concluído
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => onEdit(appt)}
                className="ml-2 btn-status status-btn bg-primary-custom text-on-primary hover:shadow-sm"
                aria-label="Editar agendamento"
              >
                <EditIcon size={14} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content
              side="top"
              align="center"
              className="rounded bg-black text-white text-xs px-2 py-1"
            >
              Editar
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
    </div>
  );
}

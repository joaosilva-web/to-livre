// src/app/dashboard/appointments/components/AppointmentsList.tsx
"use client";

import { Badge } from "@radix-ui/themes";

interface Props {
  appointments: any[];
  onEdit: (appointment: any) => void;
  refresh: () => void;
}

export default function AppointmentsList({
  appointments,
  onEdit,
  refresh,
}: Props) {
  const handleCancel = async (id: string) => {
    if (!confirm("Deseja cancelar este agendamento?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    refresh();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "yellow";
      case "CONFIRMED":
        return "green";
      case "COMPLETED":
        return "blue";
      case "CANCELED":
        return "red";
      default:
        return undefined;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Serviço
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preço
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {appt.clientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {appt.service}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(appt.date).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                R$ {appt.price.toFixed(2)}
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm font-semibold rounded ${statusColor(
                  appt.status
                )}`}
              >
                <Badge color={statusColor(appt.status)}>{appt.status}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap flex justify-center gap-2">
                <button
                  onClick={() => onEdit(appt)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleCancel(appt.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Modal from "@/app/components/ui/Modal";
import { useToast } from "@/app/components/ui/ToastErrorProvider";

interface WorkingHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

interface Props {
  companyId: string;
}

// Use runtime normalization for API responses: server may return raw arrays or { data: [...] }

export default function WorkingHoursForm({ companyId }: Props) {
  const [hours, setHours] = useState<WorkingHour[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkingHour | null>(null);
  const [newHour, setNewHour] = useState<Omit<WorkingHour, "id">>({
    dayOfWeek: 0,
    openTime: "",
    closeTime: "",
  });

  const showToast = useToast();
  const daysOfWeek = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  const fetchHours = useCallback(async () => {
    try {
      const res = await fetch(`/api/working-hours?companyId=${companyId}`);
      const readApi = async <T,>(res: Response): Promise<T[]> => {
        const body = await res.json().catch(() => null);
        const list = Array.isArray(body) ? body : body?.data ?? [];
        if (!Array.isArray(list)) return [];
        return list as T[];
      };

      const data = await readApi<WorkingHour>(res);
      setHours(data);
    } catch {
      showToast("Erro ao carregar horários", "error");
    }
  }, [companyId, showToast]);

  useEffect(() => {
    fetchHours();
  }, [fetchHours]);

  const handleSave = async (hour?: WorkingHour) => {
    const id = hour?.id || "new";
    setSavingId(id);

    try {
      const payload = hour ? hour : { ...newHour, companyId };
      const res = await fetch(
        hour ? `/api/working-hours/${hour.id}` : "/api/working-hours",
        {
          method: hour ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => null);
      // body may be ApiEnvelope or an object with error fields
      if (body && body.success === false) {
        const details = Array.isArray(body.errorDetails)
          ? body.errorDetails
          : [];
        if (details.length > 0) {
          type ErrDetail = { path?: string | string[]; message: string };
          details.forEach((err: ErrDetail) => {
            const path = Array.isArray(err.path)
              ? err.path.join(".")
              : err.path ?? "";
            showToast(path ? `${path}: ${err.message}` : err.message, "error");
          });
        } else {
          showToast(body.error || "Erro ao salvar horário", "error");
        }
        return;
      }

      setNewHour({ dayOfWeek: 0, openTime: "", closeTime: "" });
      await fetchHours();
      showToast("Horário salvo com sucesso!", "success");
    } catch (err) {
      const error = err as Error;
      showToast(
        error.message || "Erro desconhecido ao salvar horário",
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeletingId(deleteTarget.id);
    try {
      const res = await fetch(`/api/working-hours/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => null);
      if (body && body.success === false)
        throw new Error(body.error || "Erro ao deletar horário");

      await fetchHours();
      showToast("Horário excluído com sucesso!", "success");
      setDeleteTarget(null);
    } catch (err) {
      const error = err as Error;
      showToast(
        error.message || "Erro desconhecido ao deletar horário",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold">Horários de Funcionamento</h3>

      {/* Lista de horários */}
      <div className="flex flex-col gap-2">
        {hours.map((hour) => (
          <div
            key={hour.id}
            className="flex items-center gap-2 bg-gray-50 p-2 rounded"
          >
            <select
              value={hour.dayOfWeek}
              onChange={(e) =>
                setHours((prev) =>
                  prev.map((h) =>
                    h.id === hour.id
                      ? { ...h, dayOfWeek: Number(e.target.value) }
                      : h
                  )
                )
              }
            >
              {daysOfWeek.map((day, i) => (
                <option key={i} value={i}>
                  {day}
                </option>
              ))}
            </select>

            <Input
              type="time"
              value={hour.openTime}
              onChange={(e) =>
                setHours((prev) =>
                  prev.map((h) =>
                    h.id === hour.id ? { ...h, openTime: e.target.value } : h
                  )
                )
              }
            />
            <Input
              type="time"
              value={hour.closeTime}
              onChange={(e) =>
                setHours((prev) =>
                  prev.map((h) =>
                    h.id === hour.id ? { ...h, closeTime: e.target.value } : h
                  )
                )
              }
            />

            <Button
              size="sm"
              onClick={() => handleSave(hour)}
              disabled={savingId === hour.id}
              loading={savingId === hour.id}
            >
              Salvar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteTarget(hour)}
              disabled={deletingId === hour.id}
              loading={deletingId === hour.id}
            >
              Excluir
            </Button>
          </div>
        ))}
      </div>

      {/* Novo horário */}
      <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
        <select
          value={newHour.dayOfWeek}
          onChange={(e) =>
            setNewHour({ ...newHour, dayOfWeek: Number(e.target.value) })
          }
        >
          {daysOfWeek.map((day, i) => (
            <option key={i} value={i}>
              {day}
            </option>
          ))}
        </select>
        <Input
          type="time"
          value={newHour.openTime}
          onChange={(e) => setNewHour({ ...newHour, openTime: e.target.value })}
        />
        <Input
          type="time"
          value={newHour.closeTime}
          onChange={(e) =>
            setNewHour({ ...newHour, closeTime: e.target.value })
          }
        />
        <Button
          size="sm"
          onClick={() => handleSave()}
          disabled={savingId === "new"}
          loading={savingId === "new"}
        >
          Adicionar
        </Button>
      </div>

      {/* Modal de confirmação */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar exclusão"
      >
        <p className="mb-4">
          Tem certeza que deseja excluir o horário de{" "}
          <span className="font-semibold">
            {deleteTarget ? daysOfWeek[deleteTarget.dayOfWeek] : ""}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDeleteTarget(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={confirmDelete}
            loading={deletingId === deleteTarget?.id}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}

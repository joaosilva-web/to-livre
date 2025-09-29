"use client";

import { useEffect, useState } from "react";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/components/ui/ToastErrorProvider";
import Modal from "@/app/components/ui/Modal";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Props {
  companyId: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: { path?: string | string[]; message: string }[];
}

export default function ServicesForm({ companyId }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Omit<Service, "id">>({
    name: "",
    price: 0,
    duration: 0,
  });

  const showToast = useToast();

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/services?companyId=${companyId}`);
      const data: ApiResponse<Service[]> = await res.json();
      if (data.success && data.data) {
        setServices(data.data);
      }
    } catch {
      showToast("Erro ao carregar serviços", "error");
    }
  };

  useEffect(() => {
    fetchServices();
  }, [companyId]);

  const handleSave = async (service?: Service) => {
    const id = service?.id || "new";
    setSavingId(id);

    try {
      const payload = service ? service : { ...newService, companyId };
      const res = await fetch(
        service ? `/api/services/${service.id}` : "/api/services",
        {
          method: service ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data: ApiResponse<Service> = await res.json();
      if (!data.success) {
        if (Array.isArray(data.errorDetails)) {
          data.errorDetails.forEach((err) => {
            const path = Array.isArray(err.path)
              ? err.path.join(".")
              : err.path ?? "";
            showToast(path ? `${path}: ${err.message}` : err.message, "error");
          });
        } else {
          showToast(data.error || "Erro ao salvar serviço", "error");
        }
      } else {
        setNewService({ name: "", price: 0, duration: 0 });
        await fetchServices();
        showToast("Serviço salvo com sucesso!", "success");
      }
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao salvar serviço",
        "error"
      );
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const data: ApiResponse = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Erro ao deletar serviço");
      }

      await fetchServices();
      showToast("Serviço excluído com sucesso!", "success");
      setDeleteTarget(null);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao deletar serviço",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold">Serviços</h3>

      <div className="flex flex-col gap-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="flex items-center gap-2 bg-gray-50 p-2 rounded"
          >
            <Input
              value={service.name}
              onChange={(e) =>
                setServices((prev) =>
                  prev.map((s) =>
                    s.id === service.id ? { ...s, name: e.target.value } : s
                  )
                )
              }
              placeholder="Nome do serviço"
            />
            <Input
              type="number"
              value={service.price}
              onChange={(e) =>
                setServices((prev) =>
                  prev.map((s) =>
                    s.id === service.id
                      ? { ...s, price: Number(e.target.value) }
                      : s
                  )
                )
              }
              placeholder="Preço"
            />
            <Input
              type="number"
              value={service.duration}
              onChange={(e) =>
                setServices((prev) =>
                  prev.map((s) =>
                    s.id === service.id
                      ? { ...s, duration: Number(e.target.value) }
                      : s
                  )
                )
              }
              placeholder="Duração (min)"
            />
            <Button
              size="sm"
              onClick={() => handleSave(service)}
              disabled={savingId === service.id}
              loading={savingId === service.id}
            >
              Salvar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteTarget(service)}
              disabled={deletingId === service.id}
              loading={deletingId === service.id}
            >
              Excluir
            </Button>
          </div>
        ))}
      </div>

      {/* Novo serviço */}
      <div className="flex items-center gap-2 bg-white p-2 rounded shadow-sm">
        <Input
          value={newService.name}
          onChange={(e) =>
            setNewService({ ...newService, name: e.target.value })
          }
          placeholder="Nome do serviço"
        />
        <Input
          type="number"
          value={newService.price}
          onChange={(e) =>
            setNewService({ ...newService, price: Number(e.target.value) })
          }
          placeholder="Preço"
        />
        <Input
          type="number"
          value={newService.duration}
          onChange={(e) =>
            setNewService({ ...newService, duration: Number(e.target.value) })
          }
          placeholder="Duração (min)"
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
          Tem certeza que deseja excluir o serviço{" "}
          <span className="font-semibold">{deleteTarget?.name}</span>?
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

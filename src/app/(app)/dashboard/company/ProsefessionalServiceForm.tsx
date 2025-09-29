"use client";

import { useEffect, useState, useRef } from "react";
import Button from "@/app/components/ui/Button";
import { useToast } from "@/app/components/ui/ToastErrorProvider";

interface Professional {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

interface ProfessionalService {
  id: string;
  professionalId: string;
  serviceId: string;
  service: Service;
  professional: Professional;
}

interface Props {
  companyId: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: { path?: string; message: string }[];
}

export default function ProfessionalServiceForm({ companyId }: Props) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [associations, setAssociations] = useState<ProfessionalService[]>([]);
  const [filteredAssociations, setFilteredAssociations] = useState<
    ProfessionalService[]
  >([]);
  const [newAssoc, setNewAssoc] = useState<{
    professionalId: string;
    serviceId: string;
  }>({
    professionalId: "",
    serviceId: "",
  });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterProfessionalId, setFilterProfessionalId] = useState<string>("");
  const [filterServiceName, setFilterServiceName] = useState<string>("");

  const toast = useToast();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch dados
  const fetchProfessionals = async () => {
    try {
      const res = await fetch(`/api/company/${companyId}/professionals`);
      const data: ApiResponse<Professional[]> = await res.json();
      if (data.success && data.data) setProfessionals(data.data);
    } catch (err) {
      toast(
        (err as Error).message || "Erro ao carregar profissionais",
        "error"
      );
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/services?companyId=${companyId}`);
      const data: ApiResponse<Service[]> = await res.json();
      if (data.success && data.data) setServices(data.data);
    } catch (err) {
      toast((err as Error).message || "Erro ao carregar serviços", "error");
    }
  };

  const fetchAssociations = async () => {
    try {
      const url = filterProfessionalId
        ? `/api/professional-service?professionalId=${filterProfessionalId}`
        : `/api/professional-service?companyId=${companyId}`; // <- usa companyId quando não tiver filtro

      const res = await fetch(url);
      const data: ApiResponse<ProfessionalService[]> = await res.json();

      if (data.success && data.data) {
        setAssociations(data.data);
        setFilteredAssociations(data.data);
      }
    } catch (err) {
      toast((err as Error).message || "Erro ao carregar associações", "error");
    }
  };

  useEffect(() => {
    fetchProfessionals();
    fetchServices();
    fetchAssociations();
  }, [companyId, filterProfessionalId]);

  // Debounce na pesquisa
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      let filtered = associations;
      if (filterProfessionalId) {
        filtered = filtered.filter(
          (a) => a.professionalId === filterProfessionalId
        );
      }
      if (filterServiceName) {
        filtered = filtered.filter((a) =>
          a.service.name.toLowerCase().includes(filterServiceName.toLowerCase())
        );
      }
      setFilteredAssociations(filtered);
    }, 300); // 300ms debounce
  }, [filterProfessionalId, filterServiceName, associations]);

  // CRUD
  const handleSave = async () => {
    if (!newAssoc.professionalId || !newAssoc.serviceId) {
      toast("Selecione profissional e serviço", "error");
      return;
    }
    setSavingId("new");

    try {
      const res = await fetch(`/api/professional-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAssoc),
      });
      const data: ApiResponse<ProfessionalService> = await res.json();

      if (!data.success) {
        if (Array.isArray(data.errorDetails)) {
          data.errorDetails.forEach((err) =>
            toast(`${err.path}: ${err.message}`, "error")
          );
        } else {
          toast(data.error || "Erro ao salvar associação", "error");
        }
        return;
      }

      setNewAssoc({ professionalId: "", serviceId: "" });
      fetchAssociations();
      toast("Associação criada com sucesso!", "success");
    } catch (err) {
      toast((err as Error).message || "Erro desconhecido", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/professional-service/${id}`, {
        method: "DELETE",
      });
      const data: ApiResponse<void> = await res.json();
      if (!data.success)
        throw new Error(data.error || "Erro ao deletar associação");

      fetchAssociations();
      toast("Associação removida com sucesso!", "success");
    } catch (err) {
      toast((err as Error).message || "Erro desconhecido", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold">Serviços por Profissional</h3>

      {/* Formulário de nova associação */}
      <div className="flex gap-2 items-center">
        <select
          className="p-2 border rounded"
          value={newAssoc.professionalId}
          onChange={(e) =>
            setNewAssoc({ ...newAssoc, professionalId: e.target.value })
          }
        >
          <option value="">Selecione um profissional</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={newAssoc.serviceId}
          onChange={(e) =>
            setNewAssoc({ ...newAssoc, serviceId: e.target.value })
          }
        >
          <option value="">Selecione um serviço</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={savingId === "new"}
          loading={savingId === "new"}
        >
          Adicionar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 items-center">
        <select
          className="p-2 border rounded"
          value={filterProfessionalId}
          onChange={(e) => setFilterProfessionalId(e.target.value)}
        >
          <option value="">Filtrar por profissional</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Pesquisar serviço..."
          value={filterServiceName}
          onChange={(e) => setFilterServiceName(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Profissional</th>
              <th className="border px-2 py-1">Serviço</th>
              <th className="border px-2 py-1">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssociations.map((assoc) => (
              <tr key={assoc.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">
                  {assoc.professional?.name || "-"}
                </td>
                <td className="border px-2 py-1">
                  {assoc.service?.name || "-"}
                </td>
                <td className="border px-2 py-1">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(assoc.id)}
                    disabled={deletingId === assoc.id}
                    loading={deletingId === assoc.id}
                  >
                    Remover
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

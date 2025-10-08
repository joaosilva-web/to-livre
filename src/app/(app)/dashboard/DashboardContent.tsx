"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
} from "recharts";
import formatBRL from "@/lib/currency";

const COLORS = ["#1AC897", "#8884d8", "#FF8042", "#82ca9d", "#FFBB28"];

export default function DashboardContent() {
  const appointmentsData = useMemo(
    () => [
      { day: "Seg", agendados: 5, concluidos: 4 },
      { day: "Ter", agendados: 8, concluidos: 6 },
      { day: "Qua", agendados: 4, concluidos: 3 },
      { day: "Qui", agendados: 7, concluidos: 7 },
      { day: "Sex", agendados: 10, concluidos: 9 },
    ],
    []
  );

  const weeklyAppointments = useMemo(
    () => [
      { week: "Semana 1", agendamentos: 22 },
      { week: "Semana 2", agendamentos: 27 },
      { week: "Semana 3", agendamentos: 19 },
      { week: "Semana 4", agendamentos: 31 },
    ],
    []
  );

  const revenueData = useMemo(
    () => [
      { month: "Mai", receita: 1200 },
      { month: "Jun", receita: 1800 },
      { month: "Jul", receita: 1500 },
      { month: "Ago", receita: 2100 },
      { month: "Set", receita: 2400 },
      { month: "Out", receita: 2000 },
    ],
    []
  );

  const servicesData = useMemo(
    () => [
      { name: "Corte", value: 40 },
      { name: "Barba", value: 25 },
      { name: "Coloração", value: 20 },
      { name: "Tratamento", value: 15 },
    ],
    []
  );

  const cancelReasons = useMemo(
    () => [
      { name: "Cliente desistiu", value: 12 },
      { name: "Profissional indisponível", value: 5 },
      { name: "Remarcado", value: 8 },
    ],
    []
  );

  return (
    <div className="min-h-screen flex flex-col gap-8 p-6 bg-background shadow rounded-2xl">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-secondary">
            Agendamentos Hoje
          </h2>
          <p className="text-3xl font-bold text-primary">12</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-secondary">
            Taxa de Comparecimento
          </h2>
          <p className="text-3xl font-bold text-primary">85%</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-text-secondary">
            Receita no Mês
          </h2>
          <p className="text-3xl font-bold text-primary">{formatBRL(2100)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agendamentos da Semana */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-text-secondary">
            Agendamentos da Semana
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="agendados" fill="#8884d8" />
              <Bar dataKey="concluidos" fill="#1AC897" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agendamentos por Semana */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-text-secondary">
            Tendência de Agendamentos (mês)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyAppointments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="agendamentos"
                stroke="#FF8042"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Receita Mensal */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-text-secondary">
            Receita nos últimos 6 meses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="receita" fill="#1AC897" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Serviços mais agendados */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-text-secondary">
            Serviços mais agendados
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={servicesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }: PieLabelRenderProps) =>
                  `${name} ${((percent as number) * 100).toFixed(0)}%`
                }
              >
                {servicesData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cancelamentos por Motivo */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-text-secondary">
            Cancelamentos por Motivo
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cancelReasons}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }: PieLabelRenderProps) =>
                  `${name} ${((percent as number) * 100).toFixed(0)}%`
                }
              >
                {cancelReasons.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

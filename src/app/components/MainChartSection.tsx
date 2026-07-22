'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { KPIStats, DepartmentSummary, MergedEmployee, TipoPersonal } from '../types';
import DepartmentCard from './DepartmentCard';
import { PieChart as PieIcon, TrendingUp, HelpCircle, BarChart3, Layers, Filter } from 'lucide-react';

interface MainChartSectionProps {
  stats: KPIStats;
  departmentSummaries: DepartmentSummary[];
  onDeptClick: (deptName: string) => void;
  employees: MergedEmployee[];
  selectedTipoPersonal: TipoPersonal | 'Todos';
  setSelectedTipoPersonal: (val: TipoPersonal | 'Todos') => void;
}

export default function MainChartSection({
  stats,
  departmentSummaries,
  onDeptClick,
  employees,
  selectedTipoPersonal,
  setSelectedTipoPersonal,
}: MainChartSectionProps) {
  const { certifiedCount, potentialCount, pendingCount, globalPercentage } = stats;

  const total = certifiedCount + potentialCount + pendingCount;

  // 1. Datos para la Donut Chart Principal (Filtrada por la selección activa)
  const chartData = [
    { name: 'Certificados', value: certifiedCount, color: '#10b981' },
    { name: 'Potencial', value: potentialCount, color: '#f59e0b' },
    { name: 'Por Certificar', value: pendingCount, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // 2. Cálculos para la Nueva Gráfica Comparativa: Certificación IDL vs DL (Cambio 5)
  const idlSubset = employees.filter(emp => emp.TipoPersonal === 'IDL');
  const dlSubset = employees.filter(emp => emp.TipoPersonal === 'DL');

  const getSubsetStats = (subset: MergedEmployee[]) => {
    const totalCount = subset.length;
    const certified = subset.filter(e => e.Estatus === 'Certificado').length;
    const potential = subset.filter(e => e.Estatus === 'Potencial').length;
    const pending = subset.filter(e => e.Estatus === 'Por Certificar').length;
    const pct = totalCount > 0 ? ((certified / totalCount) * 100).toFixed(1) : '0';
    return { total: totalCount, certified, potential, pending, percentage: pct };
  };

  const idlStats = getSubsetStats(idlSubset);
  const dlStats = getSubsetStats(dlSubset);

  const barChartData = [
    {
      name: 'IDL',
      'Certificados': idlStats.certified,
      'Potencial': idlStats.potential,
      'Por Certificar': idlStats.pending,
      total: idlStats.total,
      pct: idlStats.percentage,
    },
    {
      name: 'DL',
      'Certificados': dlStats.certified,
      'Potencial': dlStats.potential,
      'Por Certificar': dlStats.pending,
      total: dlStats.total,
      pct: dlStats.percentage,
    }
  ];

  // Tooltip personalizado para la Donut
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = total > 0 ? Math.round((data.value / total) * 100) : 0;
      return (
        <div className="bg-slate-900/95 dark:bg-[#273449] text-white border border-slate-700/50 dark:border-[#334155] p-3 rounded-xl shadow-xl text-xs font-bold backdrop-blur-md">
          <p className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </p>
          <p className="mt-1 text-slate-350 dark:text-[#cbd5e1]">
            Cantidad: <span className="text-[#f8fafc] font-extrabold">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-slate-355 dark:text-[#cbd5e1]">
            Porcentaje: <span className="text-[#f8fafc] font-extrabold">{percent}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Tooltip personalizado para la comparativa de barras
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const targetStats = label === 'IDL' ? idlStats : dlStats;
      return (
        <div className="bg-slate-900/95 dark:bg-[#273449] text-white border border-slate-700/50 dark:border-[#334155] p-3.5 rounded-xl shadow-xl text-xs font-bold backdrop-blur-md">
          <h4 className="text-sm font-extrabold text-[#f8fafc] mb-1.5 border-b border-slate-805/40 pb-1">
            Personal {label}
          </h4>
          <p className="text-slate-300 dark:text-[#cbd5e1] mb-1">
            HC Total: <span className="text-white font-extrabold">{targetStats.total}</span>
          </p>
          <p className="text-emerald-450 mb-0.5">
            Certificados: <span className="font-extrabold">{targetStats.certified} ({targetStats.percentage}%)</span>
          </p>
          <p className="text-amber-400 mb-0.5">
            Potencial: <span className="font-extrabold">{targetStats.potential}</span>
          </p>
          <p className="text-red-400">
            Por Certificar: <span className="font-extrabold">{targetStats.pending}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      
      {/* 1. DONUT CHART CARD WITH CONTROLS (Cambio 6) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-[480px] bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-[#f8fafc]">
                  Distribución de Certificación
                </h2>
              </div>
              <p className="text-xs text-slate-400 dark:text-[#cbd5e1] mt-0.5 font-semibold">
                Estado global del site
              </p>
            </div>
          </div>

          {/* Filtro directamente en la Donut (Cambio 6) */}
          <div className="flex items-center justify-between gap-1 p-1 bg-slate-100 dark:bg-[#273449] rounded-xl border border-slate-200 dark:border-[#334155] w-full">
            <button
              onClick={() => setSelectedTipoPersonal('Todos')}
              className={`flex-1 py-1 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer text-center ${
                selectedTipoPersonal === 'Todos'
                  ? 'bg-slate-900 text-white dark:bg-[#f8fafc] dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-[#cbd5e1] hover:text-slate-700 dark:hover:text-[#f8fafc]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedTipoPersonal('IDL')}
              className={`flex-1 py-1 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer text-center ${
                selectedTipoPersonal === 'IDL'
                  ? 'bg-slate-900 text-white dark:bg-[#f8fafc] dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-[#cbd5e1] hover:text-slate-700 dark:hover:text-[#f8fafc]'
              }`}
            >
              IDL
            </button>
            <button
              onClick={() => setSelectedTipoPersonal('DL')}
              className={`flex-1 py-1 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer text-center ${
                selectedTipoPersonal === 'DL'
                  ? 'bg-slate-900 text-white dark:bg-[#f8fafc] dark:text-slate-900 shadow-xs'
                  : 'text-slate-500 dark:text-[#cbd5e1] hover:text-slate-700 dark:hover:text-[#f8fafc]'
              }`}
            >
              DL
            </button>
          </div>
        </div>

        {/* Chart body */}
        <div className="relative w-full h-[230px] flex items-center justify-center mt-2">
          {total > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={30}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] font-extrabold text-slate-600 dark:text-[#cbd5e1]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center display */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400 tracking-tight leading-none">
                  {globalPercentage}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-[#cbd5e1] uppercase tracking-widest mt-1">
                  Certificados
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
              <HelpCircle className="w-12 h-12 stroke-1 mb-2 animate-pulse" />
              <span className="text-xs font-semibold">Sin datos cargados</span>
            </div>
          )}
        </div>

        {/* Quantities indicator bottom */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3 mt-1 border-t border-slate-100 dark:border-[#334155]">
          <div>
            <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              {certifiedCount.toLocaleString()}
            </div>
            <div className="text-[8px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
              Cert
            </div>
          </div>
          <div className="border-x border-slate-100 dark:border-[#334155]">
            <div className="text-xs font-extrabold text-amber-500">
              {potentialCount.toLocaleString()}
            </div>
            <div className="text-[8px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
              Pot
            </div>
          </div>
          <div>
            <div className="text-xs font-extrabold text-red-500">
              {pendingCount.toLocaleString()}
            </div>
            <div className="text-[8px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
              Pend
            </div>
          </div>
        </div>
      </div>

      {/* 2. NUEVA GRÁFICA COMPARATIVA: CERTIFICACIÓN IDL vs DL (Cambio 5) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-[480px] bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-[#f8fafc]">
              Certificación IDL vs DL
            </h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-[#cbd5e1] mt-0.5 font-semibold">
            Comparativa de estatus de avance
          </p>
        </div>

        {/* Bar chart body */}
        <div className="relative w-full h-[220px] flex items-center justify-center mt-3">
          {employees.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={11} 
                  fontWeight="bold" 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-[10px] font-bold text-slate-650 dark:text-[#cbd5e1]">{value}</span>}
                />
                <Bar dataKey="Certificados" fill="#10b981" stackId="a" />
                <Bar dataKey="Potencial" fill="#f59e0b" stackId="a" />
                <Bar dataKey="Por Certificar" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
              <HelpCircle className="w-12 h-12 stroke-1 mb-2 animate-pulse" />
              <span className="text-xs font-semibold">Sin datos</span>
            </div>
          )}
        </div>

        {/* Text descriptions bottom (Cambio 5) */}
        <div className="bg-slate-50 dark:bg-[#273449] border border-slate-100 dark:border-[#334155] rounded-xl p-3.5 flex flex-col gap-1.5 mt-2">
          <div className="text-[11px] font-bold flex justify-between items-center text-slate-600 dark:text-[#cbd5e1]">
            <span>IDL:</span>
            <span className="text-slate-800 dark:text-[#f8fafc]">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{idlStats.certified}</span> de {idlStats.total} <span className="text-slate-400 dark:text-[#94a3b8] font-medium">|</span> <span className="text-emerald-500 font-extrabold">{idlStats.percentage}%</span>
            </span>
          </div>
          <div className="text-[11px] font-bold flex justify-between items-center text-slate-600 dark:text-[#cbd5e1]">
            <span>DL:</span>
            <span className="text-slate-800 dark:text-[#f8fafc]">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{dlStats.certified}</span> de {dlStats.total} <span className="text-slate-400 dark:text-[#94a3b8] font-medium">|</span> <span className="text-emerald-500 font-extrabold">{dlStats.percentage}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. CERTIFICATION BY DEPARTMENT (col-span-1) */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col h-[480px] bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] lg:col-span-1">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-[#f8fafc]">
              Certificación por Departamento
            </h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-[#cbd5e1] mt-0.5 font-semibold">
            Haz clic para abrir el modal detallado
          </p>
        </div>

        {/* Scrollable grid list */}
        <div className="flex-1 overflow-y-auto pr-1">
          {departmentSummaries.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5 pb-2">
              {departmentSummaries.map((summary) => (
                <DepartmentCard
                  key={summary.Departamento}
                  summary={summary}
                  onClick={() => onDeptClick(summary.Departamento)}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-[#94a3b8] py-10">
              <HelpCircle className="w-12 h-12 stroke-1 mb-2 animate-pulse" />
              <span className="text-xs font-semibold">Cargue archivos para ver los departamentos</span>
            </div>
          )}
        </div>
      </div>
      
    </section>
  );
}

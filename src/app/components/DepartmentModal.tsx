'use client';

import React, { useState, useMemo } from 'react';
import { X, Download, FileSpreadsheet, FileText, Search, AlertCircle, Users, CheckCircle2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MergedEmployee, DepartmentSummary, TipoPersonal } from '../types';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';

interface DepartmentModalProps {
  deptName: string;
  deptSummary: DepartmentSummary;
  employees: MergedEmployee[];
  selectedTipoPersonal: TipoPersonal | 'Todos';
  onClose: () => void;
}

export default function DepartmentModal({
  deptName,
  deptSummary,
  employees,
  selectedTipoPersonal,
  onClose,
}: DepartmentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // ligeramente menor para ajustarse mejor a pantallas pequeñas

  // 1. Filtrar los empleados del departamento por el Tipo de Personal global
  const deptEmployeesByTipo = useMemo(() => {
    return employees.filter(emp => {
      if (selectedTipoPersonal !== 'Todos' && emp.TipoPersonal !== selectedTipoPersonal) {
        return false;
      }
      return true;
    });
  }, [employees, selectedTipoPersonal]);

  // Recalcular métricas específicas para el Tipo de Personal seleccionado dentro del modal
  const modalStats = useMemo(() => {
    const totalHC = deptEmployeesByTipo.length;
    const certified = deptEmployeesByTipo.filter(e => e.Estatus === 'Certificado').length;
    const potential = deptEmployeesByTipo.filter(e => e.Estatus === 'Potencial').length;
    const pending = deptEmployeesByTipo.filter(e => e.Estatus === 'Por Certificar').length;
    const percentage = totalHC > 0 ? Math.round((certified / totalHC) * 100) : 0;
    
    return { totalHC, certified, potential, pending, percentage };
  }, [deptEmployeesByTipo]);

  const { totalHC, certified, potential, pending, percentage } = modalStats;
  const faltantes = potential + pending;

  // 2. Filtrar para la lista detallada de no certificados aplicando la búsqueda
  const pendingEmployees = useMemo(() => {
    return deptEmployeesByTipo.filter((emp) => {
      // Excluir certificados
      if (emp.Estatus === 'Certificado') return false;
      
      // Filtrar por búsqueda de texto
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        return (
          emp.Nombre.toLowerCase().includes(term) ||
          emp.ID.toLowerCase().includes(term) ||
          emp.Puesto.toLowerCase().includes(term) ||
          emp.Manager.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
  }, [deptEmployeesByTipo, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(pendingEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pendingEmployees.slice(start, start + itemsPerPage);
  }, [pendingEmployees, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Gráfica de Donut del Modal: Completados vs Faltantes
  const chartData = [
    { name: 'Completados (Certificados)', value: certified, color: '#10b981' },
    { name: 'Faltantes (Pendientes)', value: faltantes, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const totalChartVal = certified + faltantes;

  // Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalChartVal > 0 ? Math.round((data.value / totalChartVal) * 100) : 0;
      return (
        <div className="bg-slate-900/95 dark:bg-[#273449] text-white border border-slate-700/50 dark:border-[#334155] p-2.5 rounded-lg shadow-xl text-[11px] font-bold backdrop-blur-md">
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </p>
          <p className="mt-1 text-slate-300 dark:text-[#cbd5e1]">
            Cantidad: <span className="text-white font-extrabold">{data.value}</span> ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const handleExportExcel = () => {
    exportToExcel(pendingEmployees, `${deptName}_${selectedTipoPersonal}`);
  };

  const handleExportCSV = () => {
    exportToCSV(pendingEmployees, `${deptName}_${selectedTipoPersonal}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      {/* Modal Container */}
      <div 
        className="glass-panel w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-[#334155] flex justify-between items-center bg-slate-50/50 dark:bg-[#273449]/40">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-[#f8fafc] flex flex-wrap items-center gap-2">
              Detalle: <span className="text-emerald-600 dark:text-emerald-400">{deptName}</span>
              <span className="text-xs px-2 py-0.5 font-bold rounded-lg bg-slate-200 dark:bg-[#273449] text-slate-600 dark:text-[#cbd5e1] border border-slate-300 dark:border-[#334155]">
                Filtro: {selectedTipoPersonal === 'Todos' ? 'Todos (IDL + DL)' : selectedTipoPersonal}
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-[#94a3b8] font-bold uppercase mt-0.5 tracking-wider">
              Análisis y Personal Pendiente
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-[#e2e8f0] dark:bg-[#273449] dark:hover:bg-[#2d3b52] text-slate-500 hover:text-slate-700 dark:text-[#cbd5e1] dark:hover:text-[#f8fafc] border border-slate-200/50 dark:border-[#334155] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Area */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Top Row: KPIs and Modal Donut Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPIs List */}
            <div className="md:col-span-2 flex flex-col justify-center gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* HC */}
                <div className="bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase">Headcount</div>
                    <div className="text-xl font-extrabold text-slate-750 dark:text-[#f8fafc]">{totalHC}</div>
                  </div>
                </div>

                {/* Certificados */}
                <div className="bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase">Certificados</div>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{certified}</div>
                  </div>
                </div>

                {/* Potencial */}
                <div className="bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase">Potencial</div>
                    <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{potential}</div>
                  </div>
                </div>

                {/* Por Certificar */}
                <div className="bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase">Por Certificar</div>
                    <div className="text-xl font-extrabold text-red-500">{pending}</div>
                  </div>
                </div>
              </div>

              {/* Progress summary bar */}
              <div className="bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] p-4 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-[#cbd5e1] mb-2">
                  <span>AVANCE DE CERTIFICACIÓN</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-[#0f172a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Modal Donut Chart */}
            <div className="bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] p-4 rounded-2xl flex flex-col items-center justify-center min-h-[220px]">
              <div className="text-xs font-bold text-slate-400 dark:text-[#94a3b8] uppercase mb-2">Estatus de Avance</div>
              <div className="relative w-full h-[140px] flex items-center justify-center">
                {totalChartVal > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={42}
                          outerRadius={58}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          verticalAlign="bottom"
                          iconType="circle"
                          iconSize={6}
                          formatter={(value) => <span className="text-[10px] font-bold text-slate-500 dark:text-[#cbd5e1]">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Percent overlay */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-slate-700 dark:text-[#f8fafc] leading-none">
                        {percentage}%
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-[#94a3b8]">Sin datos</span>
                )}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="relative w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#cbd5e1]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar en lista pendiente..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold"
                />
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportExcel}
                  disabled={pendingEmployees.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                  title="Exportar a archivo Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Excel</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={pendingEmployees.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-[#e2e8f0] dark:bg-[#273449] dark:hover:bg-[#2d3b52] text-slate-750 dark:text-[#cbd5e1] border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer disabled:opacity-50"
                  title="Exportar a CSV"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="border border-slate-200 dark:border-[#334155] rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-[#273449]/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#273449]/40 border-b border-slate-200 dark:border-[#334155] text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Nombre</th>
                      <th className="py-3 px-4">Departamento</th>
                      <th className="py-3 px-4">Puesto</th>
                      <th className="py-3 px-4">Manager N1</th>
                      <th className="py-3 px-4">Acción</th>
                      <th className="py-3 px-4">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#334155]/60 text-xs font-semibold text-slate-600 dark:text-[#cbd5e1]">
                    {paginatedEmployees.length > 0 ? (
                      paginatedEmployees.map((emp) => (
                        <tr key={emp.ID} className="hover:bg-slate-50/50 dark:hover:bg-[#273449]/20 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-[#f8fafc]">{emp.ID}</td>
                          <td className="py-3 px-4 truncate max-w-[180px] font-bold text-slate-805 dark:text-[#f8fafc]" title={emp.Nombre}>{emp.Nombre}</td>
                          <td className="py-3 px-4 truncate max-w-[120px]" title={emp.Departamento}>{emp.Departamento}</td>
                          <td className="py-3 px-4 truncate max-w-[150px]" title={emp.Puesto}>{emp.Puesto}</td>
                          <td className="py-3 px-4 truncate max-w-[150px]" title={emp.Manager}>{emp.Manager}</td>
                          <td className="py-3 px-4 text-slate-400 dark:text-[#94a3b8]">
                            {emp.Action || <span className="italic text-[10px] text-slate-400/70">N/A</span>}
                          </td>
                          <td className="py-3 px-4">
                            {emp.Estatus === 'Potencial' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                Potencial
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                Por Certificar
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-[#94a3b8] font-bold">
                          No se encontraron colaboradores pendientes en este departamento
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-[#334155] bg-slate-50/30 dark:bg-[#273449]/10 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#cbd5e1]">
                  <div>
                    Mostrando {Math.min(pendingEmployees.length, (currentPage - 1) * itemsPerPage + 1)}-
                    {Math.min(pendingEmployees.length, currentPage * itemsPerPage)} de {pendingEmployees.length} registros
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#2d3b52] transition-colors"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-3 py-1.5 rounded-lg transition-colors ${
                          currentPage === p
                            ? 'bg-slate-900 text-white dark:bg-[#f8fafc] dark:text-slate-900'
                            : 'border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#2d3b52]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#2d3b52] transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

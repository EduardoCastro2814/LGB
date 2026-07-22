'use client';

import React, { useState, useMemo } from 'react';
import { MergedEmployee } from '../types';
import { ArrowUpDown } from 'lucide-react';

interface EmployeeTableProps {
  employees: MergedEmployee[];
}

type SortField = 'ID' | 'Nombre' | 'Departamento' | 'Puesto' | 'Manager' | 'Estatus' | 'Action';
type SortOrder = 'asc' | 'desc';

export default function EmployeeTable({ employees }: EmployeeTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('Nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const itemsPerPage = 12;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const sortedEmployees = useMemo(() => {
    const data = [...employees];
    return data.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (sortField === 'ID') {
        const aNum = parseInt(a.ID, 10);
        const bNum = parseInt(b.ID, 10);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
        }
      }

      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedEmployees.slice(start, start + itemsPerPage);
  }, [sortedEmployees, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="glass-panel rounded-2xl p-6 mb-6 animate-fade-in bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]" style={{ animationDelay: '0.25s' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-[#f8fafc]">
            Listado Detallado de Colaboradores
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#cbd5e1] font-semibold mt-0.5">
            Vista filtrada y ordenada de headcount
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#273449] text-slate-650 dark:text-[#cbd5e1] border border-slate-200 dark:border-[#334155]">
          Total Filtrados: {employees.length.toLocaleString()}
        </span>
      </div>

      <div className="border border-slate-200 dark:border-[#334155] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-[#273449]/10">
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#273449]/40 border-b border-slate-200 dark:border-[#334155] text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider select-none">
                <th onClick={() => handleSort('ID')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-[#f8fafc] transition-colors">
                  <div className="flex items-center gap-1">
                    <span>ID</span> <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('Nombre')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-[#f8fafc] transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Nombre</span> <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('Puesto')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-[#f8fafc] transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Puesto</span> <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('Departamento')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-[#f8fafc] transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Departamento</span> <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('Manager')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-[#f8fafc] transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Manager N1</span> <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('Estatus')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-[#f8fafc] transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Estatus Certificación</span> <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('Action')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-[#f8fafc] transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Acción Reporte</span> <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-250 dark:divide-[#334155]/60 text-xs font-semibold text-slate-600 dark:text-[#cbd5e1]">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.ID} className="hover:bg-slate-50/50 dark:hover:bg-[#273449]/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-[#f8fafc]">{emp.ID}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-[#f8fafc] truncate max-w-[200px]" title={emp.Nombre}>{emp.Nombre}</td>
                    <td className="py-3 px-4 truncate max-w-[180px]" title={emp.Puesto}>{emp.Puesto}</td>
                    <td className="py-3 px-4 truncate max-w-[150px]" title={emp.Departamento}>{emp.Departamento}</td>
                    <td className="py-3 px-4 truncate max-w-[180px]" title={emp.Manager}>{emp.Manager}</td>
                    <td className="py-3 px-4">
                      {emp.Estatus === 'Certificado' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20">
                          Certificado
                        </span>
                      ) : emp.Estatus === 'Potencial' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Potencial
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                          Por Certificar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 dark:text-[#94a3b8]">
                      {emp.Action || <span className="italic text-[10px] text-slate-400/50">N/A</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-[#94a3b8] font-bold">
                    No se encontraron colaboradores que coincidan con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-[#334155] bg-slate-50/20 dark:bg-[#273449]/10 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#cbd5e1]">
            <div>
              Mostrando {Math.min(sortedEmployees.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(sortedEmployees.length, currentPage * itemsPerPage)} de {sortedEmployees.length} registros
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#2d3b52] transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (totalPages > 8 && Math.abs(currentPage - p) > 2 && p !== 1 && p !== totalPages) {
                  if (p === 2 || p === totalPages - 1) {
                    return <span key={p} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                }
                return (
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
                );
              })}
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
    </section>
  );
}

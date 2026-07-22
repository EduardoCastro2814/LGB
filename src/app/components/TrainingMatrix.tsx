'use client';

import React, { useState, useMemo } from 'react';
import { MergedEmployee, TrainingState, Course } from '../types';
import { Search, Filter, Check, ShieldAlert, Award, Grid, RefreshCw } from 'lucide-react';

interface TrainingMatrixProps {
  employees: MergedEmployee[];
  trainingState: TrainingState;
  courses: Course[];
}

export default function TrainingMatrix({
  employees,
  trainingState,
  courses,
}: TrainingMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Cursos requeridos estándar para la visualización de la matriz
  const requiredCourseIds = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];

  // Obtener departamentos únicos para el filtro
  const uniqueDepts = useMemo(() => {
    const depts = employees.map(emp => emp.Departamento);
    return Array.from(new Set(depts)).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // Filtrar los empleados según búsqueda y departamento
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = 
        emp.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.ID.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDept = selectedDept === 'Todos' || emp.Departamento === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDept]);

  // Paginación
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Función para obtener el estado y renderizar la celda para un empleado y curso
  const renderCellStatus = (empId: string, courseId: string) => {
    const empProg = trainingState[empId]?.[courseId];
    
    if (empProg) {
      if (empProg.status === 'completado') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20">
            <Check className="w-3 h-3" />
            <span>Completado</span>
          </span>
        );
      } else if (empProg.status === 'en-progreso') {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{empProg.progress}%</span>
          </span>
        );
      }
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
        <span>No iniciado</span>
      </span>
    );
  };

  // Función para verificar si ha completado la certificación Lean Green Belt completa
  const renderCertificationStatus = (empId: string, currentExcelStatus: string) => {
    // Si ha completado todos los cursos del trainingState
    const empProgMap = trainingState[empId] || {};
    const passedAll = requiredCourseIds.every(id => empProgMap[id]?.examPassed === true);

    if (passedAll || currentExcelStatus === 'Certificado') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/30 shadow-sm uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>LGB Certificado</span>
        </span>
      );
    }

    // Calcular cuántos lleva aprobados
    let approvedCount = 0;
    requiredCourseIds.forEach(id => {
      if (empProgMap[id]?.examPassed) approvedCount++;
    });

    if (approvedCount > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-550 border border-amber-500/30 uppercase">
          <span>En Progreso ({approvedCount}/5)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 uppercase border border-transparent">
        <span>Sin Iniciar</span>
      </span>
    );
  };

  // KPIs Rápidos para la Matriz
  const matrixStats = useMemo(() => {
    let totalCertified = 0;
    let totalInProgress = 0;
    let totalNotStarted = 0;

    employees.forEach(emp => {
      const empProgMap = trainingState[emp.ID] || {};
      const passedAll = requiredCourseIds.every(id => empProgMap[id]?.examPassed === true);
      
      if (passedAll || emp.Estatus === 'Certificado') {
        totalCertified++;
      } else {
        const started = requiredCourseIds.some(id => empProgMap[id] !== undefined);
        if (started) {
          totalInProgress++;
        } else {
          totalNotStarted++;
        }
      }
    });

    return {
      totalCertified,
      totalInProgress,
      totalNotStarted,
    };
  }, [employees, trainingState]);

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-[#f8fafc]">
      
      {/* Resumen de Estado de la Matriz */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Certificados Lean Green Belt', val: matrixStats.totalCertified, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Colaboradores En Progreso', val: matrixStats.totalInProgress, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Colaboradores Sin Iniciar', val: matrixStats.totalNotStarted, color: 'text-slate-400', bg: 'bg-slate-150 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50' },
        ].map((stat, idx) => (
          <div key={idx} className={`glass-panel rounded-2.5xl p-5 bg-white dark:bg-[#1e293b] border ${stat.bg} flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className={`text-xl font-black ${stat.color}`}>{stat.val.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/40 dark:bg-black/10">
              <Grid className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Caja de Tabla y Controles */}
      <section className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
        
        {/* Controles de Filtro */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Training Matrix (Matriz de Entrenamiento)</h3>
            <p className="text-xs text-slate-400 dark:text-[#cbd5e1] font-semibold mt-0.5">Control global de avance académico por colaborador</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Buscador de Empleado */}
            <div className="relative rounded-xl shadow-sm w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Buscar por ID o Nombre..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Selector de Departamento */}
            <div className="relative rounded-xl shadow-sm w-full sm:w-48 flex items-center bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] px-3">
              <Filter className="h-3.5 w-3.5 text-slate-400 mr-2 flex-shrink-0" />
              <select
                className="block w-full bg-transparent py-2 text-xs font-bold text-slate-705 dark:text-[#cbd5e1] border-none outline-none focus:ring-0 cursor-pointer"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="Todos">Todos los Deptos</option>
                {uniqueDepts.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grilla / Tabla Matriz */}
        <div className="border border-slate-200 dark:border-[#334155] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-[#273449]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#273449]/40 border-b border-slate-200 dark:border-[#334155] text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider select-none">
                  <th className="py-3.5 px-4">Empleado / Depto</th>
                  <th className="py-3.5 px-4 text-center">Lean Basics 1</th>
                  <th className="py-3.5 px-4 text-center">5S + 1</th>
                  <th className="py-3.5 px-4 text-center">5 Whys</th>
                  <th className="py-3.5 px-4 text-center">7 Ways</th>
                  <th className="py-3.5 px-4 text-center">SGA Guide</th>
                  <th className="py-3.5 px-4 text-center">Certificación LGB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-250 dark:divide-[#334155]/60 font-semibold text-slate-650 dark:text-[#cbd5e1]">
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp) => (
                    <tr key={emp.ID} className="hover:bg-slate-50/50 dark:hover:bg-[#273449]/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 dark:text-white truncate max-w-[190px]" title={emp.Nombre}>
                          {emp.Nombre}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">
                          ID: {emp.ID}  |  {emp.Departamento}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderCellStatus(emp.ID, 'lean-basics-1')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderCellStatus(emp.ID, '5s-1')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderCellStatus(emp.ID, '5-whys')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderCellStatus(emp.ID, '7-ways')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderCellStatus(emp.ID, 'sga-guide')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderCertificationStatus(emp.ID, emp.Estatus)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-[#94a3b8] font-bold">
                      No se encontraron colaboradores que coincidan con la búsqueda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-[#334155] bg-slate-50/20 dark:bg-[#273449]/10 flex items-center justify-between text-slate-500 dark:text-[#cbd5e1]">
              <div>
                Mostrando {Math.min(filteredEmployees.length, (currentPage - 1) * itemsPerPage + 1)}-
                {Math.min(filteredEmployees.length, currentPage * itemsPerPage)} de {filteredEmployees.length} registros
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#2d3b52] transition-colors cursor-pointer text-xs font-bold"
                >
                  Anterior
                </button>
                <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-lg">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#2d3b52] transition-colors cursor-pointer text-xs font-bold"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
        
      </section>

    </div>
  );
}

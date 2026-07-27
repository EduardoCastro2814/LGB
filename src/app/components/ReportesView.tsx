'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Check, 
  AlertTriangle, 
  Coffee,
  Database,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { LayoutPosition, Station, MergedEmployee, TrainingRecord } from '../types';

interface ReportesViewProps {
  positions: LayoutPosition[];
  stations: Station[];
  employees: MergedEmployee[];
  trainingRecords: TrainingRecord[];
  courseProgress: Record<string, any>;
  requirements: any[];
  supabaseStatus: 'online' | 'offline';
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function ReportesView({
  positions,
  stations,
  employees,
  trainingRecords,
  courseProgress,
  requirements,
  supabaseStatus,
  isLoading,
  onRefresh,
}: ReportesViewProps) {
  // Filtros del Reporte
  const [filterLine, setFilterLine] = useState('Todos');
  const [filterDept, setFilterDept] = useState('Todos');
  const [filterShift, setFilterShift] = useState('Todos');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mapear estaciones y empleados
  const stationMap = useMemo(() => {
    const map: Record<string, Station> = {};
    stations.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [stations]);

  const employeeMap = useMemo(() => {
    const map: Record<string, MergedEmployee> = {};
    employees.forEach(e => {
      map[e.ID] = e;
    });
    return map;
  }, [employees]);

  const reqsByStation = useMemo(() => {
    const map: Record<string, string[]> = {};
    requirements.forEach(r => {
      if (!map[r.station_id]) {
        map[r.station_id] = [];
      }
      map[r.station_id].push(r.training_name);
    });
    return map;
  }, [requirements]);

  const uniqueDepts = useMemo(() => {
    const depts = employees.map(e => e.Departamento);
    return Array.from(new Set(depts)).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // Obtener entrenamientos completados por operador
  const getOperatorCompletedTrainings = (empNo: string): Set<string> => {
    const completed = new Set<string>();

    const empRecords = trainingRecords.filter(r => r.employee_number === empNo);
    empRecords.forEach(r => {
      const status = r.status.toLowerCase().trim();
      if (status.includes('completado') || status.includes('aprobado') || status === 'ok' || status === 'complete') {
        completed.add(r.training_name.trim().toLowerCase());
      }
    });

    const userProgMap = courseProgress[empNo] || {};
    Object.keys(userProgMap).forEach(courseId => {
      const prog = userProgMap[courseId];
      if (prog.examPassed === true || prog.status === 'completado') {
        const courseNamesMap: Record<string, string> = {
          'lean-basics-1': 'lean basics 1',
          '5s-1': '5s + 1',
          '5-whys': '5 whys',
          '7-ways': '7 ways',
          'sga-guide': 'small group activities (sga) guide'
        };
        const mappedName = courseNamesMap[courseId];
        if (mappedName) completed.add(mappedName);
        completed.add(courseId.toLowerCase());
      }
    });

    return completed;
  };

  // Reconstruir lista de filas del reporte de acuerdo a las asignaciones en layout
  const reportRows = useMemo(() => {
    // Solo mostramos posiciones que tienen asignado a alguien
    const activePositions = positions.filter(p => p.employee_number !== null && p.employee_number !== '');
    
    return activePositions.map(pos => {
      const empNo = pos.employee_number!;
      const operator = employeeMap[empNo];
      const station = stationMap[pos.station_id];
      
      const line = pos.line || 'Línea 1';
      const shift = pos.shift || 'Turno 1';

      if (pos.coverage_type === 'Comedor') {
        return {
          employeeId: empNo,
          employeeName: operator?.Nombre || 'Operador Externo',
          department: operator?.Departamento || 'N/A',
          line,
          shift,
          position: pos.code,
          stationName: station?.name || pos.station_id,
          missingCourses: [],
          statusText: 'Comedor',
          statusColor: 'blue'
        };
      }

      // Validar requerimientos
      const reqCourses = reqsByStation[pos.station_id] || [];
      const completed = getOperatorCompletedTrainings(empNo);
      const missing: string[] = [];

      reqCourses.forEach(req => {
        const normReq = req.trim().toLowerCase();
        
        const getVariations = (n: string) => {
          const v = [n];
          const noAcs = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (noAcs !== n) v.push(noAcs);
          return v;
        };

        const variations = getVariations(normReq);
        const isCompleted = variations.some(variant => completed.has(variant));
        if (!isCompleted) {
          missing.push(req);
        }
      });

      return {
        employeeId: empNo,
        employeeName: operator?.Nombre || 'Operador Externo/Temporal',
        department: operator?.Departamento || 'N/A',
        line,
        shift,
        position: pos.code,
        stationName: station?.name || pos.station_id,
        missingCourses: missing,
        statusText: missing.length === 0 ? 'Certificado' : 'No Certificado',
        statusColor: missing.length === 0 ? 'green' : 'yellow'
      };
    });
  }, [positions, stationMap, employeeMap, reqsByStation, trainingRecords, courseProgress]);

  // Filtrado de las filas del reporte
  const filteredRows = useMemo(() => {
    return reportRows.filter(row => {
      // Filtro de línea
      if (filterLine !== 'Todos' && row.line !== filterLine) return false;
      // Filtro de departamento
      if (filterDept !== 'Todos' && row.department !== filterDept) return false;
      // Filtro de turno
      if (filterShift !== 'Todos' && row.shift !== filterShift) return false;
      
      // Búsqueda por texto
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        return (
          row.employeeId.toLowerCase().includes(q) ||
          row.employeeName.toLowerCase().includes(q) ||
          row.position.toLowerCase().includes(q) ||
          row.stationName.toLowerCase().includes(q) ||
          row.department.toLowerCase().includes(q) ||
          row.statusText.toLowerCase().includes(q)
        );
      }
      
      return true;
    });
  }, [reportRows, filterLine, filterDept, filterShift, searchQuery]);

  // Lógica de Exportación a Excel
  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const data = filteredRows.map(row => ({
      'Empleado ID': row.employeeId,
      'Nombre Empleado': row.employeeName,
      'Departamento': row.department,
      'Línea': row.line,
      'Posición': row.position,
      'Estación': row.stationName,
      'Cursos Faltantes': row.missingCourses.length > 0 ? row.missingCourses.join(', ') : 'Ninguno',
      'Estado': row.statusText,
      'Fecha Reporte': filterDate
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Competencias');
    XLSX.writeFile(wb, `Reporte_Competencias_${filterDate}.xlsx`);
  };

  // Lógica de Exportación a CSV
  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = ['Empleado ID', 'Nombre Empleado', 'Departamento', 'Línea', 'Posición', 'Estación', 'Cursos Faltantes', 'Estado', 'Fecha'];
    const csvRows = [headers.join(',')];

    filteredRows.forEach(row => {
      const missingStr = row.missingCourses.length > 0 ? `"${row.missingCourses.join(', ')}"` : 'Ninguno';
      const nameEscaped = `"${row.employeeName.replace(/"/g, '""')}"`;
      const deptEscaped = `"${row.department.replace(/"/g, '""')}"`;
      const values = [
        row.employeeId,
        nameEscaped,
        deptEscaped,
        row.line,
        row.position,
        row.stationName,
        missingStr,
        row.statusText,
        filterDate
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Competencias_${filterDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-[#f8fafc]">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Reporte de Cumplimiento de Competencias</h2>
          <p className="text-xs text-slate-400 dark:text-[#cbd5e1] font-semibold uppercase mt-0.5 tracking-wider">
            Auditoría de Certificación en Estaciones Operativas
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sincronización */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-[#1a283d] transition-colors cursor-pointer text-slate-650 dark:text-slate-300 disabled:opacity-50"
            title="Refrescar Datos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Estado de Supabase */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
            supabaseStatus === 'online'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/20'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>{supabaseStatus === 'online' ? 'SUPABASE ONLINE' : 'MODO LOCAL (OFFLINE)'}</span>
          </span>
        </div>
      </div>

      {/* Contenedor de Filtros */}
      <section className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border border-slate-200/60 dark:border-[#334155] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          
          {/* Filtro Línea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Línea</label>
            <div className="relative rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#273449] px-3 flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
              <select
                value={filterLine}
                onChange={(e) => setFilterLine(e.target.value)}
                className="w-full bg-transparent py-2 text-xs font-bold text-slate-705 dark:text-[#cbd5e1] border-none outline-none focus:ring-0 cursor-pointer"
              >
                <option value="Todos">Todas las Líneas</option>
                <option value="Línea 1">Línea 1</option>
                <option value="Línea 2">Línea 2</option>
              </select>
            </div>
          </div>

          {/* Filtro Departamento (Área) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Área / Depto</label>
            <div className="relative rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#273449] px-3 flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full bg-transparent py-2 text-xs font-bold text-slate-705 dark:text-[#cbd5e1] border-none outline-none focus:ring-0 cursor-pointer"
              >
                <option value="Todos">Todos los Deptos</option>
                {uniqueDepts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro Turno */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turno</label>
            <div className="relative rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#273449] px-3 flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="w-full bg-transparent py-2 text-xs font-bold text-slate-705 dark:text-[#cbd5e1] border-none outline-none focus:ring-0 cursor-pointer"
              >
                <option value="Todos">Todos los Turnos</option>
                <option value="Turno 1">Turno 1</option>
                <option value="Turno 2">Turno 2</option>
                <option value="Turno 3">Turno 3</option>
              </select>
            </div>
          </div>

          {/* Filtro Fecha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</label>
            <div className="relative rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#273449] px-3 flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-transparent py-2 text-xs font-bold text-slate-705 dark:text-[#cbd5e1] border-none outline-none focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Buscador de Empleado */}
          <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buscar por Texto</label>
            <div className="relative rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#273449] px-3 flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Nombre, ID, Estación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-2 text-xs font-bold text-slate-705 dark:text-[#cbd5e1] border-none outline-none focus:ring-0 placeholder-slate-450"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Tabla del Reporte */}
      <section className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border border-slate-200/60 dark:border-[#334155] shadow-sm flex flex-col gap-6">
        
        {/* Cabecera Tabla */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Cumplimiento Actual del Layout</h3>
            <p className="text-xs text-slate-400 mt-0.5">Mostrando {filteredRows.length} asignaciones activas filtradas</p>
          </div>

          {/* Botones de Exportar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Tabla física */}
        <div className="border border-slate-200 dark:border-[#334155] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#273449]/40 border-b border-slate-200 dark:border-[#334155] text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider select-none">
                  <th className="py-3.5 px-4">Empleado</th>
                  <th className="py-3.5 px-4">Línea</th>
                  <th className="py-3.5 px-4 text-center">Posición</th>
                  <th className="py-3.5 px-4">Estación</th>
                  <th className="py-3.5 px-4">Cursos Faltantes</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#334155]/60 font-semibold text-slate-650 dark:text-[#cbd5e1]">
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, idx) => {
                    const badgeStyles = {
                      green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20',
                      yellow: 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20',
                      blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-450 border border-blue-500/20'
                    }[row.statusColor];

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#273449]/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800 dark:text-white truncate max-w-[170px]">{row.employeeName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {row.employeeId} | Depto: {row.department}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          {row.line}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          {row.position}
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          {row.stationName}
                        </td>
                        <td className="py-3.5 px-4">
                          {row.statusColor === 'blue' ? (
                            <span className="text-[10px] text-blue-500 font-bold italic">N/A - Cafetería</span>
                          ) : row.missingCourses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {row.missingCourses.map(c => (
                                <span 
                                  key={c}
                                  className="inline-block px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-bold border border-red-500/10"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completo</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${badgeStyles}`}>
                            {row.statusColor === 'blue' && <Coffee className="w-3 h-3" />}
                            {row.statusColor === 'green' && <Check className="w-3 h-3" />}
                            {row.statusColor === 'yellow' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                            <span>{row.statusText}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold italic">
                      No se encontraron asignaciones activas que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </section>

    </div>
  );
}

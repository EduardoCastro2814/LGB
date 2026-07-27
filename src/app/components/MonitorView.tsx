'use client';

import React, { useState, useMemo } from 'react';
import { 
  Scan, 
  UserCheck, 
  Coffee, 
  UserMinus, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw,
  Search,
  Database,
  ArrowRight,
  ShieldCheck,
  UserX
} from 'lucide-react';
import { LayoutPosition, Station, MergedEmployee, TrainingRecord } from '../types';

interface MonitorViewProps {
  positions: LayoutPosition[];
  stations: Station[];
  employees: MergedEmployee[];
  trainingRecords: TrainingRecord[];
  courseProgress: Record<string, any>; // de Academia Lean (trainingState)
  requirements: any[];
  onAssignOperator: (code: string, employeeNumber: string | null, coverageType: 'Normal' | 'Comedor') => Promise<void>;
  supabaseStatus: 'online' | 'offline';
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function MonitorView({
  positions,
  stations,
  employees,
  trainingRecords,
  courseProgress,
  requirements,
  onAssignOperator,
  supabaseStatus,
  isLoading,
  onRefresh,
}: MonitorViewProps) {
  // Estado para simulación de escaneo
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [scanEmpNumber, setScanEmpNumber] = useState<string>('');
  const [scanCoverageType, setScanCoverageType] = useState<'Normal' | 'Comedor'>('Normal');
  const [scanMessage, setScanMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
    details?: string;
  } | null>(null);

  // Mapear estaciones para búsqueda rápida
  const stationMap = useMemo(() => {
    const map: Record<string, Station> = {};
    stations.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [stations]);

  // Mapear empleados por ID
  const employeeMap = useMemo(() => {
    const map: Record<string, MergedEmployee> = {};
    employees.forEach(e => {
      map[e.ID] = e;
    });
    return map;
  }, [employees]);

  // Mapear cursos requeridos por estación
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

  // Obtener entrenamientos completados por operador (unificando registros importados y progreso de academia)
  const getOperatorCompletedTrainings = (empNo: string): Set<string> => {
    const completed = new Set<string>();

    // 1. De los registros de entrenamiento importados (training_records)
    const empRecords = trainingRecords.filter(r => r.employee_number === empNo);
    empRecords.forEach(r => {
      const status = r.status.toLowerCase().trim();
      if (status.includes('completado') || status.includes('aprobado') || status === 'ok' || status === 'complete') {
        completed.add(r.training_name.trim().toLowerCase());
      }
    });

    // 2. De los progresos de curso aprobados en la Academia Lean (course_progress)
    const userProgMap = courseProgress[empNo] || {};
    Object.keys(userProgMap).forEach(courseId => {
      const prog = userProgMap[courseId];
      if (prog.examPassed === true || prog.status === 'completado') {
        // Mapear IDs de cursos predeterminados a sus nombres
        const courseNamesMap: Record<string, string> = {
          'lean-basics-1': 'lean basics 1',
          '5s-1': '5s + 1',
          '5-whys': '5 whys',
          '7-ways': '7 ways',
          'sga-guide': 'small group activities (sga) guide'
        };
        const mappedName = courseNamesMap[courseId];
        if (mappedName) {
          completed.add(mappedName);
        }
        // También por si se cargaron cursos personalizados con su id/nombre
        completed.add(courseId.toLowerCase());
      }
    });

    return completed;
  };

  // Determinar estado de una posición específica
  // Retorna: color ('green', 'yellow', 'red', 'blue'), operador (objeto), cursos faltantes (string[])
  const getPositionStatus = (pos: LayoutPosition) => {
    if (!pos.employee_number) {
      return { color: 'red', operator: null, missingCourses: [] };
    }

    if (pos.coverage_type === 'Comedor') {
      return { color: 'blue', operator: employeeMap[pos.employee_number] || null, missingCourses: [] };
    }

    const operator = employeeMap[pos.employee_number];
    if (!operator) {
      // Operador no encontrado en headcount base pero tiene ID asignado
      return { 
        color: 'yellow', 
        operator: { ID: pos.employee_number, Nombre: 'Operador Externo/Temporal', Departamento: 'N/A' }, 
        missingCourses: [] 
      };
    }

    // Validar entrenamientos requeridos
    const reqCourses = reqsByStation[pos.station_id] || [];
    const completedCourses = getOperatorCompletedTrainings(pos.employee_number);
    const missing: string[] = [];

    reqCourses.forEach(req => {
      // Búsqueda insensible a mayúsculas/minúsculas y espacios
      const normReq = req.trim().toLowerCase();
      
      // Mapear nombres a variaciones comunes para evitar rechazos erróneos
      // Ej: "SMT Básico" -> "smt básico" o "smt basico"
      const getVariations = (n: string) => {
        const v = [n];
        // Remover acentos
        const noAcs = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (noAcs !== n) v.push(noAcs);
        return v;
      };

      const variations = getVariations(normReq);
      const isCompleted = variations.some(variant => completedCourses.has(variant));

      if (!isCompleted) {
        missing.push(req);
      }
    });

    const color = missing.length === 0 ? 'green' : 'yellow';

    return { color, operator, missingCourses: missing };
  };

  // Procesar estado de todas las posiciones para contadores y KPIs
  const positionsStatusInfo = useMemo(() => {
    return positions.map(pos => {
      const status = getPositionStatus(pos);
      return {
        position: pos,
        ...status
      };
    });
  }, [positions, stationMap, employeeMap, reqsByStation, trainingRecords, courseProgress]);

  // Contador de alertas superiores: "⚠ X Operador sin certificación"
  const yellowCount = useMemo(() => {
    return positionsStatusInfo.filter(info => info.color === 'yellow').length;
  }, [positionsStatusInfo]);

  // Manejar click directo en tarjeta para auto-seleccionar posición a escanear
  const handleCardClick = (code: string) => {
    setSelectedCode(code);
    setScanMessage(null);
    const pos = positions.find(p => p.code === code);
    if (pos && pos.employee_number) {
      setScanEmpNumber(pos.employee_number);
      setScanCoverageType(pos.coverage_type as 'Normal' | 'Comedor');
    } else {
      setScanEmpNumber('');
      setScanCoverageType('Normal');
    }
  };

  // Simular escaneo/registro
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanMessage(null);

    if (!selectedCode) {
      setScanMessage({ type: 'error', text: 'Seleccione una posición física para registrar.' });
      return;
    }

    const pos = positions.find(p => p.code === selectedCode);
    if (!pos) return;

    const empId = scanEmpNumber.trim();

    // ESCENARIO: Liberar cobertura
    if (!empId) {
      try {
        await onAssignOperator(selectedCode, null, 'Normal');
        setScanMessage({ type: 'success', text: `Posición ${selectedCode} liberada exitosamente.` });
        setScanEmpNumber('');
      } catch (err: any) {
        setScanMessage({ type: 'error', text: `Error al liberar posición: ${err.message}` });
      }
      return;
    }

    // Validar existencia en el headcount
    const operator = employeeMap[empId];
    if (!operator) {
      setScanMessage({ 
        type: 'error', 
        text: 'Nro Empleado inválido.', 
        details: 'El colaborador no existe en el Headcount actual del Site.' 
      });
      return;
    }

    try {
      // Registrar asignación
      await onAssignOperator(selectedCode, empId, scanCoverageType);

      // Evaluar la competencia en caliente para el mensaje de respuesta
      const mockPos = { ...pos, employee_number: empId, coverage_type: scanCoverageType };
      const res = getPositionStatus(mockPos);

      if (scanCoverageType === 'Comedor') {
        setScanMessage({
          type: 'success',
          text: `Cobertura de comedor registrada en ${selectedCode}.`,
          details: `Operador asignado: ${operator.Nombre} (ID: ${empId})`
        });
      } else if (res.color === 'green') {
        setScanMessage({
          type: 'success',
          text: '✔ Registro válido. Operador certificado.',
          details: `Operador: ${operator.Nombre} cuenta con los requerimientos necesarios para operar la estación ${stationMap[pos.station_id]?.name || pos.station_id}.`
        });
      } else {
        setScanMessage({
          type: 'warning',
          text: '⚠ Operador registrado sin entrenamiento requerido.',
          details: `Curso faltante: ${res.missingCourses.join(', ')}`
        });
      }
    } catch (err: any) {
      setScanMessage({ type: 'error', text: `Error al registrar asignación: ${err.message}` });
    }
  };

  // Liberar todas las posiciones para reiniciar el monitor
  const handleClearAllPositions = async () => {
    if (confirm('¿Desea vaciar la asignación de todo el personal en el layout actual?')) {
      try {
        for (const pos of positions) {
          if (pos.employee_number) {
            await onAssignOperator(pos.code, null, 'Normal');
          }
        }
        setScanMessage({ type: 'success', text: 'Se ha liberado la cobertura de todo el layout.' });
        setSelectedCode('');
        setScanEmpNumber('');
      } catch (err: any) {
        alert(`Error al limpiar layout: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-[#f8fafc]">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Monitor de Cobertura y Operatividad</h2>
          <p className="text-xs text-slate-400 dark:text-[#cbd5e1] font-semibold uppercase mt-0.5 tracking-wider">
            Layout en Vivo y Registro de Asignaciones (LinePulse)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Vaciar */}
          <button
            onClick={handleClearAllPositions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors text-xs font-bold cursor-pointer"
            title="Reiniciar Layout"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Liberar Todo</span>
          </button>

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

      {/* Alerta Superior de Certificación */}
      {yellowCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-450 p-4 rounded-2xl flex items-center gap-3 text-xs font-extrabold animate-bounce-subtle">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>⚠ {yellowCount} Operador(es) presente(s) trabajando sin certificación de entrenamiento requerida.</span>
        </div>
      )}

      {/* Grid General del Layout y el Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Lado Izquierdo: Layout en vivo */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Layout de Línea 1</h3>
                <p className="text-xs text-slate-400 mt-0.5">Haga click en una tarjeta para registrar o remover un operador</p>
              </div>

              {/* Nomenclatura */}
              <div className="flex items-center gap-3 text-[9px] font-extrabold uppercase text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Certificado</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Falta Certificar</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Comedor</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Vacío</span>
                </div>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {positionsStatusInfo.map(info => {
                const { position: pos, color, operator, missingCourses } = info;
                const station = stationMap[pos.station_id];
                const isSelected = selectedCode === pos.code;

                // Definir colores específicos
                const colorClasses = {
                  green: 'border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] text-slate-800 dark:text-[#f8fafc]',
                  yellow: 'border-amber-500/30 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] text-slate-800 dark:text-[#f8fafc]',
                  blue: 'border-blue-500/30 bg-blue-500/[0.03] dark:bg-blue-500/[0.05] text-slate-800 dark:text-[#f8fafc]',
                  red: 'border-red-500/15 bg-red-500/[0.01] dark:bg-red-500/[0.02] text-slate-400 dark:text-slate-500 border-dashed'
                }[color];

                const badgeColor = {
                  green: 'bg-emerald-500 text-white shadow-emerald-500/25',
                  yellow: 'bg-amber-500 text-white shadow-amber-500/25',
                  blue: 'bg-blue-500 text-white shadow-blue-500/25',
                  red: 'bg-red-500/20 text-red-500'
                }[color];

                return (
                  <div
                    key={pos.code}
                    onClick={() => handleCardClick(pos.code)}
                    className={`border rounded-2.5xl p-4.5 flex flex-col justify-between min-h-[160px] cursor-pointer hover:shadow-md transition-all ${colorClasses} ${
                      isSelected ? 'ring-2 ring-emerald-500 scale-[1.02] shadow-md' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div>
                      {/* Cabecera Tarjeta */}
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{pos.code}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${badgeColor}`}>
                          {color === 'green' && 'Certified'}
                          {color === 'yellow' && 'Incomplete'}
                          {color === 'blue' && 'Cafeteria'}
                          {color === 'red' && 'Empty'}
                        </span>
                      </div>

                      {/* Estación */}
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-white truncate" title={station?.name || pos.station_id}>
                        {station?.name || pos.station_id}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Estación</p>
                    </div>

                    {/* Asignación */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                      {operator ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            {color === 'blue' ? (
                              <Coffee className="w-3.5 h-3.5 text-blue-500" />
                            ) : color === 'green' ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            )}
                            <p className="font-bold text-xs truncate max-w-[130px] dark:text-[#f8fafc]">{operator.Nombre}</p>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-mono">ID: {pos.employee_number}</p>
                          
                          {/* Advertencias */}
                          {color === 'yellow' && missingCourses.length > 0 && (
                            <p className="text-[8px] text-amber-500 font-extrabold uppercase mt-1 leading-snug truncate" title={`Falta: ${missingCourses.join(', ')}`}>
                              Falta: {missingCourses.join(', ')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600">
                          <UserMinus className="w-3.5 h-3.5" />
                          <p className="text-xs italic font-semibold">Sin personal asignado</p>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Lado Derecho: Simular Escaneo (Scanner) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155]">
            <div className="flex items-center gap-2 mb-4">
              <Scan className="w-5 h-5 text-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Simulador de Escaneo (Scanner)</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Simule el registro físico de un colaborador escaneando su gafete en una posición del layout.
            </p>

            <form onSubmit={handleScanSubmit} className="space-y-4">
              {/* Posición */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Posición del Layout</label>
                <select
                  value={selectedCode}
                  onChange={(e) => handleCardClick(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-bold text-slate-705 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Seleccione posición...</option>
                  {positions.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.code} ({stationMap[p.station_id]?.name || p.station_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nro Empleado */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Número de Empleado (Scan ID)</label>
                <div className="relative rounded-xl shadow-sm">
                  <input
                    type="text"
                    placeholder="Ej: 1163146 (Vacío para liberar)"
                    value={scanEmpNumber}
                    onChange={(e) => setScanEmpNumber(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Tipo de Cobertura */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Cobertura</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScanCoverageType('Normal')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      scanCoverageType === 'Normal'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-[#273449] text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Normal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanCoverageType('Comedor')}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      scanCoverageType === 'Comedor'
                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/25 dark:text-blue-450'
                        : 'bg-slate-50 dark:bg-[#273449] text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Coffee className="w-4 h-4" />
                    <span>Comedor</span>
                  </button>
                </div>
              </div>

              {/* Botón Enviar */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Registrar Escaneo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Resultados del Escaneo */}
            {scanMessage && (
              <div className={`mt-5 p-4 rounded-2xl border text-xs font-semibold leading-relaxed animate-fade-in ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-450'
                  : scanMessage.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-450'
                    : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
              }`}>
                <div className="flex items-start gap-2.5">
                  {scanMessage.type === 'success' && <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-emerald-500" />}
                  {scanMessage.type === 'warning' && <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-amber-500 animate-pulse" />}
                  {scanMessage.type === 'error' && <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-red-500" />}
                  <div>
                    <h5 className="font-extrabold uppercase tracking-wider">{scanMessage.text}</h5>
                    {scanMessage.details && <p className="mt-1 font-semibold text-slate-500 dark:text-[#cbd5e1]">{scanMessage.details}</p>}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

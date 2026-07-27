'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  UploadCloud, 
  Search, 
  Check, 
  AlertTriangle, 
  BookOpen, 
  Database, 
  FileSpreadsheet, 
  RefreshCw,
  Award,
  Settings,
  GraduationCap
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Station, StationRequirement, TrainingRecord } from '../types';

interface CompetenciasViewProps {
  stations: Station[];
  requirements: StationRequirement[];
  trainingRecords: TrainingRecord[];
  onAddStation: (station: Station) => Promise<void>;
  onDeleteStation: (id: string) => Promise<void>;
  onAddRequirement: (req: StationRequirement) => Promise<void>;
  onDeleteRequirement: (stationId: string, trainingName: string) => Promise<void>;
  onImportTrainingRecords: (records: TrainingRecord[]) => Promise<void>;
  supabaseStatus: 'online' | 'offline';
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export default function CompetenciasView({
  stations,
  requirements,
  trainingRecords,
  onAddStation,
  onDeleteStation,
  onAddRequirement,
  onDeleteRequirement,
  onImportTrainingRecords,
  supabaseStatus,
  isLoading,
  onRefresh,
}: CompetenciasViewProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'import'>('matrix');
  
  // Estados para agregar estación
  const [showAddStation, setShowAddStation] = useState(false);
  const [newStationId, setNewStationId] = useState('');
  const [newStationName, setNewStationName] = useState('');

  // Estados para agregar requerimiento
  const [selectedStationReq, setSelectedStationReq] = useState<string | null>(null);
  const [newReqName, setNewReqName] = useState('');

  // Estados para el historial de entrenamientos
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  // Estados de importación
  const [dragActive, setDragActive] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    success: boolean;
    message: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapear requerimientos por estación
  const reqsByStation = useMemo(() => {
    const map: Record<string, string[]> = {};
    stations.forEach(s => {
      map[s.id] = [];
    });
    requirements.forEach(r => {
      if (map[r.station_id]) {
        map[r.station_id].push(r.training_name);
      } else {
        map[r.station_id] = [r.training_name];
      }
    });
    return map;
  }, [stations, requirements]);

  // Lista de cursos/entrenamientos únicos conocidos
  const knownCourses = useMemo(() => {
    const courses = new Set<string>();
    // Agregar cursos por defecto de Lean B29
    courses.add('SMT Básico');
    courses.add('SPI');
    courses.add('Siplace');
    courses.add('Certificación Rayos X');
    courses.add('Lean Basics 1');
    courses.add('5S + 1');
    courses.add('5 Whys');
    courses.add('7 Ways');
    courses.add('Small Group Activities (SGA) Guide');

    // Agregar cursos de los registros importados
    trainingRecords.forEach(r => {
      if (r.training_name) courses.add(r.training_name);
    });
    // Agregar de los requerimientos
    requirements.forEach(r => {
      if (r.training_name) courses.add(r.training_name);
    });

    return Array.from(courses).sort((a, b) => a.localeCompare(b));
  }, [trainingRecords, requirements]);

  // Filtrado de registros de entrenamiento
  const filteredRecords = useMemo(() => {
    return trainingRecords.filter(rec => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        rec.employee_number.toLowerCase().includes(q) ||
        rec.employee_name.toLowerCase().includes(q) ||
        rec.training_name.toLowerCase().includes(q) ||
        rec.status.toLowerCase().includes(q) ||
        (rec.completion_date && rec.completion_date.toLowerCase().includes(q))
      );
    });
  }, [trainingRecords, searchQuery]);

  // Paginación de registros
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * recordsPerPage;
    return filteredRecords.slice(start, start + recordsPerPage);
  }, [filteredRecords, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Crear nueva estación
  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationId.trim() || !newStationName.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    const id = newStationId.trim().toLowerCase().replace(/\s+/g, '-');
    if (stations.some(s => s.id === id)) {
      alert('Ya existe una estación con este ID');
      return;
    }

    try {
      await onAddStation({ id, name: newStationName.trim() });
      setNewStationId('');
      setNewStationName('');
      setShowAddStation(false);
    } catch (err: any) {
      alert(`Error al guardar la estación: ${err.message}`);
    }
  };

  // Eliminar estación
  const handleDeleteStationClick = async (id: string, name: string) => {
    if (confirm(`¿Está seguro de que desea eliminar la estación "${name}"? Se perderán todas las configuraciones de requerimientos asociadas.`)) {
      try {
        await onDeleteStation(id);
      } catch (err: any) {
        alert(`Error al eliminar la estación: ${err.message}`);
      }
    }
  };

  // Agregar requerimiento de entrenamiento
  const handleAddRequirementSubmit = async (stationId: string) => {
    const courseName = newReqName.trim();
    if (!courseName) {
      alert('Por favor ingrese o seleccione un nombre de curso');
      return;
    }

    // Validar duplicado
    if (reqsByStation[stationId]?.includes(courseName)) {
      alert('Este curso ya está configurado como requerido para esta estación');
      return;
    }

    try {
      await onAddRequirement({ station_id: stationId, training_name: courseName });
      setNewReqName('');
      setSelectedStationReq(null);
    } catch (err: any) {
      alert(`Error al agregar requerimiento: ${err.message}`);
    }
  };

  // Eliminar requerimiento
  const handleDeleteReqClick = async (stationId: string, reqName: string) => {
    if (confirm(`¿Desea quitar "${reqName}" como entrenamiento requerido para esta estación?`)) {
      try {
        await onDeleteRequirement(stationId, reqName);
      } catch (err: any) {
        alert(`Error al eliminar requerimiento: ${err.message}`);
      }
    }
  };

  // Procesar archivo Excel/CSV de entrenamientos
  const handleFile = async (file: File) => {
    setIsUploading(true);
    setImportSummary(null);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rawRows.length === 0) {
          throw new Error('El archivo está vacío o no tiene el formato correcto');
        }

        // Mapeo robusto de columnas
        const colMap = {
          empNo: ['número empleado', 'numero empleado', 'empleado', 'employee_number', 'employee#', 'id', 'numemp', 'numero'],
          name: ['nombre', 'employee_name', 'name', 'nombre empleado', 'nombre completo'],
          course: ['curso', 'training_name', 'course', 'entrenamiento', 'nombre curso'],
          date: ['fecha', 'completion_date', 'date', 'fecha completado', 'fecha_completado'],
          status: ['estado', 'status', 'completado', 'completion_status']
        };

        const findColumn = (keys: string[], row: any) => {
          const rowKeys = Object.keys(row);
          for (const k of rowKeys) {
            const normalizedK = k.toLowerCase().trim();
            if (keys.includes(normalizedK)) {
              return k;
            }
          }
          return null;
        };

        const firstRow = rawRows[0];
        const empNoCol = findColumn(colMap.empNo, firstRow);
        const nameCol = findColumn(colMap.name, firstRow);
        const courseCol = findColumn(colMap.course, firstRow);
        const dateCol = findColumn(colMap.date, firstRow);
        const statusCol = findColumn(colMap.status, firstRow);

        if (!empNoCol || !nameCol || !courseCol) {
          throw new Error('No se encontraron las columnas requeridas: Número Empleado, Nombre y Curso.');
        }

        const parsedRecords: TrainingRecord[] = rawRows.map(row => {
          // Convertir fecha de Excel a string si es número
          let dateStr = '';
          const rawDate = row[dateCol || ''];
          if (rawDate) {
            if (typeof rawDate === 'number') {
              // Convertir número de serie de fecha de Excel
              const jsDate = new Date((rawDate - 25569) * 86400 * 1000);
              dateStr = jsDate.toISOString().split('T')[0];
            } else {
              dateStr = String(rawDate).trim();
            }
          } else {
            dateStr = new Date().toISOString().split('T')[0];
          }

          return {
            employee_number: String(row[empNoCol]).trim(),
            employee_name: String(row[nameCol]).trim(),
            training_name: String(row[courseCol]).trim(),
            status: statusCol ? String(row[statusCol]).trim() : 'Completado',
            completion_date: dateStr
          };
        });

        await onImportTrainingRecords(parsedRecords);

        setImportSummary({
          total: parsedRecords.length,
          success: true,
          message: `Se procesaron exitosamente ${parsedRecords.length} registros de entrenamiento.`
        });
      } catch (err: any) {
        setImportSummary({
          total: 0,
          success: false,
          message: `Error al importar archivo: ${err.message}`
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setImportSummary({
        total: 0,
        success: false,
        message: 'Error al leer el archivo físico.'
      });
      setIsUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-[#f8fafc]">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Módulo de Competencias Operativas</h2>
          <p className="text-xs text-slate-400 dark:text-[#cbd5e1] font-semibold uppercase mt-0.5 tracking-wider">
            Matriz de Requerimientos e Importación de Entrenamientos
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1e2d42] gap-1 select-none">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'matrix'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
          }`}
        >
          Matriz de Estaciones
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'import'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
          }`}
        >
          Importación y Registros ({trainingRecords.length})
        </button>
      </div>

      {/* RENDER DE TABS */}
      {activeTab === 'matrix' && (
        <div className="flex flex-col gap-6">
          {/* Botón de Agregar Estación */}
          <div className="flex justify-between items-center bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-200/60 dark:border-[#334155] shadow-sm">
            <div>
              <h3 className="text-sm font-bold">Catálogo de Estaciones</h3>
              <p className="text-xs text-slate-400 mt-0.5">Defina las estaciones de trabajo y configure sus entrenamientos obligatorios</p>
            </div>
            
            {!showAddStation && (
              <button
                onClick={() => setShowAddStation(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-xs shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Estación</span>
              </button>
            )}
          </div>

          {/* Formulario Agregar Estación */}
          {showAddStation && (
            <form onSubmit={handleCreateStation} className="glass-panel p-5 bg-slate-50/50 dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row items-end gap-4 animate-slide-in">
              <div className="flex-1 flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código de la Estación (ID único)</label>
                <input
                  type="text"
                  placeholder="Ej: stencil, spi, aoi"
                  value={newStationId}
                  onChange={(e) => setNewStationId(e.target.value)}
                  className="block w-full px-3 py-2 bg-white dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5 w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Estación (Display)</label>
                <input
                  type="text"
                  placeholder="Ej: Stencil, SPI, AOI"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="block w-full px-3 py-2 bg-white dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStation(false)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-650 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Grilla de Estaciones y Requerimientos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map(station => {
              const reqList = reqsByStation[station.id] || [];
              const isAddingReq = selectedStationReq === station.id;

              return (
                <div 
                  key={station.id}
                  className="glass-panel rounded-2.5xl p-5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Cabecera Estación */}
                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-[#2d3b52] pb-3 mb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{station.name}</h4>
                        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">ID: {station.id}</span>
                      </div>
                      
                      {/* Evitar borrar las estaciones críticas por error */}
                      <button
                        onClick={() => handleDeleteStationClick(station.id, station.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Eliminar Estación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Requerimientos */}
                    <div className="space-y-2 mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entrenamientos Requeridos:</p>
                      
                      {reqList.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {reqList.map(req => (
                            <span 
                              key={req} 
                              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-slate-350"
                            >
                              <span>{req}</span>
                              <button
                                onClick={() => handleDeleteReqClick(station.id, req)}
                                className="p-0.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Quitar Requerimiento"
                              >
                                <span className="text-[11px] font-black leading-none">×</span>
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No requiere entrenamientos aún</p>
                      )}
                    </div>
                  </div>

                  {/* Agregar Requerimiento */}
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-[#2d3b52]">
                    {isAddingReq ? (
                      <div className="flex flex-col gap-2 animate-fade-in">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Nombre del curso..."
                            value={newReqName}
                            onChange={(e) => setNewReqName(e.target.value)}
                            list={`known-courses-${station.id}`}
                            className="block w-full px-2.5 py-1.5 bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            autoFocus
                          />
                          <datalist id={`known-courses-${station.id}`}>
                            {knownCourses.map(c => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAddRequirementSubmit(station.id)}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            Agregar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStationReq(null);
                              setNewReqName('');
                            }}
                            className="flex-1 py-1.5 bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-650 dark:text-slate-350 font-bold text-[10px] rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedStationReq(station.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-slate-300 hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:hover:border-emerald-450 dark:hover:text-emerald-450 rounded-xl transition-colors font-bold text-xs text-slate-500 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Entrenamiento</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="flex flex-col gap-6">
          {/* Sección de Importación */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Box de Carga */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155]">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Importar Archivo de Entrenamientos</h3>
                <p className="text-xs text-slate-400 mb-4">Cargue un archivo CSV o Excel conteniendo las competencias del personal.</p>

                {/* Zona de Drop */}
                <div
                  onDragEnter={handleDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-3 transition-colors ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-slate-300 hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-400 bg-slate-50/50 dark:bg-[#111c2e]/40'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept=".csv,.xlsx"
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 text-slate-400" />
                  <div>
                    <p className="text-xs font-bold">Arrastre aquí su archivo</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Formatos soportados: CSV, XLSX</p>
                  </div>
                </div>

                {/* Formato Esperado */}
                <div className="mt-4 bg-slate-50 dark:bg-[#25334a]/30 p-3.5 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Columnas requeridas:</span>
                  <ul className="text-[10px] font-bold text-slate-500 dark:text-[#cbd5e1] space-y-1">
                    <li className="flex justify-between">
                      <span>• Número Empleado:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-350">ID / Número</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• Nombre:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-350">Juan Pérez</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• Curso:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-350">SMT Básico / SPI</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• Fecha (Opcional):</span>
                      <span className="font-mono text-slate-700 dark:text-slate-350">YYYY-MM-DD</span>
                    </li>
                    <li className="flex justify-between">
                      <span>• Estado (Opcional):</span>
                      <span className="font-mono text-slate-700 dark:text-slate-350">Completado</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Resultado Importación */}
              {isUploading && (
                <div className="bg-slate-100/50 dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] p-4 rounded-2xl flex items-center justify-center gap-3 py-6">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                  <span className="text-xs font-bold">Procesando y validando registros...</span>
                </div>
              )}

              {importSummary && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
                  importSummary.success
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                }`}>
                  {importSummary.success ? (
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">{importSummary.success ? 'Importación Completada' : 'Error al importar'}</h4>
                    <p className="text-[11px] font-semibold mt-1 leading-relaxed">{importSummary.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Listado / Tabla Historial */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] flex-1 flex flex-col">
                
                {/* Cabecera / Filtro Historial */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Registros de Entrenamiento</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Listado global de certificaciones registradas en LinePulse</p>
                  </div>

                  <div className="relative rounded-xl shadow-sm w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Buscar en registros..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                {/* Tabla */}
                <div className="border border-slate-200 dark:border-[#334155] rounded-2xl overflow-hidden flex-1">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-[#273449]/40 border-b border-slate-200 dark:border-[#334155] text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
                          <th className="py-3 px-4">Empleado</th>
                          <th className="py-3 px-4">Curso / Entrenamiento</th>
                          <th className="py-3 px-4 text-center">Estado</th>
                          <th className="py-3 px-4 text-center">Fecha Completado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-[#334155]/60 font-semibold text-slate-650 dark:text-[#cbd5e1]">
                        {paginatedRecords.length > 0 ? (
                          paginatedRecords.map((rec, i) => (
                            <tr key={rec.id || i} className="hover:bg-slate-50/50 dark:hover:bg-[#273449]/20 transition-colors">
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-800 dark:text-white truncate max-w-[180px]">{rec.employee_name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {rec.employee_number}</p>
                              </td>
                              <td className="py-3 px-4 font-bold">
                                {rec.training_name}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                  rec.status?.toLowerCase().includes('completado') || rec.status?.toLowerCase().includes('aprobado')
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/10'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-450 border-amber-500/10'
                                }`}>
                                  {rec.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center font-mono text-[11px]">
                                {rec.completion_date || 'N/A'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-400 font-bold dark:text-slate-500 italic">
                              No hay registros de entrenamiento cargados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="p-3 border-t border-slate-200 dark:border-[#334155] bg-slate-50/20 dark:bg-[#273449]/10 flex items-center justify-between text-slate-500 dark:text-[#cbd5e1] text-[11px] font-bold">
                      <div>
                        Mostrando {Math.min(filteredRecords.length, (currentPage - 1) * recordsPerPage + 1)}-
                        {Math.min(filteredRecords.length, currentPage * recordsPerPage)} de {filteredRecords.length}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#2d3b52] cursor-pointer"
                        >
                          Ant
                        </button>
                        <span>
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-[#2d3b52] cursor-pointer"
                        >
                          Sig
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

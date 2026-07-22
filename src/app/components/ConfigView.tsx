'use client';

import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Search, Edit2, Save, X, Trash2, CheckCircle2, AlertCircle, Clock, UploadCloud, Database, GraduationCap, Settings, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MergedEmployee, LGBStatus, FileMetadata, EmployeeOverride, TipoPersonal, Course, Exam, CertificateConfig } from '../types';
import ConfigCourses from './ConfigCourses';
import ConfigExams from './ConfigExams';
import ConfigCertificates from './ConfigCertificates';

import { SchemaDiagnosis } from '../utils/supabaseService';

interface ConfigViewProps {
  employees: MergedEmployee[];
  overrides: Record<string, EmployeeOverride>;
  onSaveOverride: (id: string, override: EmployeeOverride) => void;
  onResetOverrides: () => void;
  hcFileMetadata: FileMetadata;
  reportFileMetadata: FileMetadata;
  onDataLoaded: (type: 'hc' | 'report', data: any[], filename: string, sizeStr: string) => void;
  hcLoaded: boolean;
  reportLoaded: boolean;
  courses: Course[];
  exams: Exam[];
  certConfig: CertificateConfig;
  onSaveCourses: (updatedCourses: Course[]) => void;
  onSaveExams: (updatedExams: Exam[]) => void;
  onSaveCertConfig: (updatedConfig: CertificateConfig) => void;
  supabaseStatus: 'online' | 'offline';
  onImportHcToSupabase: () => Promise<void>;
  onImportReportLgbToSupabase: () => Promise<void>;
  isImportingHC: boolean;
  isImportingReport: boolean;
  onUpdateEmployeeRole: (employeeNumber: string, role: 'Admin' | 'User') => Promise<void>;
  schemaDiagnosis: SchemaDiagnosis[];
}

export default function ConfigView({
  employees,
  overrides,
  onSaveOverride,
  onResetOverrides,
  hcFileMetadata,
  reportFileMetadata,
  onDataLoaded,
  hcLoaded,
  reportLoaded,
  courses,
  exams,
  certConfig,
  onSaveCourses,
  onSaveExams,
  onSaveCertConfig,
  supabaseStatus,
  onImportHcToSupabase,
  onImportReportLgbToSupabase,
  isImportingHC,
  isImportingReport,
  onUpdateEmployeeRole,
  schemaDiagnosis,
}: ConfigViewProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'employees' | 'courses' | 'exams' | 'certificates'>('files');
  
  // Estados para la pestaña de colaboradores
  const [searchTermName, setSearchTermName] = useState('');
  const [searchTermId, setSearchTermId] = useState('');
  const [filterDept, setFilterDept] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState<LGBStatus | 'Todos'>('Todos');
  const [filterTipo, setFilterTipo] = useState<TipoPersonal | 'Todos'>('Todos');
  
  // Paginación de colaboradores en config
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Empleado siendo editado en el modal
  const [editingEmp, setEditingEmp] = useState<MergedEmployee | null>(null);
  const [editDept, setEditDept] = useState('');
  const [editStatus, setEditStatus] = useState<LGBStatus>('Por Certificar');
  const [editAction, setEditAction] = useState('');
  const [editTipo, setEditTipo] = useState<TipoPersonal>('DL');
  const [editRole, setEditRole] = useState<'Admin' | 'User'>('User');

  // Drag-and-drop state
  const [dragActiveHC, setDragActiveHC] = useState(false);
  const [dragActiveLGB, setDragActiveLGB] = useState(false);

  // Procesar carga de archivo Excel
  const processFile = (file: File, type: 'hc' | 'report') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let rawData: any[] = [];
        if (type === 'hc') {
          const sheetName = workbook.SheetNames[1] || workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          rawData = XLSX.utils.sheet_to_json(sheet, { range: 1 });
        } else {
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          rawData = XLSX.utils.sheet_to_json(sheet);
        }

        const sizeInKB = (file.size / 1024).toFixed(1);
        const sizeStr = `${sizeInKB} KB`;
        onDataLoaded(type, rawData, file.name, sizeStr);
      } catch (err: any) {
        alert(`Error al procesar el archivo Excel: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent, type: 'hc' | 'lgb') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      if (type === 'hc') setDragActiveHC(true);
      else setDragActiveLGB(true);
    } else if (e.type === 'dragleave') {
      if (type === 'hc') setDragActiveHC(false);
      else setDragActiveLGB(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'hc' | 'report') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'hc') setDragActiveHC(false);
    else setDragActiveLGB(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], type);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hc' | 'report') => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], type);
    }
  };

  // Obtener departamentos únicos para el dropdown de filtros en config
  const uniqueDepts = useMemo(() => {
    const depts = employees.map(emp => emp.Departamento);
    return Array.from(new Set(depts)).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  // Filtrar colaboradores en administración
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (searchTermId.trim() !== '' && !emp.ID.toLowerCase().includes(searchTermId.toLowerCase())) {
        return false;
      }
      if (searchTermName.trim() !== '' && !emp.Nombre.toLowerCase().includes(searchTermName.toLowerCase())) {
        return false;
      }
      if (filterDept !== 'Todos' && emp.Departamento !== filterDept) {
        return false;
      }
      if (filterStatus !== 'Todos' && emp.Estatus !== filterStatus) {
        return false;
      }
      if (filterTipo !== 'Todos' && emp.TipoPersonal !== filterTipo) {
        return false;
      }
      return true;
    });
  }, [employees, searchTermId, searchTermName, filterDept, filterStatus, filterTipo]);

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

  // Abrir modal de edición
  const startEdit = (emp: MergedEmployee) => {
    setEditingEmp(emp);
    setEditDept(emp.Departamento);
    setEditStatus(emp.Estatus);
    setEditAction(emp.Action);
    setEditTipo(emp.TipoPersonal);
    setEditRole((emp as any).role || 'User');
  };

  // Guardar edición
  const saveEdit = async () => {
    if (editingEmp) {
      onSaveOverride(editingEmp.ID, {
        Departamento: editDept,
        Estatus: editStatus,
        Action: editAction,
        TipoPersonal: editTipo,
      });

      // Guardar el rol en Supabase si está disponible
      if (supabaseStatus === 'online') {
        try {
          await onUpdateEmployeeRole(editingEmp.ID, editRole);
        } catch (e) {
          console.error('Error al guardar el rol en Supabase:', e);
        }
      }
      setEditingEmp(null);
    }
  };

  const totalOverrides = Object.keys(overrides).length;

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in text-slate-800 dark:text-[#f8fafc]">
      {/* Configuration Header Card */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-[#f8fafc] flex items-center gap-2">
            ⚙️ Panel de Configuración y Mantenimiento
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#cbd5e1] font-semibold uppercase mt-0.5 tracking-wider">
            Administración de archivos Excel y overrides manuales
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Conexión Supabase Status */}
          <div className={`px-3 py-2 rounded-xl text-xs font-bold border ${
            supabaseStatus === 'online'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
          }`}>
            {supabaseStatus === 'online' ? '✅ Supabase conectado' : '❌ Error de conexión'}
          </div>

          {totalOverrides > 0 && (
            <button
              onClick={onResetOverrides}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20 cursor-pointer"
              title="Restablecer todos los cambios manuales"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Overrides ({totalOverrides})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-[#334155] flex-wrap">
        <button
          onClick={() => { setActiveTab('files'); setCurrentPage(1); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'files'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-750 dark:text-[#cbd5e1] dark:hover:text-[#f8fafc]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>📂 Carga de Archivos</span>
        </button>
        <button
          onClick={() => { setActiveTab('employees'); setCurrentPage(1); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'employees'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-750 dark:text-[#cbd5e1] dark:hover:text-[#f8fafc]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>👥 Colaboradores</span>
        </button>
        <button
          onClick={() => { setActiveTab('courses'); setCurrentPage(1); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'courses'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-750 dark:text-[#cbd5e1] dark:hover:text-[#f8fafc]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>📚 Adm. Cursos</span>
        </button>
        <button
          onClick={() => { setActiveTab('exams'); setCurrentPage(1); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-750 dark:text-[#cbd5e1] dark:hover:text-[#f8fafc]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>📝 Adm. Exámenes</span>
        </button>
        <button
          onClick={() => { setActiveTab('certificates'); setCurrentPage(1); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'certificates'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-750 dark:text-[#cbd5e1] dark:hover:text-[#f8fafc]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>📜 Adm. Certificados</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'files' && (
          <div className="flex flex-col gap-6">
            {/* Metadata list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Headcount Card Metadata */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
                      Archivo Headcount
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hcLoaded ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {hcFileMetadata.state}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-[#f8fafc] truncate">
                    {hcFileMetadata.name || 'Sin archivo cargado'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-medium text-slate-500 dark:text-[#cbd5e1]">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase mb-0.5">Última actualización</span>
                      <span className="text-slate-700 dark:text-[#f8fafc] font-bold">{hcFileMetadata.lastUpdated || 'Nunca'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase mb-0.5">Tamaño de archivo</span>
                      <span className="text-slate-700 dark:text-[#f8fafc] font-bold">{hcFileMetadata.size || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ReportLGB Card Metadata */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
                      Archivo ReportLGB
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      reportLoaded ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {reportFileMetadata.state}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-[#f8fafc] truncate">
                    {reportFileMetadata.name || 'Sin archivo cargado'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-medium text-slate-500 dark:text-[#cbd5e1]">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase mb-0.5">Última actualización</span>
                      <span className="text-slate-700 dark:text-[#f8fafc] font-bold">{reportFileMetadata.lastUpdated || 'Nunca'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase mb-0.5">Tamaño de archivo</span>
                      <span className="text-slate-700 dark:text-[#f8fafc] font-bold">{reportFileMetadata.size || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploader zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dropzone HC */}
              <div
                onDragEnter={(e) => handleDrag(e, 'hc')}
                onDragOver={(e) => handleDrag(e, 'hc')}
                onDragLeave={(e) => handleDrag(e, 'hc')}
                onDrop={(e) => handleDrop(e, 'hc')}
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActiveHC
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-200 dark:border-[#334155] bg-slate-50/30 dark:bg-[#273449]/30 hover:bg-slate-50 dark:hover:bg-[#2d3b52]/40'
                }`}
              >
                <input
                  type="file"
                  id="file-hc-config"
                  accept=".xlsx, .xls"
                  onChange={(e) => handleFileChange(e, 'hc')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-12 h-12 text-slate-400 dark:text-[#cbd5e1] mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-[#f8fafc]">
                  Actualizar Headcount Oficial (HC B29)
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#cbd5e1] mt-1 max-w-[280px] font-medium">
                  Arrastra el archivo Excel de headcount o haz clic para seleccionarlo
                </p>
              </div>

              {/* Dropzone ReportLGB */}
              <div
                onDragEnter={(e) => handleDrag(e, 'lgb')}
                onDragOver={(e) => handleDrag(e, 'lgb')}
                onDragLeave={(e) => handleDrag(e, 'lgb')}
                onDrop={(e) => handleDrop(e, 'report')}
                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActiveLGB
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-200 dark:border-[#334155] bg-slate-50/30 dark:bg-[#273449]/30 hover:bg-slate-50 dark:hover:bg-[#2d3b52]/40'
                }`}
              >
                <input
                  type="file"
                  id="file-report-config"
                  accept=".xlsx, .xls"
                  onChange={(e) => handleFileChange(e, 'report')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-12 h-12 text-slate-400 dark:text-[#cbd5e1] mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-[#f8fafc]">
                  Actualizar Reporte LGB (ReportLGB)
                </h3>
                <p className="text-xs text-slate-400 dark:text-[#cbd5e1] mt-1 max-w-[280px] font-medium">
                  Arrastra el archivo Excel de certificaciones o haz clic para seleccionarlo
                </p>
              </div>
            </div>

            {/* Supabase Import Zone */}
            {supabaseStatus === 'online' ? (
              <div className="glass-panel p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 flex flex-col gap-4 mt-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-emerald-400 flex items-center gap-1.5 font-sans">
                    <Database className="w-4 h-4 text-emerald-500" /> Sincronización con Supabase Activa
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-[#cbd5e1] mt-1 font-semibold">
                    Importa los registros de tus archivos locales Excel directamente a la base de datos en la nube.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onImportHcToSupabase}
                    disabled={isImportingHC || !hcLoaded}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-all cursor-pointer shadow-md font-sans"
                  >
                    {isImportingHC ? (
                      <>
                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>
                        <span>Importando Headcount...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-3.5 h-3.5" />
                        <span>Importar HC a Supabase</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onImportReportLgbToSupabase}
                    disabled={isImportingReport || !reportLoaded}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-all cursor-pointer shadow-md font-sans"
                  >
                    {isImportingReport ? (
                      <>
                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5"></span>
                        <span>Actualizando Estatus...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-3.5 h-3.5" />
                        <span>Importar ReportLGB a Supabase</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 flex items-start gap-3 mt-2">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-sans">
                    Supabase en Modo Offline
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-[#cbd5e1] mt-1 font-semibold">
                    La base de datos en la nube no está disponible (verifica las variables de entorno o la conexión de red). Se está utilizando localStorage como fallback para almacenamiento.
                  </p>
                </div>
              </div>
            )}

            {/* Sección de Diagnóstico Supabase */}
            {supabaseStatus === 'online' && schemaDiagnosis && schemaDiagnosis.length > 0 && (
              <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] flex flex-col gap-4 mt-4 animate-fade-in">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-[#f8fafc] flex items-center gap-1.5 font-sans">
                    🔍 Diagnóstico Supabase
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-[#cbd5e1] mt-0.5 font-medium">
                    Estado de sincronización estructural de las tablas necesarias para la aplicación.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {schemaDiagnosis.map((item) => {
                    const isOk = item.status === 'ok';
                    return (
                      <div
                        key={item.table}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs font-semibold ${
                          isOk
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'bg-red-500/5 border-red-500/10 text-red-700 dark:text-red-400'
                        }`}
                      >
                        <span className="mt-0.5">
                          {isOk ? '✅' : '❌'}
                        </span>
                        <div className="flex-1">
                          <span className="font-extrabold font-mono uppercase tracking-wider">{item.table}</span>
                          {!isOk && item.errorDetails && (
                            <span className="block mt-1 font-medium text-[10px] opacity-80 leading-normal">
                              {item.errorDetails}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="flex flex-col gap-4">
            {/* Filters panel inside Config */}
            <div className="glass-panel rounded-2xl p-5 flex flex-wrap gap-4 items-center bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
              {/* Search ID */}
              <div className="relative flex-1 min-w-[130px]">
                <input
                  type="text"
                  value={searchTermId}
                  onChange={(e) => { setSearchTermId(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar por ID..."
                  className="w-full pl-3 pr-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold"
                />
              </div>

              {/* Search Name */}
              <div className="relative flex-[2] min-w-[180px]">
                <input
                  type="text"
                  value={searchTermName}
                  onChange={(e) => { setSearchTermName(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar por Nombre Completo..."
                  className="w-full pl-3 pr-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold"
                />
              </div>

              {/* Tipo filter */}
              <div className="min-w-[140px]">
                <select
                  value={filterTipo}
                  onChange={(e) => { setFilterTipo(e.target.value as TipoPersonal | 'Todos'); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold cursor-pointer"
                >
                  <option value="Todos" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Tipo: Todos</option>
                  <option value="IDL" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Tipo: IDL</option>
                  <option value="DL" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Tipo: DL</option>
                </select>
              </div>

              {/* Dept filter */}
              <div className="min-w-[150px]">
                <select
                  value={filterDept}
                  onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold cursor-pointer"
                >
                  <option value="Todos" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Depto: Todos</option>
                  {uniqueDepts.map(d => (
                    <option key={d} value={d} className="dark:bg-[#1e293b] dark:text-[#f8fafc]">{d}</option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="min-w-[150px]">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value as LGBStatus | 'Todos'); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold cursor-pointer"
                >
                  <option value="Todos" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Estatus: Todos</option>
                  <option value="Certificado" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Certificado</option>
                  <option value="Potencial" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Potencial</option>
                  <option value="Por Certificar" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Por Certificar</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 dark:border-[#334155] rounded-2xl overflow-hidden bg-slate-50/10 dark:bg-[#273449]/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#273449]/40 border-b border-slate-200 dark:border-[#334155] text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
                      <th className="py-3 px-4">ID Empleado</th>
                      <th className="py-3 px-4">Nombre</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Departamento</th>
                      <th className="py-3 px-4">Estatus Certificación</th>
                      <th className="py-3 px-4">Rol</th>
                      <th className="py-3 px-4">Action ReportLGB</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#334155]/60 text-xs font-semibold text-slate-655 dark:text-[#cbd5e1]">
                    {paginatedEmployees.length > 0 ? (
                      paginatedEmployees.map((emp) => {
                        const hasOverride = !!overrides[emp.ID];
                        return (
                          <tr 
                            key={emp.ID} 
                            className={`hover:bg-slate-55/50 dark:hover:bg-[#273449]/20 transition-colors ${
                              hasOverride ? 'bg-emerald-500/5 dark:bg-emerald-500/5 border-l-2 border-l-emerald-500' : ''
                            }`}
                          >
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-[#f8fafc]">
                              {emp.ID}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-[#f8fafc] truncate max-w-[180px]" title={emp.Nombre}>
                              {emp.Nombre}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                emp.TipoPersonal === 'IDL' 
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                              }`}>
                                {emp.TipoPersonal}
                              </span>
                            </td>
                            <td className="py-3 px-4 truncate max-w-[130px]" title={emp.Departamento}>
                              {emp.Departamento}
                            </td>
                            <td className="py-3 px-4">
                              {emp.Estatus === 'Certificado' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20">
                                  Certificado
                                </span>
                              ) : emp.Estatus === 'Potencial' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                  Potencial
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                  Por Certificar
                                </span>
                              )}
                              {hasOverride && (
                                <span className="ml-1.5 text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500 text-white dark:bg-emerald-600 uppercase tracking-wide">
                                  Editado
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                (emp as any).role === 'Admin' 
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                              }`}>
                                {(emp as any).role || 'User'}
                              </span>
                            </td>
                            <td className="py-3 px-4 truncate max-w-[130px] text-slate-400 dark:text-[#94a3b8]" title={emp.Action}>
                              {emp.Action || <span className="italic text-[10px] text-slate-400/50">N/A</span>}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => startEdit(emp)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-[#273449] dark:hover:bg-[#2d3b52] text-slate-700 dark:text-[#cbd5e1] border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer"
                              >
                                ✏️ Editar
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-[#94a3b8] font-bold">
                          No se encontraron colaboradores que coincidan con la búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-[#334155] bg-slate-50/20 dark:bg-[#273449]/10 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-[#cbd5e1]">
                  <div>
                    Mostrando {Math.min(filteredEmployees.length, (currentPage - 1) * itemsPerPage + 1)}-
                    {Math.min(filteredEmployees.length, currentPage * itemsPerPage)} de {filteredEmployees.length} colaboradores
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
          </div>
        )}

        {activeTab === 'courses' && (
          <ConfigCourses courses={courses} onSaveCourses={onSaveCourses} />
        )}

        {activeTab === 'exams' && (
          <ConfigExams courses={courses} exams={exams} onSaveExams={onSaveExams} />
        )}

        {activeTab === 'certificates' && (
          <ConfigCertificates certConfig={certConfig} onSaveConfig={onSaveCertConfig} />
        )}
      </div>

      {/* Edit Override Modal Form */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl overflow-hidden flex flex-col bg-white dark:bg-[#1e293b] shadow-2xl border border-slate-250 dark:border-[#334155]">
            {/* Modal Edit Header */}
            <div className="p-5 border-b border-slate-200 dark:border-[#334155] flex justify-between items-center bg-slate-50/50 dark:bg-[#273449]/40">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-[#f8fafc]">
                  Editar Datos de Colaborador
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-[#cbd5e1] font-bold uppercase tracking-wider">
                  Mantenimiento Manual de Datos
                </p>
              </div>
              <button
                onClick={() => setEditingEmp(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#e2e8f0] dark:bg-[#273449] dark:hover:bg-[#2d3b52] text-slate-500 dark:text-[#cbd5e1] border border-slate-200/50 dark:border-[#334155] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Edit Body */}
            <div className="p-5 flex flex-col gap-4">
              {/* ID Empleado (ReadOnly) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider mb-1">
                  ID Empleado (Solo Lectura)
                </label>
                <input
                  type="text"
                  value={editingEmp.ID}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-[#273449]/40 border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#94a3b8] cursor-not-allowed font-bold"
                />
              </div>

              {/* Nombre (ReadOnly) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider mb-1">
                  Nombre Completo (Solo Lectura)
                </label>
                <input
                  type="text"
                  value={editingEmp.Nombre}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-[#273449]/40 border border-slate-200 dark:border-[#334155] text-slate-500 dark:text-[#94a3b8] cursor-not-allowed font-bold"
                />
              </div>

              {/* Tipo de Personal (Editable - Nuevo) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider mb-1">
                  Tipo de Personal (Editable)
                </label>
                <select
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value as TipoPersonal)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold cursor-pointer"
                >
                  <option value="DL" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">DL (Directo)</option>
                  <option value="IDL" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">IDL (Indirecto)</option>
                </select>
              </div>

              {/* Departamento (Editable) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider mb-1">
                  Departamento (Editable)
                </label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold"
                  placeholder="Nombre del Departamento"
                />
              </div>

              {/* Estatus Certificación (Editable) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider mb-1">
                  Estatus Certificación (Editable)
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as LGBStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold cursor-pointer"
                >
                  <option value="Certificado" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Certificado</option>
                  <option value="Potencial" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Potencial</option>
                  <option value="Por Certificar" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Por Certificar</option>
                </select>
              </div>

              {/* Action ReportLGB (Editable) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider mb-1">
                  Acción Reporte LGB (Editable)
                </label>
                <input
                  type="text"
                  value={editAction}
                  onChange={(e) => setEditAction(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-semibold"
                  placeholder="Complete, Create Form, etc."
                />
              </div>

              {/* Rol Administrativo (Editable - Supabase) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider mb-1">
                  Rol Administrativo (Supabase)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'Admin' | 'User')}
                  disabled={supabaseStatus !== 'online'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-[#f8fafc] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold cursor-pointer"
                >
                  <option value="User" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">User (Solo lectura)</option>
                  <option value="Admin" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Admin (Lectura/Escritura)</option>
                </select>
                {supabaseStatus !== 'online' && (
                  <p className="text-[10px] text-amber-500 font-bold mt-1">
                    * Modificación deshabilitada en modo offline.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Edit Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#273449]/40 flex justify-end gap-2">
              <button
                onClick={() => setEditingEmp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-[#e2e8f0] dark:bg-[#273449] dark:hover:bg-[#2d3b52] text-slate-700 dark:text-[#cbd5e1] border border-slate-200/50 dark:border-[#334155] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
              >
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

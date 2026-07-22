'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';
import ConfigView from './components/ConfigView';
import TrainingMatrix from './components/TrainingMatrix';
import AcademiaLean from './components/AcademiaLean';
import KPISection from './components/KPISection';
import FiltersSection from './components/FiltersSection';
import MainChartSection from './components/MainChartSection';
import EmployeeTable from './components/EmployeeTable';
import DepartmentModal from './components/DepartmentModal';
import { 
  MergedEmployee, 
  LGBStatus, 
  UserRole, 
  EmployeeOverride, 
  OverrideMap, 
  FileMetadata, 
  TipoPersonal,
  Course,
  Exam,
  UserCourseProgress,
  TrainingState,
  CertificateConfig
} from './types';
import { processLgbData, computeKPIs, computeDepartmentSummaries } from './utils/dataProcessor';
import { Loader2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAssetPath } from './utils/paths';

// Cursos predeterminados exigidos por las reglas del negocio
const defaultCourses: Course[] = [
  {
    id: 'lean-basics-1',
    name: 'Lean Basics 1',
    description: 'Conceptos básicos de manufactura esbelta, desperdicios y valor agregado en líneas de producción.',
    duration: '2 horas',
    order: 1,
    materials: []
  },
  {
    id: '5s-1',
    name: '5S + 1',
    description: 'Metodología clásica de las 5S con enfoque transversal en la Seguridad (+1).',
    duration: '1.5 horas',
    order: 2,
    materials: []
  },
  {
    id: '5-whys',
    name: '5 Whys',
    description: 'Herramienta de análisis de causa raíz que indaga de manera iterativa el origen físico y de gestión de una falla.',
    duration: '1 hora',
    order: 3,
    materials: []
  },
  {
    id: '7-ways',
    name: '7 Ways',
    description: 'Resolución analítica de problemas orientada a proponer y seleccionar de entre 7 opciones distintas de solución.',
    duration: '2 horas',
    order: 4,
    materials: []
  },
  {
    id: 'sga-guide',
    name: 'Small Group Activities (SGA) Guide',
    description: 'Guía de trabajo para la ejecución de proyectos de mejora en equipos pequeños y círculos de calidad.',
    duration: '3 horas',
    order: 5,
    materials: []
  }
];

// Exámenes predeterminados iniciales para demo
const defaultExams: Exam[] = [
  {
    courseId: 'lean-basics-1',
    minScore: 80,
    questions: [
      {
        id: 'lb-q1',
        text: '¿Cuál es el objetivo principal de la filosofía Lean Manufacturing?',
        options: [
          'Incrementar los inventarios para evitar esperas',
          'Eliminar desperdicios y maximizar el valor entregado al cliente con el mínimo de recursos',
          'Automatizar todas las estaciones de trabajo reemplazando operarios',
          'Aumentar el número de inspecciones al final de la línea'
        ],
        correctOptionIndex: 1,
        points: 10
      },
      {
        id: 'lb-q2',
        text: '¿Cuál de los siguientes NO es uno de los 8 desperdicios (Mudas)?',
        options: [
          'Sobreproducción innecesaria',
          'Movimientos innecesarios del operador',
          'La seguridad en la línea de trabajo',
          'Defectos y re-trabajo'
        ],
        correctOptionIndex: 2,
        points: 10
      },
      {
        id: 'lb-q3',
        text: '¿Qué tipo de actividad agrega valor real a un producto?',
        options: [
          'El traslado de material de una nave a otra',
          'La inspección minuciosa de calidad al final del turno',
          'El proceso de ensamble y ensamble directo según especificaciones',
          'Almacenar piezas terminadas en estantes'
        ],
        correctOptionIndex: 2,
        points: 10
      }
    ]
  },
  {
    courseId: '5s-1',
    minScore: 80,
    questions: [
      {
        id: '5s-q1',
        text: '¿Qué significa Seiri en la metodología de las 5S?',
        options: [
          'Limpiar la maquinaria al final del turno',
          'Clasificar y separar los elementos necesarios de los innecesarios',
          'Estandarizar las ayudas visuales de la estación',
          'Tener disciplina para llegar a tiempo'
        ],
        correctOptionIndex: 1,
        points: 10
      },
      {
        id: '5s-q2',
        text: 'En la práctica de "5S + 1", ¿qué representa la suma de "+ 1"?',
        options: [
          'Una hora adicional de sobretiempo',
          'Seguridad laboral (mitigación de riesgos)',
          'Un operador extra en la línea',
          'Una inspección adicional de calidad'
        ],
        correctOptionIndex: 1,
        points: 10
      },
      {
        id: '5s-q3',
        text: 'El lema "Un lugar para cada cosa y cada cosa en su lugar" corresponde a:',
        options: [
          'Seiton (Ordenar)',
          'Seiso (Limpiar)',
          'Seiri (Clasificar)',
          'Shitsuke (Disciplina)'
        ],
        correctOptionIndex: 0,
        points: 10
      }
    ]
  },
  {
    courseId: '5-whys',
    minScore: 80,
    questions: [
      {
        id: 'fw-q1',
        text: '¿Cuál es el propósito primordial de la herramienta de los 5 Porqués?',
        options: [
          'Encontrar al operador responsable del error en la línea',
          'Identificar la causa raíz de un problema para evitar su repetición',
          'Proponer 5 soluciones Kaizen alternativas rápidamente',
          'Llenar el papeleo administrativo de incidentes'
        ],
        correctOptionIndex: 1,
        points: 10
      },
      {
        id: 'fw-q2',
        text: '¿Cuántas preguntas de "¿Por qué?" se deben realizar en esta herramienta?',
        options: [
          'Exactamente 5 preguntas en todos los casos obligatoriamente',
          'Siempre 3 preguntas para ser rápidos',
          'Las necesarias hasta llegar a la verdadera causa raíz (típicamente 5)',
          'Ninguna, se deduce directamente de la primera respuesta'
        ],
        correctOptionIndex: 2,
        points: 10
      },
      {
        id: 'fw-q3',
        text: '¿Por qué se debe ir al Gemba (piso de trabajo) al realizar los 5 Porqués?',
        options: [
          'Para hablar con la gerencia de planta',
          'Para verificar los hechos y la evidencia real sin basarse en suposiciones',
          'Para detener la línea de producción',
          'Para limpiar la máquina que falló'
        ],
        correctOptionIndex: 1,
        points: 10
      }
    ]
  },
  {
    courseId: '7-ways',
    minScore: 80,
    questions: [
      {
        id: '7w-q1',
        text: '¿Qué busca promover la herramienta "7 Ways"?',
        options: [
          'Resolver el problema en 7 minutos',
          'Limitar las ideas del equipo a 1 sola solución obvia',
          'Forzar la generación de al menos 7 ideas de solución distintas ante un problema',
          'Tener 7 operadores en cada reunión Kaizen'
        ],
        correctOptionIndex: 2,
        points: 10
      },
      {
        id: '7w-q2',
        text: 'Al evaluar los "7 Ways", ¿qué factores se ponderan típicamente?',
        options: [
          'Costo, Esfuerzo de implementación, Impacto en calidad y Factibilidad',
          'La opinión del supervisor de producción únicamente',
          'El color de las máquinas a modificar',
          'Ninguno, se escoge la idea al azar'
        ],
        correctOptionIndex: 0,
        points: 10
      },
      {
        id: '7w-q3',
        text: '¿Qué fase sigue inmediatamente después de evaluar los 7 Ways?',
        options: [
          'Olvidar el problema y continuar la rutina',
          'Seleccionar la mejor alternativa o combinación, e implementar un plan de acción',
          'Despedir al equipo de ingenieros de calidad',
          'Volver a empezar a buscar otros 7 ways'
        ],
        correctOptionIndex: 1,
        points: 10
      }
    ]
  },
  {
    courseId: 'sga-guide',
    minScore: 80,
    questions: [
      {
        id: 'sg-q1',
        text: '¿Qué significan las siglas SGA en mejora continua?',
        options: [
          'Sistema de Gestión de Almacenes',
          'Small Group Activities (Actividades de Grupos Pequeños)',
          'Soporte Gráfico de Aprendizaje',
          'Seguimiento General de Acciones'
        ],
        correctOptionIndex: 1,
        points: 10
      },
      {
        id: 'sg-q2',
        text: '¿Cuál es el rol del Facilitador en un equipo de SGA?',
        options: [
          'Asesorar al equipo en la metodología Lean y guiar la resolución del problema',
          'Realizar todas las tareas del Kaizen en su oficina',
          'Tomar las decisiones definitivas del equipo de manera autoritaria',
          'Solo tomar lista de asistencia en las reuniones'
        ],
        correctOptionIndex: 0,
        points: 10
      },
      {
        id: 'sg-q3',
        text: '¿Cuál es el beneficio de involucrar al personal operativo (DL) en un SGA?',
        options: [
          'Reducir los sueldos del personal de línea',
          'Aprovechar el conocimiento real de quienes ejecutan el proceso para mejorar calidad y productividad',
          'Hacer que trabajen más horas extras sin pago',
          'Eliminar los puestos de supervisores'
        ],
        correctOptionIndex: 1,
        points: 10
      }
    ]
  }
];

const defaultCertConfig: CertificateConfig = {
  background: '',
  textColor: '#ffffff',
  positions: {
    nombreEmpleado: { x: 50, y: 34, fontSize: 42, visible: true },
    numEmpleado: { x: 50, y: 42, fontSize: 18, visible: true },
    nombreCurso: { x: 50, y: 56, fontSize: 36, visible: true },
    fechaCompletado: { x: 30, y: 70, fontSize: 18, visible: true },
    calificacion: { x: 70, y: 70, fontSize: 18, visible: true },
    folio: { x: 50, y: 82, fontSize: 14, visible: true },
  }
};

export default function DashboardPage() {
  const [hcData, setHcData] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPreloaded, setIsPreloaded] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // CONTROL DE SESIÓN Y VISTAS
  const [currentUser, setCurrentUser] = useState<MergedEmployee | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('General'); 
  const [currentView, setCurrentView] = useState<string>('academia');

  // CONFIGURACIÓN DE ACADEMIA Y EXÁMENES
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [trainingState, setTrainingState] = useState<TrainingState>({});
  const [certConfig, setCertConfig] = useState<CertificateConfig>(defaultCertConfig);

  // Estado de overrides manuales (modificaciones de administrador)
  const [overrides, setOverrides] = useState<OverrideMap>({});

  // Metadatos de archivos Excel
  const [hcFileMetadata, setHcFileMetadata] = useState<FileMetadata>({
    name: 'Ninguno',
    size: 'N/A',
    lastUpdated: 'Nunca',
    state: 'No Cargado',
  });
  const [reportFileMetadata, setReportFileMetadata] = useState<FileMetadata>({
    name: 'Ninguno',
    size: 'N/A',
    lastUpdated: 'Nunca',
    state: 'No Cargado',
  });

  // Filtros de búsqueda (dashboard principal)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState<LGBStatus | 'Todos'>('Todos');
  const [selectedTipoPersonal, setSelectedTipoPersonal] = useState<TipoPersonal | 'Todos'>('Todos');

  // Drill Down de Departamento (Modal)
  const [selectedDrillDownDept, setSelectedDrillDownDept] = useState<string | null>(null);

  // Manejar cambio de tema (Claro/Oscuro)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Cargar sesión y base de datos local al iniciar la aplicación
  useEffect(() => {
    try {
      // 1. Cargar sesión de usuario
      const savedUser = localStorage.getItem('lgb_logged_in_user');
      const savedRole = localStorage.getItem('lgb_logged_in_role');
      if (savedUser && savedRole) {
        setCurrentUser(JSON.parse(savedUser));
        setCurrentRole(savedRole as UserRole);
        setCurrentView(savedRole === 'Admin' ? 'dashboard' : 'academia');
      }

      // 2. Cargar base de datos académica (Cursos)
      const savedCourses = localStorage.getItem('lgb_courses_list');
      if (savedCourses) {
        setCourses(JSON.parse(savedCourses));
      } else {
        setCourses(defaultCourses);
        localStorage.setItem('lgb_courses_list', JSON.stringify(defaultCourses));
      }

      // 3. Cargar exámenes
      const savedExams = localStorage.getItem('lgb_exams_list');
      if (savedExams) {
        setExams(JSON.parse(savedExams));
      } else {
        setExams(defaultExams);
        localStorage.setItem('lgb_exams_list', JSON.stringify(defaultExams));
      }

      // 4. Cargar plantillas de certificado
      const savedCertConfig = localStorage.getItem('lgb_cert_config');
      if (savedCertConfig) {
        setCertConfig(JSON.parse(savedCertConfig));
      } else {
        setCertConfig(defaultCertConfig);
        localStorage.setItem('lgb_cert_config', JSON.stringify(defaultCertConfig));
      }

      // 5. Cargar estado de progreso del entrenamiento global
      const savedTraining = localStorage.getItem('lgb_training_state');
      if (savedTraining) {
        setTrainingState(JSON.parse(savedTraining));
      }

      // 6. Cargar overrides
      const savedOverrides = localStorage.getItem('lgb_dashboard_overrides');
      if (savedOverrides) {
        setOverrides(JSON.parse(savedOverrides));
      }
    } catch (e) {
      console.error('Error al inicializar bases de datos locales:', e);
    }
  }, []);

  // Carga inicial automática de archivos Excel desde la carpeta public/data de forma estática
  const loadPreloadedData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const hcUrl = getAssetPath('/data/HC B29 2026 Junio.xlsx');
      const reportUrl = getAssetPath('/data/ReportLGB.xlsx');

      console.log('[LGB App debug] Iniciando carga de Excels...');
      console.log('[LGB App debug] URL de Headcount:', hcUrl);
      console.log('[LGB App debug] URL de ReportLGB:', reportUrl);

      // 1. Cargar Headcount Excel
      const resHC = await fetch(hcUrl);
      console.log('[LGB App debug] Res Headcount fetch status:', resHC.status);
      if (!resHC.ok) {
        throw new Error('No se encontró el archivo de datos requerido.');
      }
      const bufferHC = await resHC.arrayBuffer();
      const hcWorkbook = XLSX.read(bufferHC, { type: 'array' });
      const sheetNameHC = hcWorkbook.SheetNames[1] || hcWorkbook.SheetNames[0];
      const sheetHC = hcWorkbook.Sheets[sheetNameHC];
      const hcRawData = XLSX.utils.sheet_to_json(sheetHC, { range: 1 });
      console.log('[LGB App debug] Headcount parsed rows count:', hcRawData.length);

      // 2. Cargar ReportLGB Excel
      const resReport = await fetch(reportUrl);
      console.log('[LGB App debug] Res ReportLGB fetch status:', resReport.status);
      if (!resReport.ok) {
        throw new Error('No se encontró el archivo de datos requerido.');
      }
      const bufferReport = await resReport.arrayBuffer();
      const reportWorkbook = XLSX.read(bufferReport, { type: 'array' });
      const sheetNameReport = reportWorkbook.SheetNames[0];
      const sheetReport = reportWorkbook.Sheets[sheetNameReport];
      const reportRawData = XLSX.utils.sheet_to_json(sheetReport);
      console.log('[LGB App debug] ReportLGB parsed rows count:', reportRawData.length);

      // Cargar datos en los estados
      setHcData(hcRawData);
      setReportData(reportRawData);
      setIsPreloaded(true);

      // Registrar metadatos del servidor
      const nowStr = new Date().toLocaleString('es-MX');
      setHcFileMetadata({
        name: 'HC B29 2026 Junio.xlsx',
        size: '388.9 KB',
        lastUpdated: nowStr,
        state: 'Cargado de Servidor',
      });
      setReportFileMetadata({
        name: 'ReportLGB.xlsx',
        size: '25.7 KB',
        lastUpdated: nowStr,
        state: 'Cargado de Servidor',
      });
    } catch (err: any) {
      // Mensaje de fallback amigable
      const userMessage = err.message === 'No se encontró el archivo de datos requerido.'
        ? err.message
        : `No se pudieron cargar los archivos iniciales: ${err.message}`;
      setApiError(userMessage);
      setIsPreloaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPreloadedData();
  }, []);

  // Lógica de carga manual (Drag and Drop de Excel en Configuración)
  const handleDataLoaded = (type: 'hc' | 'report', data: any[], filename: string, sizeStr: string) => {
    const nowStr = new Date().toLocaleString('es-MX');
    if (type === 'hc') {
      setHcData(data);
      setHcFileMetadata({
        name: filename,
        size: sizeStr,
        lastUpdated: nowStr,
        state: 'Cargado por Usuario',
      });
    } else {
      setReportData(data);
      setReportFileMetadata({
        name: filename,
        size: sizeStr,
        lastUpdated: nowStr,
        state: 'Cargado por Usuario',
      });
    }
    setIsPreloaded(false);
  };

  // Guardar override manual del administrador
  const handleSaveOverride = (id: string, override: EmployeeOverride) => {
    const updatedOverrides = {
      ...overrides,
      [id]: {
        ...overrides[id],
        ...override,
      },
    };
    setOverrides(updatedOverrides);
    try {
      localStorage.setItem('lgb_dashboard_overrides', JSON.stringify(updatedOverrides));
    } catch (e) {
      console.error('Error al guardar overrides en localStorage:', e);
    }
  };

  // Restablecer overrides manuales
  const handleResetOverrides = () => {
    if (confirm('¿Está seguro de que desea eliminar todas las modificaciones manuales? Se volverá a mostrar la información original de los archivos Excel.')) {
      setOverrides({});
      try {
        localStorage.removeItem('lgb_dashboard_overrides');
      } catch (e) {
        console.error('Error al limpiar overrides de localStorage:', e);
      }
    }
  };

  // MANEJADORES DE GUARDADO DE CONFIGURACIONES
  const handleSaveCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem('lgb_courses_list', JSON.stringify(newCourses));
  };

  const handleSaveExams = (newExams: Exam[]) => {
    setExams(newExams);
    localStorage.setItem('lgb_exams_list', JSON.stringify(newExams));
  };

  const handleSaveCertConfig = (newConfig: CertificateConfig) => {
    setCertConfig(newConfig);
    localStorage.setItem('lgb_cert_config', JSON.stringify(newConfig));
  };

  // Actualizar el progreso de un colaborador en particular
  const handleUpdateUserProgress = (courseId: string, updatedProgress: Partial<UserCourseProgress>) => {
    if (!currentUser) return;
    
    const userProgMap = trainingState[currentUser.ID] || {};
    const oldCourseProg = userProgMap[courseId] || {
      status: 'no-iniciado',
      progress: 0,
      contentViewed: false,
      examAttempts: 0,
      examScore: null,
      examPassed: false,
      completionDate: null,
      certificateFolio: null,
    };

    const newCourseProg: UserCourseProgress = {
      ...oldCourseProg,
      ...updatedProgress,
    };

    const newUserProgMap = {
      ...userProgMap,
      [courseId]: newCourseProg,
    };

    const newTrainingState = {
      ...trainingState,
      [currentUser.ID]: newUserProgMap,
    };

    setTrainingState(newTrainingState);
    localStorage.setItem('lgb_training_state', JSON.stringify(newTrainingState));

    // Si el usuario actualmente logueado cambia su progreso, refrescar su copia en sesión
    // para que la interfaz (sidebar, perfil, etc.) se redibuje inmediatamente.
    const requiredIds = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];
    const passedAll = requiredIds.every(id => newUserProgMap[id]?.examPassed === true);
    
    if (passedAll && currentUser.Estatus !== 'Certificado') {
      const updatedUser = {
        ...currentUser,
        Estatus: 'Certificado' as LGBStatus,
        Action: 'Complete'
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('lgb_logged_in_user', JSON.stringify(updatedUser));
    }
  };

  // PROCESAMIENTO Y CRUCE DE DATOS INTEGRADO CON ACADEMIA
  // Las métricas del dashboard se recalculan dinámicamente si el empleado completa sus cursos
  const mergedEmployees = useMemo(() => {
    if (hcData.length === 0) return [];
    
    // Obtener los datos base del headcount y reporte LGB
    const baseList = processLgbData(hcData, reportData, overrides);
    const requiredIds = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];

    // Mapear y cruzar con el progreso local para cambiar estatus en caliente
    return baseList.map(emp => {
      const empProgMap = trainingState[emp.ID] || {};
      
      // Comprobar si aprobó todos los exámenes mínimos
      const passedAll = requiredIds.every(id => empProgMap[id]?.examPassed === true);

      if (passedAll) {
        return {
          ...emp,
          Estatus: 'Certificado' as LGBStatus,
          Action: 'Complete',
        };
      }

      // Si ha iniciado/completado alguno, pero no todos
      const startedAny = requiredIds.some(
        id => empProgMap[id]?.status === 'en-progreso' || empProgMap[id]?.status === 'completado'
      );

      if (startedAny && emp.Estatus !== 'Certificado') {
        return {
          ...emp,
          Estatus: 'Potencial' as LGBStatus,
          Action: emp.Action || 'Create Form',
        };
      }

      return emp;
    });
  }, [hcData, reportData, overrides, trainingState]);

  // Filtrado de la lista para el dashboard
  const filteredEmployees = useMemo(() => {
    return mergedEmployees.filter((emp) => {
      if (selectedTipoPersonal !== 'Todos' && emp.TipoPersonal !== selectedTipoPersonal) {
        return false;
      }
      if (selectedDept !== 'Todos' && emp.Departamento !== selectedDept) {
        return false;
      }
      if (selectedStatus !== 'Todos' && emp.Estatus !== selectedStatus) {
        return false;
      }
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
  }, [mergedEmployees, selectedTipoPersonal, selectedDept, selectedStatus, searchTerm]);

  // Departamentos únicos para filtros
  const uniqueDepartments = useMemo(() => {
    const depts = mergedEmployees.map((emp) => emp.Departamento);
    return Array.from(new Set(depts)).sort((a, b) => a.localeCompare(b));
  }, [mergedEmployees]);

  // KPIs globales recalculados
  const dashboardKPIs = useMemo(() => {
    return computeKPIs(filteredEmployees);
  }, [filteredEmployees]);

  // Resumen departamentos para gráficos
  const departmentSummaries = useMemo(() => {
    return computeDepartmentSummaries(filteredEmployees);
  }, [filteredEmployees]);

  // Modal departamento Drill-down
  const drillDownData = useMemo(() => {
    if (!selectedDrillDownDept) return null;
    const deptEmployees = mergedEmployees.filter(emp => emp.Departamento === selectedDrillDownDept);
    const summary = computeDepartmentSummaries(deptEmployees)[0] || {
      Departamento: selectedDrillDownDept,
      totalHC: 0,
      certified: 0,
      potential: 0,
      pending: 0,
      percentage: 0
    };
    return {
      summary,
      employees: deptEmployees
    };
  }, [selectedDrillDownDept, mergedEmployees]);

  // MANEJO DE LOGIN Y LOGOUT
  const handleLogin = (user: MergedEmployee, role: UserRole) => {
    setCurrentUser(user);
    setCurrentRole(role);
    setCurrentView(role === 'Admin' ? 'dashboard' : 'academia');
    
    // Guardar en sesión
    localStorage.setItem('lgb_logged_in_user', JSON.stringify(user));
    localStorage.setItem('lgb_logged_in_role', role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lgb_logged_in_user');
    localStorage.removeItem('lgb_logged_in_role');
  };

  // RENDER PÁGINA
  
  // 1. Si no está logueado, mostrar Login
  if (!currentUser) {
    return (
      <LoginView 
        employees={mergedEmployees} 
        onLogin={handleLogin} 
        hcLoaded={hcData.length > 0} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#0b1324] text-slate-800 dark:text-[#f8fafc] transition-colors duration-300">
      
      {/* Barra lateral */}
      <Sidebar
        user={currentUser}
        role={currentRole}
        currentView={currentView}
        onViewChange={(view) => {
          // Seguridad: el usuario general no puede acceder a las áreas de administrador
          if (currentRole !== 'Admin' && view !== 'academia') return;
          setCurrentView(view);
        }}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onLogout={handleLogout}
      />

      {/* Contenedor de contenido de la derecha */}
      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full min-h-screen">
        
        {/* Alerta de archivos no cargados para administradores */}
        {currentRole === 'Admin' && apiError && !hcData.length && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm font-semibold animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de administrador:</p>
              <p className="font-medium mt-0.5">{apiError}</p>
              <p className="font-medium mt-1 text-xs text-slate-550">
                Vaya a la sección de Configuración para cargar los archivos headcount y ReportLGB.
              </p>
            </div>
          </div>
        )}

        {/* CARGADOR INICIAL SI ESTÁ SIN CONECTAR AL SERVER */}
        {isLoading && hcData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-350">Conectando con el Servidor B29...</h3>
            <p className="text-xs mt-1">Leyendo archivos locales</p>
          </div>
        ) : (
          <>
            {/* RENDER DE VISTAS SEGÚN SELECCIÓN DE SIDEBAR */}
            {currentView === 'dashboard' && currentRole === 'Admin' && (
              /* PANEL DE DASHBOARD */
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Lean Green Belt Certification Dashboard</h2>
                  <p className="text-xs text-slate-400 dark:text-[#cbd5e1] font-semibold uppercase mt-0.5 tracking-wider">Métricas de Certificación y Control de Headcount | Philo B29 Site</p>
                </div>

                {hcData.length > 0 ? (
                  <>
                    <KPISection stats={dashboardKPIs} selectedTipoPersonal={selectedTipoPersonal} />

                    <FiltersSection
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      selectedDept={selectedDept}
                      setSelectedDept={setSelectedDept}
                      selectedStatus={selectedStatus}
                      setSelectedStatus={setSelectedStatus}
                      selectedTipoPersonal={selectedTipoPersonal}
                      setSelectedTipoPersonal={setSelectedTipoPersonal}
                      departments={uniqueDepartments}
                    />

                    <MainChartSection
                      stats={dashboardKPIs}
                      departmentSummaries={departmentSummaries}
                      onDeptClick={setSelectedDrillDownDept}
                      employees={mergedEmployees}
                      selectedTipoPersonal={selectedTipoPersonal}
                      setSelectedTipoPersonal={setSelectedTipoPersonal}
                    />

                    <EmployeeTable employees={filteredEmployees} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-555 py-20">
                    <AlertCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 animate-bounce" />
                    <h3 className="text-lg font-bold text-slate-705 dark:text-slate-300">Sin Datos Cargados</h3>
                    <p className="text-xs max-w-sm mt-1 mx-auto mb-4 font-semibold">Debe ir a la pestaña Configuración e importar los archivos Excel de headcount y ReportLGB para ver las métricas.</p>
                  </div>
                )}
              </div>
            )}

            {currentView === 'matrix' && currentRole === 'Admin' && (
              /* MATRIZ DE ENTRENAMIENTO */
              <TrainingMatrix
                employees={mergedEmployees}
                trainingState={trainingState}
                courses={courses}
              />
            )}

            {currentView === 'config' && currentRole === 'Admin' && (
              /* PANEL DE CONFIGURACIÓN */
              <ConfigView
                employees={mergedEmployees}
                overrides={overrides}
                onSaveOverride={handleSaveOverride}
                onResetOverrides={handleResetOverrides}
                hcFileMetadata={hcFileMetadata}
                reportFileMetadata={reportFileMetadata}
                onDataLoaded={handleDataLoaded}
                hcLoaded={hcData.length > 0}
                reportLoaded={reportData.length > 0}
                courses={courses}
                exams={exams}
                certConfig={certConfig}
                onSaveCourses={handleSaveCourses}
                onSaveExams={handleSaveExams}
                onSaveCertConfig={handleSaveCertConfig}
              />
            )}

            {currentView === 'academia' && (
              /* LMS: ACADEMIA LEAN (Para General Users y para Vista de Admin) */
              <AcademiaLean
                user={currentUser}
                courses={courses}
                progress={trainingState[currentUser.ID] || {}}
                exams={exams}
                onUpdateProgress={handleUpdateUserProgress}
                certConfig={certConfig}
              />
            )}
          </>
        )}

      </div>

      {/* Drill-down Modal de Departamento en Dashboard */}
      {selectedDrillDownDept && drillDownData && (
        <DepartmentModal
          deptName={selectedDrillDownDept}
          deptSummary={drillDownData.summary}
          employees={drillDownData.employees}
          selectedTipoPersonal={selectedTipoPersonal}
          onClose={() => setSelectedDrillDownDept(null)}
        />
      )}
    </div>
  );
}

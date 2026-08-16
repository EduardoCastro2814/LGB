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
import AppliedToolsView from './components/AppliedToolsView';
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
  CertificateConfig,
  AppliedTool
} from './types';
import { processLgbData, computeKPIs, computeDepartmentSummaries } from './utils/dataProcessor';
import { Loader2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAssetPath } from './utils/paths';
import {
  testSupabaseConnection,
  getSupabaseEmployees,
  importHcEmployees,
  importReportLgbStatuses,
  updateSupabaseEmployeeRole,
  updateSupabaseEmployeeDetails,
  getSupabaseCourses,
  saveSupabaseCourse,
  deleteSupabaseCourse,
  getSupabaseExams,
  saveSupabaseExam,
  getSupabaseProgress,
  saveSupabaseUserProgress,
  saveSupabaseCertificate,
  diagnoseSupabaseSchema,
  SchemaDiagnosis,
  ImportProgress,
  ImportSummary,
  getSupabaseAppliedTools,
  saveSupabaseAppliedTool,
  deleteSupabaseAppliedTool
} from './utils/supabaseService';

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
        text: '¿Qué es Lean y cuál es su enfoque según el material del curso?',
        options: [
          'Un sistema para automatizar la producción con tecnología de punta',
          'Un enfoque sistemático para identificar y eliminar actividades que no agregan valor de los procesos',
          'Un método enfocado en contratar más personal para acelerar los ensambles',
          'Un plan trimestral de ventas para aumentar el catálogo de productos'
        ],
        correctOptionIndex: 1,
        points: 10
      },
      {
        id: 'lb-q2',
        text: '¿Cómo se define "Valor" y "Desperdicio (Muda)" en la filosofía Lean?',
        options: [
          'Valor es todo proceso por el cual el cliente está dispuesto a pagar; Desperdicio es toda actividad que no agrega valor',
          'Valor es el costo total de los materiales; Desperdicio es el desecho de cartón y plásticos en la línea',
          'Valor es la velocidad de las máquinas; Desperdicio es el mantenimiento preventivo',
          'Valor es el espacio del almacén; Desperdicio es el tiempo extra del supervisor'
        ],
        correctOptionIndex: 0,
        points: 10
      },
      {
        id: 'lb-q3',
        text: 'En la historia de Lean, ¿qué aportes clave hicieron Sakichi Toyoda (1896) y Kiichiro Toyoda (1927)?',
        options: [
          'Sakichi introdujo el Mapeo de Flujo de Valor (VSM) y Kiichiro el sistema de Supermercado',
          'Sakichi diseñó los Poka-Yokes y Kiichiro la matriz TIM WOODS',
          'Sakichi introdujo el concepto de Jidoka (autonomatización) y Kiichiro introdujo el concepto Just-In-Time (JIT) con transportadores de cadena',
          'Sakichi creó la nivelación Heijunka y Kiichiro el Try-storming'
        ],
        correctOptionIndex: 2,
        points: 10
      },
      {
        id: 'lb-q4',
        text: '¿Quién es conocido como el Arquitecto del TPS y padre del sistema de control de inventario de Supermercado?',
        options: [
          'Taiichi Ohno',
          'Dr. Shigeo Shingo',
          'Kiichiro Toyoda',
          'Sakichi Toyoda'
        ],
        correctOptionIndex: 0,
        points: 10
      },
      {
        id: 'lb-q5',
        text: '¿Qué conceptos de precisión en manufactura desarrolló el Dr. Shigeo Shingo en la década de 1960?',
        options: [
          'El Justo a Tiempo (JIT) y transportadores de cadena',
          'Los conceptos de Poka-Yoke (a prueba de errores) y SMED (cambio de herramientas en un dígito de minuto)',
          'Las 5S y el tablero Heijunka',
          'La matriz de desperdicios TIM WOODS'
        ],
        correctOptionIndex: 1,
        points: 10
      },
      {
        id: 'lb-q6',
        text: '¿Cuáles son los 5 Principios Lean para guiar la mejora continua?',
        options: [
          'Clasificar, Ordenar, Limpiar, Estandarizar y Mantener',
          'JIT, Jidoka, Heijunka, 5S+1 y VSM',
          'Transporte, Inventario, Movimiento, Espera y Defectos',
          'Valor, Flujo de Valor, Flujo, Pull (Jalar) y Perfección'
        ],
        correctOptionIndex: 3,
        points: 10
      },
      {
        id: 'lb-q7',
        text: 'En el modelo de la Casa Flex Lean Enterprise (FLE), ¿cuáles son los cimientos operativos (base del templo)?',
        options: [
          'JIT y Jidoka',
          'Heijunka y Talento No Utilizado',
          '5S+1, VSM y Supermercado',
          'El cliente final y la gerencia de planta'
        ],
        correctOptionIndex: 2,
        points: 10
      },
      {
        id: 'lb-q8',
        text: 'En la matriz TIM WOODS de desperdicios, ¿qué representan la "W" y la "+1" o "S" final?',
        options: [
          'W representa Espera (Waiting); S representa Talento No Utilizado (Skills)',
          'W representa Desecho (Waste); S representa Seguridad (Safety)',
          'W representa Movimiento de Agua (Water Spider); S representa Velocidad (Speed)',
          'W representa Trabajo (Work); S representa Supervisor'
        ],
        correctOptionIndex: 0,
        points: 10
      },
      {
        id: 'lb-q9',
        text: '¿Qué herramientas representan la base del orden y la radiografía visual de los flujos de material e información?',
        options: [
          'El Try-storming y la nivelación Heijunka',
          'La metodología 5S+1 y el Mapeo de Flujo de Valor (VSM)',
          'El sistema Push y las Small Group Activities (SGA)',
          'La matriz TIM WOODS y el sistema FIFO'
        ],
        correctOptionIndex: 1,
        points: 10
      },
      {
        id: 'lb-q10',
        text: '¿Qué es el Sistema Pull, el Supermercado y las prácticas de ADN Kaizen (Las 3 GEN y Try-storming)?',
        options: [
          'Pull es empujar producción; Supermercado es guardar exceso; 3 GEN es planear en oficina; Try-storming es debatir ideas sin actuar',
          'Pull es nivelar la línea Heijunka; Supermercado es control de sueldos; 3 GEN es clasificar herramientas; Try-storming es reportar scrap',
          'Pull es aumentar velocidad de máquinas; Supermercado es almacén externo; 3 GEN es auditoría mensual; Try-storming es simular en computadora',
          'Pull es jalar según demanda; Supermercado repone según el retiro del cliente; 3 GEN es observar piso, pieza y hechos reales; Try-storming es experimentación física rápida'
        ],
        correctOptionIndex: 3,
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
  textColor: '#0f172a',
  positions: {
    nombreEmpleado: { x: 50, y: 36, fontSize: 42, visible: true },
    numEmpleado: { x: 50, y: 44, fontSize: 18, visible: false },
    nombreCurso: { x: 50, y: 54, fontSize: 36, visible: true },
    fechaCompletado: { x: 50, y: 70, fontSize: 18, visible: true },
    calificacion: { x: 70, y: 70, fontSize: 18, visible: false },
    folio: { x: 50, y: 82, fontSize: 14, visible: true },
  },
  templateName: "Plantilla Estándar",
  templateUploadDate: "De fábrica",
  templateUrl: "Interno",
  useCustomTemplate: false,
};

function normalizeStringForSearch(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function DashboardPage() {
  // ESTADOS DE INTEGRACIÓN CON SUPABASE
  const [supabaseStatus, setSupabaseStatus] = useState<'online' | 'offline'>('offline');
  const [isImportingHC, setIsImportingHC] = useState<boolean>(false);
  const [isImportingReport, setIsImportingReport] = useState<boolean>(false);
  const [schemaDiagnosis, setSchemaDiagnosis] = useState<SchemaDiagnosis[]>([]);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  const [hcData, setHcData] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
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

  // HERRAMIENTAS LEAN Y ROLES LOCAL OVERRIDES
  const [appliedTools, setAppliedTools] = useState<AppliedTool[]>([]);
  const [roleOverrides, setRoleOverrides] = useState<Record<string, 'Admin' | 'User'>>({});

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

  // Forzar tema claro corporativo
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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
        let loadedExams = JSON.parse(savedExams) as Exam[];
        const lbExamIndex = loadedExams.findIndex(e => e.courseId === 'lean-basics-1');
        if (lbExamIndex !== -1 && loadedExams[lbExamIndex].questions.length < 10) {
          loadedExams[lbExamIndex] = defaultExams.find(e => e.courseId === 'lean-basics-1') || defaultExams[0];
          localStorage.setItem('lgb_exams_list', JSON.stringify(loadedExams));
        }
        setExams(loadedExams);
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

      // 7. Cargar herramientas lean aplicadas
      const savedAppliedTools = localStorage.getItem('lgb_applied_tools');
      if (savedAppliedTools) {
        setAppliedTools(JSON.parse(savedAppliedTools));
      }

      // 8. Cargar overrides de roles
      const savedRoleOverrides = localStorage.getItem('lgb_role_overrides');
      if (savedRoleOverrides) {
        setRoleOverrides(JSON.parse(savedRoleOverrides));
      }
    } catch (e) {
      console.error('Error al inicializar bases de datos locales:', e);
    }
  }, []);

  // Carga inicial automática y sincronización de datos con Supabase
  const loadPreloadedData = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      console.log('[LGB App debug] Probando conexión a Supabase...');
      const isConnected = await testSupabaseConnection();
      
      if (isConnected) {
        console.log('[LGB App debug] Supabase conectado.');
        setSupabaseStatus('online');

        // Ejecutar diagnóstico en segundo plano para la UI sin bloquear la carga
        diagnoseSupabaseSchema()
          .then((diagnosis) => {
            setSchemaDiagnosis(diagnosis);
            diagnosis.forEach((d) => {
              if (d.status === 'missing_columns') {
                console.warn(`[LGB App Schema Warning] Se detectaron columnas faltantes en la tabla '${d.table}': ${d.errorDetails}`);
              }
            });
          })
          .catch((diagErr) => {
            console.warn('[LGB App debug] Error al ejecutar diagnóstico de esquema:', diagErr);
          });

        // 1. Cargar cursos de Supabase
        let dbCourses: any[] = [];
        try {
          dbCourses = await getSupabaseCourses();
          if (dbCourses.length === 0) {
            console.log('[LGB App debug] Sembrando cursos predeterminados en Supabase...');
            for (const c of defaultCourses) {
              await saveSupabaseCourse(c);
            }
            dbCourses = await getSupabaseCourses();
          }
          setCourses(dbCourses);
          localStorage.setItem('lgb_courses_list', JSON.stringify(dbCourses));
        } catch (courseErr) {
          console.error('[LGB App debug] Error al cargar cursos de Supabase:', courseErr);
          const savedCourses = localStorage.getItem('lgb_courses_list');
          setCourses(savedCourses ? JSON.parse(savedCourses) : defaultCourses);
        }

        // 2. Cargar exámenes de Supabase
        let dbExams: any[] = [];
        try {
          dbExams = await getSupabaseExams();
          if (dbExams.length === 0) {
            console.log('[LGB App debug] Sembrando exámenes predeterminados en Supabase...');
            for (const e of defaultExams) {
              await saveSupabaseExam(e);
            }
            dbExams = await getSupabaseExams();
          } else {
            const lbExamIndex = dbExams.findIndex((e: any) => e.courseId === 'lean-basics-1');
            if (lbExamIndex !== -1 && dbExams[lbExamIndex].questions.length < 10) {
              console.log('[LGB App debug] Examen de lean-basics-1 en Supabase desactualizado. Actualizando...');
              const updatedExam = defaultExams.find(e => e.courseId === 'lean-basics-1') || defaultExams[0];
              dbExams[lbExamIndex] = updatedExam;
              await saveSupabaseExam(updatedExam);
            }
          }
          setExams(dbExams);
          localStorage.setItem('lgb_exams_list', JSON.stringify(dbExams));
        } catch (examErr) {
          console.error('[LGB App debug] Error al cargar exámenes de Supabase:', examErr);
          const savedExams = localStorage.getItem('lgb_exams_list');
          if (savedExams) {
            let loadedExams = JSON.parse(savedExams) as Exam[];
            const lbExamIndex = loadedExams.findIndex(e => e.courseId === 'lean-basics-1');
            if (lbExamIndex !== -1 && loadedExams[lbExamIndex].questions.length < 10) {
              loadedExams[lbExamIndex] = defaultExams.find(e => e.courseId === 'lean-basics-1') || defaultExams[0];
              localStorage.setItem('lgb_exams_list', JSON.stringify(loadedExams));
            }
            setExams(loadedExams);
          } else {
            setExams(defaultExams);
          }
        }

        // 3. Cargar progreso global de Supabase
        try {
          const dbProgress = await getSupabaseProgress();
          setTrainingState(dbProgress);
          localStorage.setItem('lgb_training_state', JSON.stringify(dbProgress));
        } catch (progressErr) {
          console.error('[LGB App debug] Error al cargar progreso de Supabase:', progressErr);
          const savedTraining = localStorage.getItem('lgb_training_state');
          if (savedTraining) {
            setTrainingState(JSON.parse(savedTraining));
          }
        }

        // 3.5 Cargar herramientas lean aplicadas de Supabase
        try {
          const dbAppliedTools = await getSupabaseAppliedTools();
          setAppliedTools(dbAppliedTools);
          localStorage.setItem('lgb_applied_tools', JSON.stringify(dbAppliedTools));
        } catch (toolsErr) {
          console.error('[LGB App debug] Error al cargar herramientas de Supabase:', toolsErr);
        }

        // 4. Cargar colaboradores de Supabase
        try {
          const dbEmployees = await getSupabaseEmployees();
          if (dbEmployees.length > 0) {
            console.log(`[LGB App debug] Cargados ${dbEmployees.length} colaboradores desde Supabase.`);
            
            // Reconstruir hcData y reportData a partir de los datos de Supabase para alimentar el Dashboard
            const reconstructedHc = dbEmployees.map(emp => ({
              ID: emp.ID,
              Nombre: emp.Nombre,
              Departamento: emp.Departamento,
              Puesto: emp.Puesto || 'Operador DL',
              Manager: emp.Manager || 'N/A',
              TipoPersonal: emp.TipoPersonal || 'DL',
              role: roleOverrides[emp.ID] || emp.role || (emp.ID === '1163146' ? 'Admin' : 'User')
            }));

            const reconstructedReport = dbEmployees.map(emp => ({
              'Employee#': emp.ID,
              Action: emp.Action || ''
            }));

            setHcData(reconstructedHc);
            setReportData(reconstructedReport);
            setIsPreloaded(true);

            const nowStr = new Date().toLocaleString('es-MX');
            setHcFileMetadata({
              name: 'Base de datos Supabase',
              size: 'N/A',
              lastUpdated: nowStr,
              state: 'Cargado de Servidor',
            });
            setReportFileMetadata({
              name: 'Base de datos Supabase',
              size: 'N/A',
              lastUpdated: nowStr,
              state: 'Cargado de Servidor',
            });
          } else {
            // Si Supabase está en blanco, sembrar temporalmente con los Excel estáticos
            console.log('[LGB App debug] Supabase sin empleados. Cargando Excel inicial...');
            await loadFromStaticExcel();
          }
        } catch (employeesErr) {
          console.error('[LGB App debug] Error al cargar colaboradores de Supabase:', employeesErr);
          await loadFromStaticExcel();
        }
      } else {
        throw new Error('Supabase no disponible');
      }
    } catch (err: any) {
      console.warn('[LGB App debug] Supabase desconectado, usando base de datos local y fallbacks Excel.', err.message);
      setSupabaseStatus('offline');
      // Cargar localmente desde Excel
      await loadFromStaticExcel();
    } finally {
      setIsLoading(false);
    }
  };

  // Función interna para leer los Excel locales en modo estático/fallback
  const loadFromStaticExcel = async () => {
    try {
      const hcUrl = getAssetPath('/data/HC B29 2026 Junio.xlsx');
      const reportUrl = getAssetPath('/data/ReportLGB.xlsx');

      // 1. Cargar Headcount Excel
      const resHC = await fetch(hcUrl);
      if (!resHC.ok) {
        throw new Error('No se encontró el archivo de datos requerido.');
      }
      const bufferHC = await resHC.arrayBuffer();
      const hcWorkbook = XLSX.read(bufferHC, { type: 'array' });
      const sheetNameHC = hcWorkbook.SheetNames[1] || hcWorkbook.SheetNames[0];
      const sheetHC = hcWorkbook.Sheets[sheetNameHC];
      const hcRawData = XLSX.utils.sheet_to_json(sheetHC, { range: 1 });

      // 2. Cargar ReportLGB Excel
      const resReport = await fetch(reportUrl);
      if (!resReport.ok) {
        throw new Error('No se encontró el archivo de datos requerido.');
      }
      const bufferReport = await resReport.arrayBuffer();
      const reportWorkbook = XLSX.read(bufferReport, { type: 'array' });
      const sheetNameReport = reportWorkbook.SheetNames[0];
      const sheetReport = reportWorkbook.Sheets[sheetNameReport];
      const reportRawData = XLSX.utils.sheet_to_json(sheetReport);

      // Cargar datos en los estados
      setHcData(hcRawData);
      setReportData(reportRawData);
      setIsPreloaded(true);

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
    } catch (excelErr: any) {
      const userMessage = excelErr.message === 'No se encontró el archivo de datos requerido.'
        ? excelErr.message
        : `No se pudieron cargar los archivos iniciales: ${excelErr.message}`;
      setApiError(userMessage);
      setIsPreloaded(false);
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
  const handleSaveOverride = async (id: string, override: EmployeeOverride) => {
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

    // Sincronizar cambios en Supabase si está en línea
    if (supabaseStatus === 'online') {
      try {
        await updateSupabaseEmployeeDetails(id, {
          department: override.Departamento,
          certification_status: override.Estatus,
          employee_type: override.TipoPersonal
        });

        // Refrescar el estado de headcount local reactivamente
        setHcData(prev => prev.map(emp => {
          if (emp.ID === id) {
            return {
              ...emp,
              Departamento: override.Departamento || emp.Departamento,
              Estatus: override.Estatus || emp.Estatus,
              TipoPersonal: override.TipoPersonal || emp.TipoPersonal
            };
          }
          return emp;
        }));
      } catch (err) {
        console.error('Error al actualizar colaborador en Supabase:', err);
      }
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

  // Importar headcount a la tabla employees en Supabase
  const handleImportHcToSupabase = async () => {
    if (hcData.length === 0) {
      alert('No hay datos de headcount cargados para importar.');
      return;
    }
    setIsImportingHC(true);
    try {
      await importHcEmployees(hcData);
      alert('¡Importación Exitosa! Los registros de headcount han sido importados a la tabla employees en Supabase.');
      
      // Recargar base de datos desde Supabase
      const dbEmployees = await getSupabaseEmployees();
      if (dbEmployees.length > 0) {
        const reconstructedHc = dbEmployees.map(emp => ({
          ID: emp.ID,
          Nombre: emp.Nombre,
          Departamento: emp.Departamento,
          Puesto: emp.Puesto || 'Operador DL',
          Manager: emp.Manager || 'N/A',
          TipoPersonal: emp.TipoPersonal || 'DL',
          role: roleOverrides[emp.ID] || emp.role || (emp.ID === '1163146' ? 'Admin' : 'User')
        }));
        const reconstructedReport = dbEmployees.map(emp => ({
          'Employee#': emp.ID,
          Action: emp.Action || ''
        }));
        setHcData(reconstructedHc);
        setReportData(reconstructedReport);
      }
    } catch (err: any) {
      alert(`Error al importar headcount a Supabase: ${err.message}`);
    } finally {
      setIsImportingHC(false);
    }
  };

  // Importar ReportLGB para actualizar estatus en Supabase
  const handleImportReportLgbToSupabase = async () => {
    if (reportData.length === 0) {
      alert('No hay datos del reporte cargados para actualizar.');
      return;
    }
    setIsImportingReport(true);
    setImportProgress(null);
    setImportSummary(null);
    try {
      const summary = await importReportLgbStatuses(reportData, (progress) => {
        setImportProgress(progress);
      });
      setImportSummary(summary);
      
      // Recargar base de datos desde Supabase
      const dbEmployees = await getSupabaseEmployees();
      if (dbEmployees.length > 0) {
        const reconstructedHc = dbEmployees.map(emp => ({
          ID: emp.ID,
          Nombre: emp.Nombre,
          Departamento: emp.Departamento,
          Puesto: emp.Puesto || 'Operador DL',
          Manager: emp.Manager || 'N/A',
          TipoPersonal: emp.TipoPersonal || 'DL',
          role: roleOverrides[emp.ID] || emp.role || (emp.ID === '1163146' ? 'Admin' : 'User')
        }));
        const reconstructedReport = dbEmployees.map(emp => ({
          'Employee#': emp.ID,
          Action: emp.Action || ''
        }));
        setHcData(reconstructedHc);
        setReportData(reconstructedReport);
      }
    } catch (err: any) {
      alert(`Error al actualizar estatus en Supabase: ${err.message}`);
    } finally {
      setIsImportingReport(false);
    }
  };

  // Actualizar rol de un colaborador
  const handleUpdateEmployeeRole = async (employeeNumber: string, role: 'Admin' | 'User') => {
    const updatedRoleOverrides = {
      ...roleOverrides,
      [employeeNumber]: role
    };
    setRoleOverrides(updatedRoleOverrides);
    localStorage.setItem('lgb_role_overrides', JSON.stringify(updatedRoleOverrides));

    if (supabaseStatus === 'online') {
      try {
        await updateSupabaseEmployeeRole(employeeNumber, role);
      } catch (err: any) {
        console.error(`Error al guardar el rol en Supabase para ${employeeNumber}:`, err.message);
      }
    }

    setHcData(prev => prev.map(emp => {
      if (emp.ID === employeeNumber) {
        return { ...emp, role };
      }
      return emp;
    }));

    if (currentUser && currentUser.ID === employeeNumber) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      setCurrentRole(role as UserRole);
      localStorage.setItem('lgb_logged_in_user', JSON.stringify(updatedUser));
      localStorage.setItem('lgb_logged_in_role', role);
    }
  };

  // Manejadores para registrar/eliminar/revisar herramientas Lean
  const handleSaveAppliedTool = async (tool: Omit<AppliedTool, 'employee_number' | 'status' | 'id'> & { id?: string }) => {
    if (!currentUser) return;
    
    const isNew = !tool.id;
    const toolId = tool.id || `tool-${Math.random().toString(36).substr(2, 9)}`;
    const newTool: AppliedTool = {
      id: toolId,
      employee_number: currentUser.ID,
      tool_name: tool.tool_name,
      custom_tool_name: tool.custom_tool_name,
      application: tool.application,
      result: tool.result,
      comment: tool.comment,
      status: 'Pendiente',
      admin_comment: '',
      created_at: isNew ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    };

    const updatedTools = isNew 
      ? [newTool, ...appliedTools]
      : appliedTools.map(t => t.id === toolId ? { ...t, ...newTool, created_at: t.created_at } : t);

    setAppliedTools(updatedTools);
    localStorage.setItem('lgb_applied_tools', JSON.stringify(updatedTools));

    if (supabaseStatus === 'online') {
      try {
        const existingTool = appliedTools.find(t => t.id === toolId);
        const finalTool = {
          ...newTool,
          created_at: existingTool?.created_at || newTool.created_at
        };
        await saveSupabaseAppliedTool(finalTool);
      } catch (err) {
        console.error('Error al guardar herramienta en Supabase:', err);
      }
    }
  };

  const handleDeleteAppliedTool = async (id: string) => {
    const updatedTools = appliedTools.filter(t => t.id !== id);
    setAppliedTools(updatedTools);
    localStorage.setItem('lgb_applied_tools', JSON.stringify(updatedTools));

    if (supabaseStatus === 'online') {
      try {
        await deleteSupabaseAppliedTool(id);
      } catch (err) {
        console.error('Error al eliminar herramienta en Supabase:', err);
      }
    }
  };

  const handleReviewAppliedTool = async (id: string, status: 'Aprobada' | 'Rechazada', adminComment: string) => {
    const updatedTools = appliedTools.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          admin_comment: adminComment,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });

    setAppliedTools(updatedTools);
    localStorage.setItem('lgb_applied_tools', JSON.stringify(updatedTools));

    if (supabaseStatus === 'online') {
      try {
        const targetTool = updatedTools.find(t => t.id === id);
        if (targetTool) {
          await saveSupabaseAppliedTool(targetTool);
        }
      } catch (err) {
        console.error('Error al evaluar herramienta en Supabase:', err);
        throw err;
      }
    }
  };

  // MANEJADORES DE GUARDADO DE CONFIGURACIONES
  const handleSaveCourses = async (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem('lgb_courses_list', JSON.stringify(newCourses));
    if (supabaseStatus === 'online') {
      try {
        for (const c of newCourses) {
          await saveSupabaseCourse(c);
        }
      } catch (e) {
        console.error('Error al guardar cursos en Supabase:', e);
      }
    }
  };

  const handleSaveExams = async (newExams: Exam[]) => {
    setExams(newExams);
    localStorage.setItem('lgb_exams_list', JSON.stringify(newExams));
    if (supabaseStatus === 'online') {
      try {
        for (const e of newExams) {
          await saveSupabaseExam(e);
        }
      } catch (e) {
        console.error('Error al guardar exámenes en Supabase:', e);
      }
    }
  };

  const handleSaveCertConfig = (newConfig: CertificateConfig) => {
    setCertConfig(newConfig);
    localStorage.setItem('lgb_cert_config', JSON.stringify(newConfig));
  };

  // Actualizar el progreso de un colaborador en particular
  const handleUpdateUserProgress = async (courseId: string, updatedProgress: Partial<UserCourseProgress>) => {
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

    // Guardar progreso en Supabase
    if (supabaseStatus === 'online') {
      try {
        await saveSupabaseUserProgress(currentUser.ID, courseId, newCourseProg);

        // Si aprobó, guardar también el certificado en Supabase
        if (newCourseProg.examPassed && newCourseProg.certificateFolio) {
          const courseName = courses.find(c => c.id === courseId)?.name || courseId;
          const certId = `${currentUser.ID}-${courseId}`;
          await saveSupabaseCertificate(
            certId,
            currentUser.ID,
            courseId,
            courseName,
            newCourseProg.completionDate || new Date().toISOString(),
            newCourseProg.examScore || 0,
            newCourseProg.certificateFolio
          );
        }
      } catch (e) {
        console.error('Error al guardar el progreso en Supabase:', e);
      }
    }

    // Si el usuario actualmente logueado cambia su progreso, refrescar su copia en sesión
    // para que la interfaz (sidebar, perfil, etc.) se redibuje inmediatamente.
    const requiredIds = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];
    const passedAll = requiredIds.every(id => newUserProgMap[id]?.examPassed === true);
    const hasApprovedTool = appliedTools.some(
      tool => tool.employee_number === currentUser.ID && tool.status === 'Aprobada'
    );
    
    if (passedAll && hasApprovedTool && currentUser.Estatus !== 'Certificado') {
      const updatedUser = {
        ...currentUser,
        Estatus: 'Certificado' as LGBStatus,
        Action: 'Complete'
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('lgb_logged_in_user', JSON.stringify(updatedUser));
    } else if ((!passedAll || !hasApprovedTool) && currentUser.Estatus === 'Certificado') {
      const updatedUser = {
        ...currentUser,
        Estatus: 'Potencial' as LGBStatus,
        Action: 'Create Form'
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('lgb_logged_in_user', JSON.stringify(updatedUser));
    }
  };

  // PROCESAMIENTO Y CRUCE DE DATOS INTEGRADO CON ACADEMIA Y HERRAMIENTAS LEAN
  const mergedEmployees = useMemo(() => {
    if (hcData.length === 0) return [];
    
    const baseList = processLgbData(hcData, reportData, overrides);
    const requiredIds = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];

    return baseList.map(emp => {
      const empRole = roleOverrides[emp.ID] || emp.role || (emp.ID === '1163146' ? 'Admin' : 'User');
      const updatedEmp = { ...emp, role: empRole };

      const empProgMap = trainingState[emp.ID] || {};
      const passedAllExams = requiredIds.every(id => empProgMap[id]?.examPassed === true);

      const hasApprovedTool = appliedTools.some(
        tool => tool.employee_number === emp.ID && tool.status === 'Aprobada'
      );

      if (passedAllExams && hasApprovedTool) {
        return {
          ...updatedEmp,
          Estatus: 'Certificado' as LGBStatus,
          Action: 'Complete',
        };
      }

      const startedAnyCourse = requiredIds.some(
        id => empProgMap[id]?.status === 'en-progreso' || empProgMap[id]?.status === 'completado'
      );
      const hasAnyTool = appliedTools.some(tool => tool.employee_number === emp.ID);

      if ((startedAnyCourse || hasAnyTool) && updatedEmp.Estatus !== 'Certificado') {
        return {
          ...updatedEmp,
          Estatus: 'Potencial' as LGBStatus,
          Action: updatedEmp.Action || 'Create Form',
        };
      }

      return updatedEmp;
    });
  }, [hcData, reportData, overrides, trainingState, appliedTools, roleOverrides]);

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
        const term = normalizeStringForSearch(searchTerm);
        return (
          normalizeStringForSearch(emp.ID).includes(term) ||
          normalizeStringForSearch(emp.Nombre).includes(term) ||
          normalizeStringForSearch(emp.Departamento).includes(term) ||
          normalizeStringForSearch(emp.Puesto).includes(term) ||
          normalizeStringForSearch(emp.Manager).includes(term) ||
          normalizeStringForSearch(emp.Estatus).includes(term) ||
          normalizeStringForSearch(emp.Action).includes(term)
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

  // Estadísticas de herramientas aplicadas filtradas por departamento y tipo personal
  const filteredToolStats = useMemo(() => {
    const toolsForStats = appliedTools.filter(tool => {
      const emp = mergedEmployees.find(e => e.ID === tool.employee_number);
      if (!emp) return false;

      if (selectedDept !== 'Todos' && emp.Departamento !== selectedDept) return false;
      if (selectedTipoPersonal !== 'Todos' && emp.TipoPersonal !== selectedTipoPersonal) return false;

      return true;
    });

    return {
      pending: toolsForStats.filter(t => t.status === 'Pendiente').length,
      approved: toolsForStats.filter(t => t.status === 'Aprobada').length,
      rejected: toolsForStats.filter(t => t.status === 'Rechazada').length
    };
  }, [appliedTools, mergedEmployees, selectedDept, selectedTipoPersonal]);

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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-800 transition-colors duration-300">
      
      {/* Barra lateral */}
      <Sidebar
        user={currentUser}
        role={currentRole}
        currentView={currentView}
        onViewChange={(view) => {
          // Seguridad: el usuario general no puede acceder a las áreas de administrador
          if (currentRole !== 'Admin' && view !== 'academia' && view !== 'appliedTools') return;
          setCurrentView(view);
        }}
        onLogout={handleLogout}
      />

      {/* Contenedor de contenido de la derecha */}
      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full min-h-screen">
        
        {/* Banner informativo si Supabase está desconectado */}
        {supabaseStatus === 'offline' && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-bold animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Modo Offline Activo:</p>
              <p className="font-medium text-slate-600 dark:text-[#cbd5e1] mt-0.5">
                La conexión con Supabase no se pudo establecer. Los cambios y progresos se guardarán en tu navegador local (localStorage).
              </p>
            </div>
          </div>
        )}

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
                    <KPISection stats={dashboardKPIs} selectedTipoPersonal={selectedTipoPersonal} toolStats={filteredToolStats} />

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
                      filteredCount={filteredEmployees.length}
                      totalCount={mergedEmployees.length}
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
                supabaseStatus={supabaseStatus}
                onImportHcToSupabase={handleImportHcToSupabase}
                onImportReportLgbToSupabase={handleImportReportLgbToSupabase}
                isImportingHC={isImportingHC}
                isImportingReport={isImportingReport}
                onUpdateEmployeeRole={handleUpdateEmployeeRole}
                schemaDiagnosis={schemaDiagnosis}
                importProgress={importProgress}
                importSummary={importSummary}
                appliedTools={appliedTools}
                onReviewAppliedTool={handleReviewAppliedTool}
              />
            )}

            {currentView === 'appliedTools' && (
              /* EVIDENCIAS DE HERRAMIENTAS LEAN */
              <AppliedToolsView
                user={currentUser}
                appliedTools={appliedTools}
                onSaveAppliedTool={handleSaveAppliedTool}
                onDeleteAppliedTool={handleDeleteAppliedTool}
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

// Types definition for Lean Green Belt Tracker dashboard

export interface Employee {
  ID: string;
  Nombre: string;
  Departamento: string;
  Puesto?: string;
  Manager?: string;
  [key: string]: any; // fallback for other Excel columns
}

export interface LgbRecord {
  'Employee#': string;
  Action: string;
  [key: string]: any;
}

export type LGBStatus = 'Certificado' | 'Potencial' | 'Por Certificar';
export type TipoPersonal = 'IDL' | 'DL';

export interface MergedEmployee {
  ID: string;
  Nombre: string;
  Departamento: string;
  Puesto: string;
  Manager: string;
  Action: string; // Action value from ReportLGB (e.g. 'Complete', 'Create Form', or empty)
  Estatus: LGBStatus;
  TipoPersonal: TipoPersonal; // Clasificación: Direct (DL) o Indirect (IDL)
}

export interface KPIStats {
  totalHeadcount: number;
  certifiedCount: number;
  potentialCount: number;
  pendingCount: number;
  globalPercentage: number;
}

export interface DepartmentSummary {
  Departamento: string;
  totalHC: number;
  certified: number;
  potential: number;
  pending: number;
  percentage: number;
}

// NUEVOS TIPOS PARA LAS MEJORAS DE ADMINISTRACIÓN

export type UserRole = 'General' | 'Admin';

export interface EmployeeOverride {
  Departamento?: string;
  Estatus?: LGBStatus;
  Action?: string;
  TipoPersonal?: TipoPersonal;
}

export type OverrideMap = Record<string, EmployeeOverride>;

export interface FileMetadata {
  name: string;
  lastUpdated: string;
  size: string;
  state: 'Cargado de Servidor' | 'Cargado por Usuario' | 'No Cargado';
}

// TIPOS PARA ACADEMIA LEAN Y PLATAFORMA DE ENTRENAMIENTO

export interface CourseMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'ppt' | 'video' | 'image';
  url: string; // Puede ser base64, Object URL o simulación
  size?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  duration: string;
  order: number;
  materials: CourseMaterial[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

export interface Exam {
  courseId: string;
  minScore: number; // Por defecto 80
  questions: Question[];
}

export interface UserCourseProgress {
  status: 'no-iniciado' | 'en-progreso' | 'completado';
  progress: number; // Porcentaje de 0 a 100
  contentViewed: boolean; // Indica si ha visualizado todo el material
  examAttempts: number;
  examScore: number | null;
  examPassed: boolean;
  completionDate: string | null;
  certificateFolio: string | null;
}

export type UserProgressMap = Record<string, UserCourseProgress>;

// El estado de entrenamiento mapea cada empleado por su ID a sus progresos de cursos
export type TrainingState = Record<string, UserProgressMap>;

export interface TextPosition {
  x: number; // Coordenada X (porcentaje o píxeles)
  y: number; // Coordenada Y (porcentaje o píxeles)
  fontSize: number;
  visible: boolean;
}

export interface CertificateConfig {
  background: string; // Base64 de la imagen o preset predeterminado
  textColor: string;
  positions: {
    nombreEmpleado: TextPosition;
    numEmpleado: TextPosition;
    nombreCurso: TextPosition;
    fechaCompletado: TextPosition;
    calificacion: TextPosition;
    folio: TextPosition;
  };
}


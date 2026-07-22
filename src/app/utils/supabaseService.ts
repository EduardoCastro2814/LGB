/**
 * Servicio de Integración de Supabase para Lean Green Belt Academy.
 * 
 * ==========================================
 * DDL DE SQL RECOMENDADO (Copiar en Supabase SQL Editor):
 * ==========================================
 * 
 * -- 1. Tabla de empleados
 * create table if not exists public.employees (
 *     id uuid default gen_random_uuid() primary key,
 *     employee_number text unique not null,
 *     name text not null,
 *     department text not null,
 *     employee_type text not null, -- 'IDL' | 'DL'
 *     role text not null default 'User', -- 'Admin' | 'User'
 *     certification_status text not null default 'Por Certificar', -- 'Certificado' | 'Potencial' | 'Por Certificar'
 *     created_at timestamptz default now(),
 *     updated_at timestamptz default now()
 * );
 * 
 * -- 2. Tabla de cursos
 * create table if not exists public.courses (
 *     id text primary key,
 *     name text not null,
 *     description text,
 *     duration text,
 *     order_num integer not null default 0,
 *     is_active boolean not null default true,
 *     created_at timestamptz default now()
 * );
 * 
 * -- 3. Tabla de material de curso
 * create table if not exists public.course_content (
 *     id text primary key,
 *     course_id text references public.courses(id) on delete cascade,
 *     name text not null,
 *     type text not null, -- 'pdf' | 'ppt' | 'video' | 'image'
 *     url text not null,
 *     size text,
 *     created_at timestamptz default now()
 * );
 * 
 * -- 4. Tabla de exámenes
 * create table if not exists public.exams (
 *     course_id text primary key references public.courses(id) on delete cascade,
 *     min_score integer not null default 80,
 *     created_at timestamptz default now()
 * );
 * 
 * -- 5. Tabla de preguntas de exámenes
 * create table if not exists public.questions (
 *     id text primary key,
 *     exam_id text references public.exams(course_id) on delete cascade,
 *     text text not null,
 *     options jsonb not null, -- array de strings
 *     correct_option_index integer not null,
 *     points integer not null default 10,
 *     created_at timestamptz default now()
 * );
 * 
 * -- 6. Tabla de progreso de curso
 * create table if not exists public.course_progress (
 *     employee_number text not null references public.employees(employee_number) on delete cascade,
 *     course_id text not null references public.courses(id) on delete cascade,
 *     status text not null default 'no-iniciado', -- 'no-iniciado' | 'en-progreso' | 'completado'
 *     progress integer not null default 0,
 *     content_viewed boolean not null default false,
 *     exam_attempts integer not null default 0,
 *     exam_score integer,
 *     exam_passed boolean not null default false,
 *     completion_date text,
 *     certificate_folio text,
 *     updated_at timestamptz default now(),
 *     primary key (employee_number, course_id)
 * );
 * 
 * -- 7. Tabla de certificados
 * create table if not exists public.certificates (
 *     id text primary key,
 *     employee_number text not null references public.employees(employee_number) on delete cascade,
 *     course_id text not null references public.courses(id) on delete cascade,
 *     course_name text not null,
 *     date_issued text not null,
 *     grade integer not null,
 *     folio text not null,
 *     created_at timestamptz default now()
 * );
 */

import { supabase } from './supabaseClient';
import { 
  MergedEmployee, 
  Course, 
  CourseMaterial, 
  Exam, 
  Question, 
  UserCourseProgress, 
  TrainingState,
  UserProgressMap,
  LGBStatus,
  TipoPersonal
} from '../types';

/**
 * Prueba la conexión básica a Supabase.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('courses').select('id').limit(1);
    if (error) {
      console.warn('[Supabase Connection Warning]', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Connection Error]', err);
    return false;
  }
}

/**
 * Obtiene el headcount unificado de colaboradores de Supabase.
 */
export async function getSupabaseEmployees(): Promise<MergedEmployee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name');
    
  if (error) throw error;
  if (!data) return [];
  
  return data.map((emp: any) => ({
    ID: emp.employee_number,
    Nombre: emp.name,
    Departamento: emp.department,
    Puesto: emp.puesto || 'Operador DL',
    Manager: emp.manager || 'N/A',
    Estatus: emp.certification_status as LGBStatus,
    TipoPersonal: emp.employee_type as TipoPersonal,
    Action: emp.certification_status === 'Certificado' ? 'Complete' : 'Create Form',
    role: emp.role || 'User' // Atributo para control de roles
  }));
}

/**
 * Guarda colaboradores en lote a Supabase (Importador Excel).
 */
export async function importEmployeesToSupabase(employees: MergedEmployee[]): Promise<void> {
  const payload = employees.map(emp => ({
    employee_number: emp.ID,
    name: emp.Nombre,
    department: emp.Departamento,
    employee_type: emp.TipoPersonal || 'DL',
    role: emp.Departamento === 'BE' ? 'Admin' : 'User',
    certification_status: emp.Estatus || 'Por Certificar',
    puesto: emp.Puesto || 'Operador DL',
    manager: emp.Manager || 'N/A',
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('employees')
    .upsert(payload, { onConflict: 'employee_number' });
    
  if (error) throw error;
}

/**
 * Actualiza el rol de acceso de un empleado en Supabase.
 */
export async function updateSupabaseEmployeeRole(employeeNumber: string, role: 'Admin' | 'User'): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('employee_number', employeeNumber);
    
  if (error) throw error;
}

/**
 * Obtiene los cursos con sus respectivos materiales cargados de Supabase.
 */
export async function getSupabaseCourses(): Promise<Course[]> {
  // 1. Cargar cursos
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('order_num');
    
  if (coursesError) throw coursesError;
  if (!coursesData) return [];

  // 2. Cargar materiales
  const { data: contentData, error: contentError } = await supabase
    .from('course_content')
    .select('*');
    
  if (contentError) throw contentError;
  const materials = contentData || [];

  return coursesData.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    duration: c.duration || '',
    order: c.order_num,
    materials: materials
      .filter((m: any) => m.course_id === c.id)
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        type: m.type as 'pdf' | 'ppt' | 'video' | 'image',
        url: m.url,
        size: m.size || ''
      }))
  }));
}

/**
 * Crea o actualiza un curso y sus materiales asociados en Supabase.
 */
export async function saveSupabaseCourse(course: Course): Promise<void> {
  // 1. Guardar curso
  const { error: courseError } = await supabase
    .from('courses')
    .upsert({
      id: course.id,
      name: course.name,
      description: course.description,
      duration: course.duration,
      order_num: course.order,
      is_active: true
    }, { onConflict: 'id' });
    
  if (courseError) throw courseError;

  // 2. Borrar materiales anteriores
  const { error: deleteError } = await supabase
    .from('course_content')
    .delete()
    .eq('course_id', course.id);
    
  if (deleteError) throw deleteError;

  // 3. Insertar nuevos materiales
  if (course.materials && course.materials.length > 0) {
    const materialsPayload = course.materials.map(m => ({
      id: m.id,
      course_id: course.id,
      name: m.name,
      type: m.type,
      url: m.url,
      size: m.size || ''
    }));

    const { error: insertError } = await supabase
      .from('course_content')
      .insert(materialsPayload);
      
    if (insertError) throw insertError;
  }
}

/**
 * Elimina un curso (los materiales se borran en cascada).
 */
export async function deleteSupabaseCourse(courseId: string): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);
    
  if (error) throw error;
}

/**
 * Obtiene los exámenes y sus preguntas asociadas desde Supabase.
 */
export async function getSupabaseExams(): Promise<Exam[]> {
  // 1. Obtener exámenes
  const { data: examsData, error: examsError } = await supabase
    .from('exams')
    .select('*');
    
  if (examsError) throw examsError;
  if (!examsData) return [];

  // 2. Obtener preguntas
  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('*');
    
  if (questionsError) throw questionsError;
  const questions = questionsData || [];

  return examsData.map((e: any) => ({
    courseId: e.course_id,
    minScore: e.min_score,
    questions: questions
      .filter((q: any) => q.exam_id === e.course_id)
      .map((q: any) => ({
        id: q.id,
        text: q.text,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
        correctOptionIndex: q.correct_option_index,
        points: q.points
      }))
  }));
}

/**
 * Guarda un examen y sus preguntas en Supabase.
 */
export async function saveSupabaseExam(exam: Exam): Promise<void> {
  // 1. Guardar examen
  const { error: examError } = await supabase
    .from('exams')
    .upsert({
      course_id: exam.courseId,
      min_score: exam.minScore
    }, { onConflict: 'course_id' });
    
  if (examError) throw examError;

  // 2. Eliminar preguntas anteriores
  const { error: deleteError } = await supabase
    .from('questions')
    .delete()
    .eq('exam_id', exam.courseId);
    
  if (deleteError) throw deleteError;

  // 3. Insertar nuevas preguntas
  if (exam.questions && exam.questions.length > 0) {
    const questionsPayload = exam.questions.map(q => ({
      id: q.id,
      exam_id: exam.courseId,
      text: q.text,
      options: JSON.stringify(q.options),
      correct_option_index: q.correctOptionIndex,
      points: q.points
    }));

    const { error: insertError } = await supabase
      .from('questions')
      .insert(questionsPayload);
      
    if (insertError) throw insertError;
  }
}

/**
 * Obtiene el mapa completo de progreso de entrenamiento de todos los usuarios.
 */
export async function getSupabaseProgress(): Promise<TrainingState> {
  const { data, error } = await supabase
    .from('course_progress')
    .select('*');
    
  if (error) throw error;
  if (!data) return {};

  const trainingState: TrainingState = {};

  data.forEach((p: any) => {
    const empNum = p.employee_number;
    if (!trainingState[empNum]) {
      trainingState[empNum] = {};
    }
    
    trainingState[empNum][p.course_id] = {
      status: p.status as 'no-iniciado' | 'en-progreso' | 'completado',
      progress: p.progress,
      contentViewed: p.content_viewed,
      examAttempts: p.exam_attempts,
      examScore: p.exam_score,
      examPassed: p.exam_passed,
      completionDate: p.completion_date,
      certificateFolio: p.certificate_folio
    };
  });

  return trainingState;
}

/**
 * Guarda o actualiza el progreso de un usuario en un curso.
 */
export async function saveSupabaseUserProgress(
  employeeNumber: string, 
  courseId: string, 
  progress: UserCourseProgress
): Promise<void> {
  const { error } = await supabase
    .from('course_progress')
    .upsert({
      employee_number: employeeNumber,
      course_id: courseId,
      status: progress.status,
      progress: progress.progress,
      content_viewed: progress.contentViewed,
      exam_attempts: progress.examAttempts,
      exam_score: progress.examScore,
      exam_passed: progress.examPassed,
      completion_date: progress.completionDate,
      certificate_folio: progress.certificateFolio,
      updated_at: new Date().toISOString()
    }, { onConflict: 'employee_number,course_id' });
    
  if (error) throw error;
}

/**
 * Guarda un registro de certificado emitido a un colaborador.
 */
export async function saveSupabaseCertificate(
  id: string,
  employeeNumber: string,
  courseId: string,
  courseName: string,
  dateIssued: string,
  grade: number,
  folio: string
): Promise<void> {
  const { error } = await supabase
    .from('certificates')
    .upsert({
      id,
      employee_number: employeeNumber,
      course_id: courseId,
      course_name: courseName,
      date_issued: dateIssued,
      grade,
      folio
    }, { onConflict: 'id' });
    
  if (error) throw error;
}

/**
 * Actualiza los detalles de un empleado (Departamento, Estatus Certificación, Tipo Personal) en Supabase.
 */
export async function updateSupabaseEmployeeDetails(
  employeeNumber: string,
  details: {
    department?: string;
    certification_status?: string;
    employee_type?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .update({
      department: details.department,
      certification_status: details.certification_status,
      employee_type: details.employee_type,
      updated_at: new Date().toISOString()
    })
    .eq('employee_number', employeeNumber);
    
  if (error) throw error;
}

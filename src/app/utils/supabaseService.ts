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

import { supabase } from '../../lib/supabase';
import { normalizeId, normalizeText } from './dataProcessor';
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
  TipoPersonal,
  AppliedTool
} from '../types';

/**
 * Prueba la conexión básica a Supabase.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('courses').select('id').limit(1);
    if (error) {
      console.warn('[Supabase Connection Warning]', error.message);
      // Si la base de datos responde con un código de error de Postgres (ej. tabla o columna no encontrada),
      // significa que pudimos conectarnos correctamente y el servidor respondió.
      if (error.code) {
        console.log('[Supabase Connection debug] Conexión establecida (la base respondió con código):', error.code);
        return true;
      }
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase Connection Error]', err);
    return false;
  }
}

// Caché de existencia de columnas para evitar consultas redundantes
const columnCache: Record<string, Record<string, boolean>> = {};

/**
 * Verifica dinámicamente si una columna existe en una tabla de Supabase.
 */
export async function checkColumnExists(table: string, column: string): Promise<boolean> {
  if (columnCache[table] && columnCache[table][column] !== undefined) {
    return columnCache[table][column];
  }
  
  try {
    const { error } = await supabase.from(table).select(column).limit(1);
    // Si no hay error, o el error no indica que la columna no existe (código 42703), la columna existe
    const exists = !error || error.code !== '42703';
    if (!columnCache[table]) {
      columnCache[table] = {};
    }
    columnCache[table][column] = exists;
    return exists;
  } catch (err) {
    return false;
  }
}

/**
 * Indica si una columna es obligatoria en el esquema de base de datos local / de producción.
 */
function isMandatoryColumn(table: string, column: string): boolean {
  const mandatory: Record<string, string[]> = {
    employees: ['employee_number', 'name', 'department'],
    courses: ['id', 'name'],
    course_content: ['id', 'course_id', 'name', 'type', 'url'],
    exams: ['course_id'],
    questions: ['id', 'exam_id', 'text', 'options', 'correct_option_index'],
    course_progress: ['employee_number', 'course_id'],
    certificates: ['id', 'employee_number', 'course_id', 'course_name', 'date_issued', 'grade', 'folio']
  };
  return mandatory[table]?.includes(column) || false;
}

/**
 * Filtra el payload de escritura para enviar únicamente las columnas que existen en la base de datos de Supabase.
 */
export async function buildSafePayload(table: string, fullPayload: Record<string, any>): Promise<Record<string, any>> {
  const safePayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(fullPayload)) {
    if (value === undefined) continue;
    if (isMandatoryColumn(table, key) || await checkColumnExists(table, key)) {
      safePayload[key] = value;
    } else {
      console.warn(`[LGB App Column Warning] La columna opcional '${key}' no existe en la tabla '${table}'. Se omitirá en la escritura.`);
    }
  }
  return safePayload;
}

/**
 * Obtiene el headcount unificado de colaboradores de Supabase.
 */
export async function getSupabaseEmployees(): Promise<MergedEmployee[]> {
  const dbEmployees: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name')
      .range(from, from + step - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      dbEmployees.push(...data);
      from += step;
      if (data.length < step) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  if (dbEmployees.length > 0) {
    const expectedCols = ['puesto', 'manager', 'employee_type', 'role', 'certification_status'];
    const firstRow = dbEmployees[0];
    expectedCols.forEach(col => {
      if (!(col in firstRow)) {
        console.warn(`[LGB App Column Warning] La columna opcional '${col}' no existe en la tabla 'employees'. Usando valor por defecto.`);
      }
    });
  }
  
  return dbEmployees.map((emp: any) => ({
    ID: emp.employee_number,
    Nombre: emp.name || 'Sin Nombre',
    Departamento: emp.department || 'SIN DEPARTAMENTO',
    Puesto: emp.puesto || 'Operador DL',
    Manager: emp.manager || 'N/A',
    Estatus: (emp.certification_status || 'Por Certificar') as LGBStatus,
    TipoPersonal: (emp.employee_type || 'DL') as TipoPersonal,
    Action: emp.certification_status === 'Certificado' 
      ? 'Complete' 
      : emp.certification_status === 'Potencial' 
        ? 'Create Form' 
        : '',
    role: emp.role || 'User', // Atributo para control de roles
    updated_at: emp.updated_at
  }));
}

/**
 * Importa empleados desde los datos crudos del Excel de Headcount (HC B29 2026 Junio.xlsx).
 * Asigna 'Por Certificar' como estatus inicial de certificación.
 */
export async function importHcEmployees(hcRawData: any[]): Promise<void> {
  // 1. Obtener estatus de certificación de los empleados existentes para no sobrescribirlos
  const dbEmployees: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: chunk, error: fetchError } = await supabase
      .from('employees')
      .select('employee_number, certification_status')
      .range(from, from + step - 1);

    if (fetchError) {
      console.error('Error al consultar empleados existentes para importación HC:', fetchError.message);
      break;
    }

    if (chunk && chunk.length > 0) {
      dbEmployees.push(...chunk);
      from += step;
      if (chunk.length < step) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  const existingStatusMap = new Map<string, string>();
  dbEmployees.forEach((e: any) => {
    const normId = normalizeId(e.employee_number);
    if (normId) {
      existingStatusMap.set(normId, e.certification_status || 'Por Certificar');
    }
  });

  const nameKeys = ['Employee Name', 'Full Name', 'Nombre Completo', 'Nombre', 'Name', 'Empleado'];
  const payload: any[] = [];

  let dlCount = 0;
  let idlCount = 0;

  hcRawData.forEach(row => {
    const idVal = row['ID'] || row['Empleado#'] || row['Numero'];
    const empNo = normalizeId(idVal);
    if (!empNo) return;

    let nombreVal = '';
    for (const key of nameKeys) {
      if (row[key] !== undefined && row[key] !== null) {
        nombreVal = normalizeText(row[key]);
        if (nombreVal !== '') break;
      }
    }
    const name = nombreVal || 'Sin Nombre';
    const department = normalizeText(row['Departamento'] || row['Dept'] || row['Area'] || 'SIN DEPARTAMENTO');
    const puesto = normalizeText(row['Puesto'] || row['Puesto/Posición'] || row['Job Title'] || 'Puesto General');
    const manager = normalizeText(row['Manager N1'] || row['Manager'] || row['Supervisor'] || 'Sin Supervisor');

    // Mapear Clasificación de forma robusta
    const clasifVal = row['Clasificación'] || row['Clasificacion'] || row['Tipo Personal'] || row['TipoPersonal'] || 'Direct';
    const clasif = normalizeText(clasifVal).trim().toUpperCase();
    const employee_type = (clasif.includes('INDIRECT') || clasif.includes('IDL')) ? 'IDL' : 'DL';

    if (employee_type === 'DL') {
      dlCount++;
    } else {
      idlCount++;
    }

    // Conservar estatus existente en base de datos si existe, de lo contrario 'Por Certificar'
    const currentStatus = existingStatusMap.get(empNo) || 'Por Certificar';

    payload.push({
      employee_number: empNo,
      name,
      department,
      employee_type,
      role: empNo === '1163146' ? 'Admin' : 'User',
      puesto,
      manager,
      certification_status: currentStatus,
      updated_at: new Date().toISOString()
    });
  });

  if (payload.length === 0) return;

  const safePayloads = await Promise.all(
    payload.map(item => buildSafePayload('employees', item))
  );

  const { error } = await supabase
    .from('employees')
    .upsert(safePayloads, { onConflict: 'employee_number' });

  if (error) throw error;

  // LOGS DE VALIDACIÓN FINAL EN CONSOLA (Como fue solicitado por el usuario)
  console.log('=== LOGS DE DEPURACIÓN IMPORTACIÓN HC ===');
  console.log(`DL encontrados: ${dlCount}`);
  console.log(`IDL encontrados: ${idlCount}`);
  console.log(`Total HC: ${dlCount + idlCount}`);
  console.log('========================================');
}

export interface ImportProgress {
  total: number;
  processed: number;
  pending: number;
  percentage: number;
}

export interface ImportSummary {
  empleadosHcProcesados: number;
  registrosReportLgbProcesados: number;
  matchesEncontrados: number;
  certificadosActualizados: number;
  potencialesActualizados: number;
  sinCoincidencia: number;
  primerosVeinteSinMatch: string[];
  totalUpdatesExitosos: number;
  totalUpdatesFallidos: number;
}

/**
 * Lee el archivo de certificaciones (ReportLGB.xlsx) y actualiza el estatus de certificación
 * de los empleados existentes en Supabase por lotes (batch) para optimizar recursos.
 */
export async function importReportLgbStatuses(
  reportRawData: any[],
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    empleadosHcProcesados: 0,
    registrosReportLgbProcesados: reportRawData.length,
    matchesEncontrados: 0,
    certificadosActualizados: 0,
    potencialesActualizados: 0,
    sinCoincidencia: 0,
    primerosVeinteSinMatch: [],
    totalUpdatesExitosos: 0,
    totalUpdatesFallidos: 0
  };

  if (reportRawData.length === 0) {
    return summary;
  }

  // 1. Obtener todos los colaboradores de Supabase con paginación secuencial (evitando el límite de 1000 de PostgREST)
  const dbEmployees: any[] = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: chunk, error: fetchError } = await supabase
      .from('employees')
      .select('employee_number, name, department, puesto, manager, employee_type, role, certification_status')
      .range(from, from + step - 1);

    if (fetchError) {
      throw new Error(`Error al validar colaboradores existentes: ${fetchError.message}`);
    }

    if (chunk && chunk.length > 0) {
      dbEmployees.push(...chunk);
      from += step;
      if (chunk.length < step) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  summary.empleadosHcProcesados = dbEmployees.length;

  // Mapa de número de empleado -> objeto completo del colaborador
  const dbEmpMap = new Map<string, any>();
  dbEmployees.forEach((e: any) => {
    const normId = normalizeId(e.employee_number);
    if (normId) {
      dbEmpMap.set(normId, e);
    }
  });

  // Set de IDs de base de datos para identificar cuáles no coincidieron
  const unmatchedDbIds = new Set<string>(dbEmpMap.keys());
  const updatePayloads: any[] = [];
  const noMatchList: string[] = [];

  // Contadores para tipos de Action encontrados
  let countComplete = 0;
  let countCompleteResigned = 0;
  let countCreateForm = 0;
  let countOtherAction = 0;

  // 2. Procesar registros de ReportLGB y realizar cruces
  for (const row of reportRawData) {
    // Buscar la columna de ID insensible a mayúsculas/minúsculas
    let rawIdVal: any = null;
    const rowKeys = Object.keys(row);
    const targetKeys = ['employee#', 'employee', 'id', 'numemp', 'empleado#', 'empleado', 'numero'];
    for (const k of rowKeys) {
      if (targetKeys.includes(k.toLowerCase().trim())) {
        rawIdVal = row[k];
        break;
      }
    }

    const empNo = normalizeId(rawIdVal);
    const actionVal = row['Action'] || row['action'] || row['Status'] || row['status'] || '';
    const actionNormalized = String(actionVal).trim().toUpperCase();

    if (!empNo || !dbEmpMap.has(empNo)) {
      const nombreVal = row['Nombre'] || row['nombre'] || row['Name'] || row['name'] || 'Sin Nombre';
      const displayId = empNo || 'S/N';
      noMatchList.push(`${nombreVal} (${displayId})`);
      continue;
    }

    summary.matchesEncontrados++;
    unmatchedDbIds.delete(empNo); // Marcado como encontrado

    // Incrementar contadores correspondientes
    if (actionNormalized === 'COMPLETE') {
      countComplete++;
    } else if (actionNormalized === 'COMPLETE/RESIGNED') {
      countCompleteResigned++;
    } else if (actionNormalized === 'CREATE FORM') {
      countCreateForm++;
    } else {
      countOtherAction++;
    }

    let status: LGBStatus = 'Por Certificar';
    if (actionNormalized === 'COMPLETE' || actionNormalized === 'COMPLETE/RESIGNED') {
      status = 'Certificado';
      summary.certificadosActualizados++;
    } else if (actionNormalized === 'CREATE FORM') {
      status = 'Potencial';
      summary.potencialesActualizados++;
    }

    const existingEmp = dbEmpMap.get(empNo);
    const currentStatus = existingEmp.certification_status || 'Por Certificar';

    // Si ya es Certificado, no sobrescribir bajo ninguna circunstancia (permanece Certificado)
    if (currentStatus === 'Certificado') {
      console.log(`MATCH ENCONTRADO (PROTEGIDO):
Employee#: ${empNo}
Action original: ${actionVal}
Action normalizada: ${actionNormalized}
Estado asignado: Certificado (Protegido - No se sobrescribe)`);
      continue;
    }

    // LOG DE MATCH ENCONTRADO EN CONSOLA (Como fue solicitado por el usuario)
    console.log(`MATCH ENCONTRADO:
Employee#: ${empNo}
Action original: ${actionVal}
Action normalizada: ${actionNormalized}
Estado asignado: ${status}`);

    if (currentStatus !== status) {
      // Importante: incluir campos NOT NULL para que Postgres no falle en el INSERT del UPSERT
      const payload = await buildSafePayload('employees', {
        employee_number: empNo,
        name: existingEmp.name,
        department: existingEmp.department,
        puesto: existingEmp.puesto,
        manager: existingEmp.manager,
        employee_type: existingEmp.employee_type,
        role: existingEmp.role,
        certification_status: status,
        updated_at: new Date().toISOString()
      });
      updatePayloads.push(payload);
    }
  }

  // 3. Resetear a 'Por Certificar' a los colaboradores sin coincidencia en el reporte
  summary.sinCoincidencia = unmatchedDbIds.size;
  for (const empNo of unmatchedDbIds) {
    const existingEmp = dbEmpMap.get(empNo);
    const currentStatus = existingEmp.certification_status || 'Por Certificar';
    
    // Si ya es Certificado, no sobrescribir bajo ninguna circunstancia (permanece Certificado)
    if (currentStatus === 'Certificado') {
      continue;
    }
    
    if (currentStatus !== 'Por Certificar') {
      console.log(`SIN MATCH (RESET):
Employee#: ${empNo}
Action encontrada: N/A
Estatus anterior: ${currentStatus}
Estatus nuevo: Por Certificar`);

      const payload = await buildSafePayload('employees', {
        employee_number: empNo,
        name: existingEmp.name,
        department: existingEmp.department,
        puesto: existingEmp.puesto,
        manager: existingEmp.manager,
        employee_type: existingEmp.employee_type,
        role: existingEmp.role,
        certification_status: 'Por Certificar',
        updated_at: new Date().toISOString()
      });
      updatePayloads.push(payload);
    }
  }

  summary.primerosVeinteSinMatch = noMatchList.slice(0, 20);

  // 4. Actualizar por lotes de 50
  const totalToUpdate = updatePayloads.length;
  let processed = 0;

  if (onProgress) {
    onProgress({
      total: totalToUpdate,
      processed: 0,
      pending: totalToUpdate,
      percentage: 0
    });
  }

  const BATCH_SIZE = 50;
  for (let i = 0; i < totalToUpdate; i += BATCH_SIZE) {
    const batch = updatePayloads.slice(i, i + BATCH_SIZE);
    try {
      const { error: upsertError } = await supabase
        .from('employees')
        .upsert(batch, { onConflict: 'employee_number' });

      if (upsertError) {
        console.error(`[Supabase Import Batch Error] Error en lote iniciando en índice ${i}:`, upsertError.message);
        // Fallback individual si el lote falla
        for (const item of batch) {
          try {
            // Intentar actualizar usando UPDATE directo para el campo específico
            const { error: singleError } = await supabase
              .from('employees')
              .update({
                certification_status: item.certification_status,
                updated_at: item.updated_at
              })
              .eq('employee_number', item.employee_number);

            if (singleError) {
              console.warn(`[Supabase Import Record Error] Colaborador ${item.employee_number}:`, singleError.message);
              summary.totalUpdatesFallidos++;
            } else {
              summary.totalUpdatesExitosos++;
            }
          } catch (singleExc: any) {
            console.error(`[Supabase Import Record Exception] Colaborador ${item.employee_number}:`, singleExc.message);
            summary.totalUpdatesFallidos++;
          }
        }
      } else {
        summary.totalUpdatesExitosos += batch.length;
      }
    } catch (batchExc: any) {
      console.error(`[Supabase Import Batch Exception] Excepción en lote en índice ${i}:`, batchExc.message);
      for (const item of batch) {
        try {
          const { error: singleError } = await supabase
            .from('employees')
            .update({
              certification_status: item.certification_status,
              updated_at: item.updated_at
            })
            .eq('employee_number', item.employee_number);
          if (singleError) {
            summary.totalUpdatesFallidos++;
          } else {
            summary.totalUpdatesExitosos++;
          }
        } catch (singleExc) {
          summary.totalUpdatesFallidos++;
        }
      }
    }

    processed += batch.length;
    const pending = totalToUpdate - processed;
    if (onProgress) {
      onProgress({
        total: totalToUpdate,
        processed: processed,
        pending: pending,
        percentage: Math.round((processed / totalToUpdate) * 100)
      });
    }

    if (i + BATCH_SIZE < totalToUpdate) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  // 5. Obtener los conteos finales reales desde la base de datos para los logs de depuración (paginando)
  const finalDbEmployees: any[] = [];
  let finalFrom = 0;
  let finalHasMore = true;

  while (finalHasMore) {
    const { data: chunk, error: chunkErr } = await supabase
      .from('employees')
      .select('certification_status')
      .range(finalFrom, finalFrom + step - 1);

    if (chunkErr) {
      console.error('Error al realizar conteo final de verificación:', chunkErr.message);
      break;
    }

    if (chunk && chunk.length > 0) {
      finalDbEmployees.push(...chunk);
      finalFrom += step;
      if (chunk.length < step) {
        finalHasMore = false;
      }
    } else {
      finalHasMore = false;
    }
  }

  let countCertificados = 0;
  let countPotenciales = 0;
  let countPorCertificar = 0;

  finalDbEmployees.forEach((e: any) => {
    if (e.certification_status === 'Certificado') {
      countCertificados++;
    } else if (e.certification_status === 'Potencial') {
      countPotenciales++;
    } else {
      countPorCertificar++;
    }
  });

  const finalTotal = countCertificados + countPotenciales + countPorCertificar;
  const validationMatches = finalTotal === summary.empleadosHcProcesados;

  // LOGS DETALLADOS DE DEPURACIÓN EN CONSOLA (Como fue solicitado por el usuario)
  console.log('=== LOGS DE DEPURACIÓN IMPORTACIÓN REPORTLGB ===');
  console.log(`Total HC: ${summary.empleadosHcProcesados}`);
  console.log(`Total ReportLGB: ${summary.registrosReportLgbProcesados}`);
  console.log(`Matches: ${summary.matchesEncontrados}`);
  console.log(`Sin Match: ${noMatchList.length}`);
  console.log(`Certificados: ${countCertificados}`);
  console.log(`Potenciales: ${countPotenciales}`);
  console.log(`Por Certificar: ${countPorCertificar}`);
  console.log(`Suma Coincide con HC Total (100% de la base de datos): ${validationMatches ? 'SÍ' : 'NO'} (Suma: ${finalTotal} vs Total: ${summary.empleadosHcProcesados})`);
  console.log(`Complete encontrados: ${countComplete}`);
  console.log(`Complete/Resigned encontrados: ${countCompleteResigned}`);
  console.log(`Create Form encontrados: ${countCreateForm}`);
  console.log(`Sin match (Excel): ${noMatchList.length}`);
  console.log(`Total Updates Exitosos: ${summary.totalUpdatesExitosos}`);
  console.log(`Total Updates Fallidos: ${summary.totalUpdatesFallidos}`);
  console.log('Primeros 20 sin match:', summary.primerosVeinteSinMatch);
  console.log('================================================');

  return summary;
}

/**
 * Actualiza el rol de acceso de un empleado en Supabase.
 */
export async function updateSupabaseEmployeeRole(employeeNumber: string, role: 'Admin' | 'User'): Promise<void> {
  const payload = await buildSafePayload('employees', { role, updated_at: new Date().toISOString() });
  const { error } = await supabase
    .from('employees')
    .update(payload)
    .eq('employee_number', employeeNumber);
    
  if (error) throw error;
}

/**
 * Obtiene los cursos con sus respectivos materiales cargados de Supabase.
 */
export async function getSupabaseCourses(): Promise<Course[]> {
  // 1. Cargar cursos (sin filtros ni ordenación en BD para evitar fallos si faltan columnas opcionales)
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('*');
    
  if (coursesError) throw coursesError;
  let rawCourses = coursesData || [];

  if (rawCourses.length > 0) {
    const expectedCols = ['description', 'duration', 'order_num', 'is_active'];
    const firstRow = rawCourses[0];
    expectedCols.forEach(col => {
      if (!(col in firstRow)) {
        console.warn(`[LGB App Column Warning] La columna opcional '${col}' no existe en la tabla 'courses'. Usando valor por defecto.`);
      }
    });

    // Filtrado en memoria si existe la columna is_active
    if ('is_active' in firstRow) {
      rawCourses = rawCourses.filter((c: any) => c.is_active !== false);
    }
    // Ordenamiento en memoria si existe la columna order_num
    if ('order_num' in firstRow) {
      rawCourses.sort((a: any, b: any) => (a.order_num || 0) - (b.order_num || 0));
    }
  }

  // 2. Cargar materiales
  const { data: contentData, error: contentError } = await supabase
    .from('course_content')
    .select('*');
    
  if (contentError) throw contentError;
  const materials = contentData || [];

  if (materials.length > 0) {
    const expectedCols = ['size'];
    const firstRow = materials[0];
    expectedCols.forEach(col => {
      if (!(col in firstRow)) {
        console.warn(`[LGB App Column Warning] La columna opcional '${col}' no existe en la tabla 'course_content'. Usando valor por defecto.`);
      }
    });
  }

  return rawCourses.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    duration: c.duration || '',
    order: c.order_num !== undefined ? c.order_num : 0,
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
  const coursePayload = await buildSafePayload('courses', {
    id: course.id,
    name: course.name,
    description: course.description,
    duration: course.duration,
    order_num: course.order,
    is_active: true
  });

  const { error: courseError } = await supabase
    .from('courses')
    .upsert(coursePayload, { onConflict: 'id' });
    
  if (courseError) throw courseError;

  // 2. Borrar materiales anteriores
  const { error: deleteError } = await supabase
    .from('course_content')
    .delete()
    .eq('course_id', course.id);
    
  if (deleteError) throw deleteError;

  // 3. Insertar nuevos materiales
  if (course.materials && course.materials.length > 0) {
    const materialsPayloads = await Promise.all(
      course.materials.map(m => buildSafePayload('course_content', {
        id: m.id,
        course_id: course.id,
        name: m.name,
        type: m.type,
        url: m.url,
        size: m.size || ''
      }))
    );

    const { error: insertError } = await supabase
      .from('course_content')
      .insert(materialsPayloads);
      
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

  if (examsData.length > 0) {
    const expectedCols = ['min_score'];
    const firstRow = examsData[0];
    expectedCols.forEach(col => {
      if (!(col in firstRow)) {
        console.warn(`[LGB App Column Warning] La columna opcional '${col}' no existe en la tabla 'exams'. Usando valor por defecto.`);
      }
    });
  }

  if (questions.length > 0) {
    const expectedCols = ['points'];
    const firstRow = questions[0];
    expectedCols.forEach(col => {
      if (!(col in firstRow)) {
        console.warn(`[LGB App Column Warning] La columna opcional '${col}' no existe en la tabla 'questions'. Usando valor por defecto.`);
      }
    });
  }

  return examsData.map((e: any) => ({
    courseId: e.course_id,
    minScore: e.min_score !== undefined ? e.min_score : 80,
    questions: questions
      .filter((q: any) => q.exam_id === e.course_id)
      .map((q: any) => ({
        id: q.id,
        text: q.text,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
        correctOptionIndex: q.correct_option_index,
        points: q.points !== undefined ? q.points : 10
      }))
  }));
}

/**
 * Guarda un examen y sus preguntas en Supabase.
 */
export async function saveSupabaseExam(exam: Exam): Promise<void> {
  // 1. Guardar examen
  const examPayload = await buildSafePayload('exams', {
    course_id: exam.courseId,
    min_score: exam.minScore
  });

  const { error: examError } = await supabase
    .from('exams')
    .upsert(examPayload, { onConflict: 'course_id' });
    
  if (examError) throw examError;

  // 2. Eliminar preguntas anteriores
  const { error: deleteError } = await supabase
    .from('questions')
    .delete()
    .eq('exam_id', exam.courseId);
    
  if (deleteError) throw deleteError;

  // 3. Insertar nuevas preguntas
  if (exam.questions && exam.questions.length > 0) {
    const questionsPayloads = await Promise.all(
      exam.questions.map(q => buildSafePayload('questions', {
        id: q.id,
        exam_id: exam.courseId,
        text: q.text,
        options: JSON.stringify(q.options),
        correct_option_index: q.correctOptionIndex,
        points: q.points
      }))
    );

    const { error: insertError } = await supabase
      .from('questions')
      .insert(questionsPayloads);
      
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

  if (data.length > 0) {
    const expectedCols = [
      'status', 'progress', 'content_viewed', 'exam_attempts', 
      'exam_score', 'exam_passed', 'completion_date', 'certificate_folio'
    ];
    const firstRow = data[0];
    expectedCols.forEach(col => {
      if (!(col in firstRow)) {
        console.warn(`[LGB App Column Warning] La columna opcional '${col}' no existe en la tabla 'course_progress'. Usando valor por defecto.`);
      }
    });
  }

  const trainingState: TrainingState = {};

  data.forEach((p: any) => {
    const empNum = p.employee_number;
    if (!empNum) return;
    if (!trainingState[empNum]) {
      trainingState[empNum] = {};
    }
    
    trainingState[empNum][p.course_id] = {
      status: (p.status || 'no-iniciado') as 'no-iniciado' | 'en-progreso' | 'completado',
      progress: p.progress !== undefined ? p.progress : 0,
      contentViewed: p.content_viewed !== undefined ? p.content_viewed : false,
      examAttempts: p.exam_attempts !== undefined ? p.exam_attempts : 0,
      examScore: p.exam_score !== undefined ? p.exam_score : null,
      examPassed: p.exam_passed !== undefined ? p.exam_passed : false,
      completionDate: p.completion_date || null,
      certificateFolio: p.certificate_folio || null
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
  const payload = await buildSafePayload('course_progress', {
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
  });

  const { error } = await supabase
    .from('course_progress')
    .upsert(payload, { onConflict: 'employee_number,course_id' });
    
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
  const payload = await buildSafePayload('certificates', {
    id,
    employee_number: employeeNumber,
    course_id: courseId,
    course_name: courseName,
    date_issued: dateIssued,
    grade,
    folio
  });

  const { error } = await supabase
    .from('certificates')
    .upsert(payload, { onConflict: 'id' });
    
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
  const payload = await buildSafePayload('employees', {
    department: details.department,
    certification_status: details.certification_status,
    employee_type: details.employee_type,
    updated_at: new Date().toISOString()
  });

  const { error } = await supabase
    .from('employees')
    .update(payload)
    .eq('employee_number', employeeNumber);
    
  if (error) throw error;
}

export interface SchemaDiagnosis {
  table: string;
  status: 'ok' | 'missing_table' | 'missing_columns' | 'unreachable';
  errorDetails?: string;
}

/**
 * Diagnostica si las tablas o columnas requeridas por el código existen en Supabase.
 */
export async function diagnoseSupabaseSchema(): Promise<SchemaDiagnosis[]> {
  const diagnosis: SchemaDiagnosis[] = [];

  const checks = [
    {
      table: 'employees',
      query: () => supabase.from('employees').select('employee_number, name, department, puesto, manager, employee_type, role, certification_status').limit(1)
    },
    {
      table: 'roles',
      query: () => supabase.from('roles').select('name, description').limit(1)
    },
    {
      table: 'courses',
      query: () => supabase.from('courses').select('id, name, description, duration, order_num, is_active').limit(1)
    },
    {
      table: 'course_content',
      query: () => supabase.from('course_content').select('id, course_id, name, type, url, size').limit(1)
    },
    {
      table: 'exams',
      query: () => supabase.from('exams').select('course_id, min_score').limit(1)
    },
    {
      table: 'questions',
      query: () => supabase.from('questions').select('id, exam_id, text, options, correct_option_index, points').limit(1)
    },
    {
      table: 'course_progress',
      query: () => supabase.from('course_progress').select('employee_number, course_id, status, progress, content_viewed, exam_attempts, exam_score, exam_passed, completion_date, certificate_folio').limit(1)
    },
    {
      table: 'certificates',
      query: () => supabase.from('certificates').select('id, employee_number, course_id, course_name, date_issued, grade, folio').limit(1)
    },
    {
      table: 'applied_tools',
      query: () => supabase.from('applied_tools').select('id, employee_number, tool_name, custom_tool_name, application, result, comment, status, admin_comment').limit(1)
    }
  ];

  for (const check of checks) {
    try {
      const { error } = await check.query();
      if (!error) {
        diagnosis.push({ table: check.table, status: 'ok' });
      } else {
        const code = error.code;
        // Postgres error code 42P01: undefined_table
        // Postgres error code 42703: undefined_column
        if (code === '42P01') {
          diagnosis.push({
            table: check.table,
            status: 'missing_table',
            errorDetails: `Falta tabla: La tabla '${check.table}' no existe.`
          });
        } else if (code === '42703') {
          diagnosis.push({
            table: check.table,
            status: 'missing_columns',
            errorDetails: `Falta columna: ${error.message}`
          });
        } else {
          diagnosis.push({
            table: check.table,
            status: 'unreachable',
            errorDetails: `Error de consulta (${code}): ${error.message}`
          });
        }
      }
    } catch (err: any) {
      diagnosis.push({
        table: check.table,
        status: 'unreachable',
        errorDetails: err.message || 'Excepción al consultar'
      });
    }
  }

  return diagnosis;
}

/**
 * Obtiene todas las herramientas Lean aplicadas desde Supabase.
 */
export async function getSupabaseAppliedTools(): Promise<AppliedTool[]> {
  const { data, error } = await supabase
    .from('applied_tools')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.warn('[Supabase getSupabaseAppliedTools warning]', error.message);
    throw error;
  }
  return (data || []).map((t: any) => ({
    id: t.id,
    employee_number: t.employee_number,
    tool_name: t.tool_name,
    custom_tool_name: t.custom_tool_name || '',
    application: t.application,
    result: t.result,
    comment: t.comment,
    status: t.status as 'Pendiente' | 'Aprobada' | 'Rechazada',
    admin_comment: t.admin_comment || '',
    created_at: t.created_at,
    updated_at: t.updated_at
  }));
}

/**
 * Guarda o actualiza una herramienta Lean aplicada en Supabase.
 */
export async function saveSupabaseAppliedTool(tool: AppliedTool): Promise<void> {
  const payload = await buildSafePayload('applied_tools', {
    id: tool.id,
    employee_number: tool.employee_number,
    tool_name: tool.tool_name,
    custom_tool_name: tool.custom_tool_name || null,
    application: tool.application,
    result: tool.result,
    comment: tool.comment,
    status: tool.status,
    admin_comment: tool.admin_comment || null,
    updated_at: new Date().toISOString()
  });

  const { error } = await supabase
    .from('applied_tools')
    .upsert(payload, { onConflict: 'id' });
    
  if (error) throw error;
}

/**
 * Elimina una herramienta Lean aplicada en Supabase.
 */
export async function deleteSupabaseAppliedTool(id: string): Promise<void> {
  const { error } = await supabase
    .from('applied_tools')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}


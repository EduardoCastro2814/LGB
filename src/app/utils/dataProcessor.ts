import { Employee, LgbRecord, MergedEmployee, KPIStats, DepartmentSummary, LGBStatus, OverrideMap, TipoPersonal } from '../types';

/**
 * Normaliza un ID de empleado para realizar la unión (match).
 * Elimina espacios y ceros iniciales.
 */
export function normalizeId(id: string | number | null | undefined): string {
  if (id === null || id === undefined) return '';
  const str = String(id).trim();
  const normalized = str.replace(/^0+/, '');
  return normalized === '' ? '0' : normalized;
}

/**
 * Normaliza textos (ej. nombres de departamentos o acciones) eliminando espacios
 * y manejando nulos.
 */
export function normalizeText(text: string | null | undefined): string {
  if (text === null || text === undefined) return '';
  return String(text).trim();
}

/**
 * Cruza y clasifica la información de Headcount con el reporte de LGB,
 * aplicando también cualquier modificación manual del administrador.
 */
export function processLgbData(
  hcRows: any[], 
  reportRows: any[], 
  overrides: OverrideMap = {}
): MergedEmployee[] {
  // Crear un mapa de las acciones del reporte LGB indexado por ID normalizado
  const reportMap = new Map<string, string>();
  
  reportRows.forEach((row) => {
    // Buscar la columna correspondiente a ID en el reporte (Employee#)
    const empNo = row['Employee#'] || row['Employee'] || row['ID'] || row['NumEmp'];
    if (empNo !== undefined && empNo !== null) {
      const normEmpNo = normalizeId(empNo);
      const action = normalizeText(row['Action']);
      if (normEmpNo) {
        reportMap.set(normEmpNo, action);
      }
    }
  });

  const mergedList: MergedEmployee[] = [];
  const seenIds = new Set<string>();

  // Lista priorizada de nombres de columna para buscar el nombre del colaborador
  const nameKeys = ['Employee Name', 'Full Name', 'Nombre Completo', 'Nombre', 'Name', 'Empleado'];

  hcRows.forEach((row) => {
    // Columnas comunes para ID
    const idVal = row['ID'] || row['Empleado#'] || row['Numero'];
    if (idVal === undefined || idVal === null) return;

    const normId = normalizeId(idVal);
    if (!normId) return;

    // Evitar duplicados en Headcount
    if (seenIds.has(normId)) return;
    seenIds.add(normId);

    // Detección automática del nombre del colaborador en base a lista de posibles columnas
    let nombreVal = '';
    for (const key of nameKeys) {
      if (row[key] !== undefined && row[key] !== null) {
        nombreVal = normalizeText(row[key]);
        if (nombreVal !== '') break;
      }
    }
    const nombre = nombreVal || 'Sin Nombre';

    let departamento = normalizeText(row['Departamento'] || row['Dept'] || row['Area'] || 'SIN DEPARTAMENTO');
    const puesto = normalizeText(row['Puesto'] || row['Puesto/Posición'] || row['Job Title'] || 'Puesto General');
    const manager = normalizeText(row['Manager N1'] || row['Manager'] || row['Supervisor'] || 'Sin Supervisor');

    // Detección de Tipo de Personal (IDL vs DL) basándose en la columna Clasificación
    const clasif = normalizeText(row['Clasificación'] || row['Clasificacion'] || row['Tipo Personal'] || 'Direct');
    let tipoPersonal: TipoPersonal = 'DL';
    if (clasif.toLowerCase().includes('indirect') || clasif.toLowerCase() === 'idl') {
      tipoPersonal = 'IDL';
    } else {
      tipoPersonal = 'DL';
    }

    // Buscar acción en el mapa de LGB
    let action = reportMap.get(normId) || '';

    // Clasificación de Estatus inicial según reglas de negocio
    let estatus: LGBStatus = 'Por Certificar';
    const cleanAction = action.toLowerCase();

    if (cleanAction === 'complete' || cleanAction === 'complete/resigned') {
      estatus = 'Certificado';
    } else if (cleanAction === 'create form') {
      estatus = 'Potencial';
    } else {
      estatus = 'Por Certificar';
    }

    // APLICACIÓN DE MODIFICACIONES MANUALES (OVERRIDES) DEL ADMINISTRADOR
    const override = overrides[normId];
    if (override) {
      if (override.Departamento !== undefined) {
        departamento = override.Departamento;
      }
      if (override.Estatus !== undefined) {
        estatus = override.Estatus;
      }
      if (override.Action !== undefined) {
        action = override.Action;
      }
      if (override.TipoPersonal !== undefined) {
        tipoPersonal = override.TipoPersonal;
      }
    }

    mergedList.push({
      ID: normId,
      Nombre: nombre,
      Departamento: departamento,
      Puesto: puesto,
      Manager: manager,
      Action: action,
      Estatus: estatus,
      TipoPersonal: tipoPersonal,
    });
  });

  return mergedList;
}

/**
 * Calcula los indicadores KPI globales basados en la lista de empleados procesada.
 */
export function computeKPIs(employees: MergedEmployee[]): KPIStats {
  const totalHeadcount = employees.length;
  
  if (totalHeadcount === 0) {
    return {
      totalHeadcount: 0,
      certifiedCount: 0,
      potentialCount: 0,
      pendingCount: 0,
      globalPercentage: 0,
    };
  }

  let certifiedCount = 0;
  let potentialCount = 0;
  let pendingCount = 0;

  employees.forEach((emp) => {
    if (emp.Estatus === 'Certificado') {
      certifiedCount++;
    } else if (emp.Estatus === 'Potencial') {
      potentialCount++;
    } else {
      pendingCount++;
    }
  });

  const globalPercentage = Math.round((certifiedCount / totalHeadcount) * 100);

  return {
    totalHeadcount,
    certifiedCount,
    potentialCount,
    pendingCount,
    globalPercentage,
  };
}

/**
 * Calcula el resumen de certificación agrupado por departamento.
 */
export function computeDepartmentSummaries(employees: MergedEmployee[]): DepartmentSummary[] {
  const deptMap = new Map<string, {
    totalHC: number;
    certified: number;
    potential: number;
    pending: number;
  }>();

  employees.forEach((emp) => {
    const dept = emp.Departamento || 'SIN DEPARTAMENTO';
    if (!deptMap.has(dept)) {
      deptMap.set(dept, { totalHC: 0, certified: 0, potential: 0, pending: 0 });
    }
    
    const stats = deptMap.get(dept)!;
    stats.totalHC++;
    
    if (emp.Estatus === 'Certificado') {
      stats.certified++;
    } else if (emp.Estatus === 'Potencial') {
      stats.potential++;
    } else {
      stats.pending++;
    }
  });

  const summaries: DepartmentSummary[] = [];

  deptMap.forEach((stats, dept) => {
    const percentage = stats.totalHC > 0 
      ? Math.round((stats.certified / stats.totalHC) * 100) 
      : 0;

    summaries.push({
      Departamento: dept,
      totalHC: stats.totalHC,
      certified: stats.certified,
      potential: stats.potential,
      pending: stats.pending,
      percentage,
    });
  });

  return summaries.sort((a, b) => a.Departamento.localeCompare(b.Departamento));
}

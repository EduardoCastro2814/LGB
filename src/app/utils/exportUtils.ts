import * as XLSX from 'xlsx';
import { MergedEmployee } from '../types';

/**
 * Exporta un listado de empleados cruzados a un archivo Excel (.xlsx) usando SheetJS.
 */
export function exportToExcel(employees: MergedEmployee[], departmentName: string) {
  const dataToExport = employees.map(emp => ({
    ID: emp.ID,
    Nombre: emp.Nombre,
    Departamento: emp.Departamento,
    Puesto: emp.Puesto,
    Manager: emp.Manager,
    Action: emp.Action || 'N/A',
    Estatus: emp.Estatus
  }));

  const ws = XLSX.utils.json_to_sheet(dataToExport);
  
  // Autoajustar ancho de columnas para mejor visualización corporativa
  const colWidths = [
    { wch: 10 }, // ID
    { wch: 30 }, // Nombre
    { wch: 25 }, // Departamento
    { wch: 25 }, // Puesto
    { wch: 30 }, // Manager
    { wch: 15 }, // Action
    { wch: 15 }  // Estatus
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pendientes Certificación');

  const safeDeptName = departmentName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `LGB_Pendientes_${safeDeptName}.xlsx`;
  
  XLSX.writeFile(wb, filename);
}

/**
 * Exporta un listado de empleados cruzados a un archivo CSV.
 */
export function exportToCSV(employees: MergedEmployee[], departmentName: string) {
  const headers = ['ID', 'Nombre', 'Departamento', 'Puesto', 'Manager', 'Action', 'Estatus'];
  
  const csvRows = [
    headers.join(','),
    ...employees.map(emp => {
      const row = [
        emp.ID,
        `"${emp.Nombre.replace(/"/g, '""')}"`,
        `"${emp.Departamento.replace(/"/g, '""')}"`,
        `"${emp.Puesto.replace(/"/g, '""')}"`,
        `"${emp.Manager.replace(/"/g, '""')}"`,
        `"${(emp.Action || '').replace(/"/g, '""')}"`,
        emp.Estatus
      ];
      return row.join(',');
    })
  ];

  const csvContent = '\uFEFF' + csvRows.join('\n'); // Add UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const safeDeptName = departmentName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `LGB_Pendientes_${safeDeptName}.csv`;

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

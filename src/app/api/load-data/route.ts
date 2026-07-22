import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hcPath = path.join(process.cwd(), 'HC B29 2026 Junio.xlsx');
    const reportPath = path.join(process.cwd(), 'ReportLGB.xlsx');
    
    // Verificar existencia de archivos
    const hcExists = fs.existsSync(hcPath);
    const reportExists = fs.existsSync(reportPath);

    if (!hcExists || !reportExists) {
      return NextResponse.json({ 
        success: false, 
        error: `Archivos predeterminados no encontrados. Headcount: ${hcExists ? 'Encontrado' : 'Faltante'}, ReportLGB: ${reportExists ? 'Encontrado' : 'Faltante'}. Asegúrese de que estén en la raíz de C:\\Users\\gdlcastr\\LGB.` 
      }, { status: 404 });
    }
    
    // Leer Headcount (Segundo sheet, cabecera en fila 2)
    const hcBuffer = fs.readFileSync(hcPath);
    const hcWorkbook = XLSX.read(hcBuffer, { type: 'buffer' });
    
    // Usar la segunda hoja como se vio en el script original de extracción
    const sheetNameHC = hcWorkbook.SheetNames[1] || hcWorkbook.SheetNames[0];
    const sheetHC = hcWorkbook.Sheets[sheetNameHC];
    
    // Cabecera en la fila 2 (0-indexed fila 1), por lo que usamos range: 1
    const hcRawData = XLSX.utils.sheet_to_json(sheetHC, { range: 1 });
    
    // Leer Reporte LGB (Primera hoja, cabecera en fila 1)
    const reportBuffer = fs.readFileSync(reportPath);
    const reportWorkbook = XLSX.read(reportBuffer, { type: 'buffer' });
    const sheetNameReport = reportWorkbook.SheetNames[0];
    const sheetReport = reportWorkbook.Sheets[sheetNameReport];
    const reportRawData = XLSX.utils.sheet_to_json(sheetReport);
    
    return NextResponse.json({
      success: true,
      hcData: hcRawData,
      reportData: reportRawData
    });
  } catch (error: any) {
    console.error('API Error parsing excel:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Error al procesar archivos locales en el servidor: ${error.message}` 
    }, { status: 500 });
  }
}

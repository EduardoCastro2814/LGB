'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Check, AlertCircle, UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelUploaderProps {
  onDataLoaded: (type: 'hc' | 'report', data: any[]) => void;
  hcLoaded: boolean;
  reportLoaded: boolean;
}

export default function ExcelUploader({ onDataLoaded, hcLoaded, reportLoaded }: ExcelUploaderProps) {
  const [dragActiveHC, setDragActiveHC] = useState(false);
  const [dragActiveLGB, setDragActiveLGB] = useState(false);

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

  const processFile = (file: File, type: 'hc' | 'report') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let rawData: any[] = [];
        if (type === 'hc') {
          // Usar la segunda hoja para HC, cabecera en fila 2 (range: 1)
          const sheetName = workbook.SheetNames[1] || workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          rawData = XLSX.utils.sheet_to_json(sheet, { range: 1 });
        } else {
          // Usar la primera hoja para ReportLGB, cabecera en fila 1
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          rawData = XLSX.utils.sheet_to_json(sheet);
        }
        
        onDataLoaded(type, rawData);
      } catch (err: any) {
        alert(`Error al procesar el archivo Excel: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
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

  return (
    <section className="glass-panel rounded-2xl p-6 mb-6 animate-fade-in" style={{ animationDelay: '0.05s' }}>
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          Carga de Archivos de Datos (Actualizar Excel)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dropzone 1: Headcount Excel */}
        <div
          onDragEnter={(e) => handleDrag(e, 'hc')}
          onDragOver={(e) => handleDrag(e, 'hc')}
          onDragLeave={(e) => handleDrag(e, 'hc')}
          onDrop={(e) => handleDrop(e, 'hc')}
          className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActiveHC
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <input
            type="file"
            id="file-hc"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileChange(e, 'hc')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Headcount Oficial Site (HC B29)
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[280px]">
            Arrastra el archivo Excel de headcount o haz clic para seleccionarlo
          </p>
          
          <div className="mt-4">
            {hcLoaded ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" />
                Cargado con éxito
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <AlertCircle className="w-3.5 h-3.5" />
                No cargado
              </span>
            )}
          </div>
        </div>

        {/* Dropzone 2: Reporte LGB Excel */}
        <div
          onDragEnter={(e) => handleDrag(e, 'lgb')}
          onDragOver={(e) => handleDrag(e, 'lgb')}
          onDragLeave={(e) => handleDrag(e, 'lgb')}
          onDrop={(e) => handleDrop(e, 'report')}
          className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActiveLGB
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <input
            type="file"
            id="file-lgb"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileChange(e, 'report')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Estatus LGB (ReportLGB)
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[280px]">
            Arrastra el archivo Excel de certificaciones o haz clic para seleccionarlo
          </p>
          
          <div className="mt-4">
            {reportLoaded ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" />
                Cargado con éxito
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <AlertCircle className="w-3.5 h-3.5" />
                No cargado
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

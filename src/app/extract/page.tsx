'use client';

import React, { useEffect, useState } from 'react';

const COURSES_TO_EXTRACT = [
  { id: 'lean-basics-1', pdfName: 'Basicos de Lean 1.pdf' },
  { id: '5s-1', pdfName: '5s+1.pdf' },
  { id: '7-ways', pdfName: 'Seven Ways.pdf' },
  { id: 'sga-guide', pdfName: 'SGA.pdf' },
  { id: '5-whys', pdfName: '5 why´s.pdf' }
];

export default function ExtractPage() {
  const [status, setStatus] = useState('Inicializando...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
    console.log(msg);
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.async = true;
    script.onload = async () => {
      addLog('PDF.js cargado correctamente.');
      try {
        await startExtraction();
      } catch (err: any) {
        setStatus('Error durante la extracción');
        addLog(`Error: ${err.message}`);
      }
    };
    script.onerror = () => {
      setStatus('Error al cargar PDF.js');
      addLog('Error cargando el script de PDF.js desde CDN.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startExtraction = async () => {
    const pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    for (const course of COURSES_TO_EXTRACT) {
      const pdfUrl = `/LGB/${course.pdfName}`;
      addLog(`[${course.id}] Cargando PDF desde: ${pdfUrl}`);
      setStatus(`Procesando curso: ${course.id}...`);

      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      addLog(`[${course.id}] PDF cargado. Total páginas: ${numPages}`);

      for (let i = 1; i <= numPages; i++) {
        addLog(`[${course.id}] Renderizando página ${i}/${numPages}...`);
        const page = await pdf.getPage(i);
        
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (!context) {
          throw new Error('No se pudo obtener el contexto de canvas 2D');
        }

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const base64 = canvas.toDataURL('image/png');

        addLog(`[${course.id}] Enviando página ${i}...`);
        const res = await fetch('/LGB/api/save-slide', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId: course.id, index: i, base64 }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Error HTTP ${res.status}`);
        }

        addLog(`[${course.id}] Página ${i} guardada.`);
      }
      addLog(`[${course.id}] Extracción completada.`);
    }

    setStatus('¡Extracción completada con éxito!');
    addLog('Todas las diapositivas de los tres cursos han sido guardadas en el servidor.');
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Extractor Multicurso de Diapositivas (LGB Academy)</h1>
      <div style={{ padding: '16px', background: '#1e293b', borderRadius: '8px', marginBottom: '16px' }}>
        <strong>Estado: </strong>
        <span style={{ color: status.includes('Error') ? '#f87171' : '#34d399' }}>{status}</span>
      </div>
      <div style={{ background: '#020617', padding: '16px', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', marginTop: '0', color: '#94a3b8' }}>Logs de Operación:</h2>
        <ul style={{ listStyle: 'none', paddingLeft: '0', margin: '0' }}>
          {logs.map((log, index) => (
            <li key={index} style={{ marginBottom: '6px', color: '#cbd5e1', fontSize: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
              [{new Date().toLocaleTimeString()}] {log}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

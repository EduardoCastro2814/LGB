'use client';

import React, { useState } from 'react';
import { CertificateConfig, TextPosition } from '../types';
import { Award, UploadCloud, Move, Eye, RotateCcw, Save, Trash2, CheckCircle2 } from 'lucide-react';

interface ConfigCertificatesProps {
  certConfig: CertificateConfig;
  onSaveConfig: (updatedConfig: CertificateConfig) => void;
}

export default function ConfigCertificates({ certConfig, onSaveConfig }: ConfigCertificatesProps) {
  const [activeLabel, setActiveLabel] = useState<string>('nombreEmpleado');
  const [dragActive, setDragActive] = useState(false);

  // Claves y etiquetas amigables
  const labelsMap: Record<string, string> = {
    nombreEmpleado: 'Nombre de Colaborador',
    numEmpleado: 'Detalles del Empleado (ID/Depto)',
    nombreCurso: 'Nombre de la Materia',
    fechaCompletado: 'Fecha de Expedición',
    calificacion: 'Calificación Obtenida',
    folio: 'Folio de Evidencia',
  };

  const activePosition: TextPosition = certConfig.positions[activeLabel as keyof typeof certConfig.positions];

  const handleUpdatePosition = (field: string, updates: Partial<TextPosition>) => {
    const updatedPositions = {
      ...certConfig.positions,
      [field]: {
        ...certConfig.positions[field as keyof typeof certConfig.positions],
        ...updates,
      },
    };

    onSaveConfig({
      ...certConfig,
      positions: updatedPositions as any,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onSaveConfig({
          ...certConfig,
          background: e.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveBackground = () => {
    if (confirm('¿Está seguro de eliminar el fondo personalizado? Se restablecerá la plantilla oscura corporativa estándar.')) {
      onSaveConfig({
        ...certConfig,
        background: '',
      });
    }
  };

  const handleResetLayout = () => {
    if (confirm('¿Restablecer todas las coordenadas y tamaños de texto a los valores de fábrica?')) {
      const defaultPositions = {
        nombreEmpleado: { x: 50, y: 34, fontSize: 42, visible: true },
        numEmpleado: { x: 50, y: 42, fontSize: 18, visible: true },
        nombreCurso: { x: 50, y: 56, fontSize: 36, visible: true },
        fechaCompletado: { x: 30, y: 70, fontSize: 18, visible: true },
        calificacion: { x: 70, y: 70, fontSize: 18, visible: true },
        folio: { x: 50, y: 82, fontSize: 14, visible: true },
      };
      
      onSaveConfig({
        background: certConfig.background,
        textColor: '#ffffff',
        positions: defaultPositions,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-slate-805 dark:text-[#f8fafc]">
      
      {/* Controles de Configuración e Importación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Panel Lateral: Sliders y Carga de Archivos */}
        <div className="space-y-6">
          
          {/* Carga del Fondo */}
          <div className="glass-panel rounded-2.5xl p-5 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
              Plantilla de Fondo (.PNG / .JPG)
            </h4>

            {certConfig.background ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-[#334155]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={certConfig.background} alt="Fondo Certificado" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-white uppercase bg-emerald-500/80 px-2.5 py-1 rounded-md">Template Activo</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/15 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Fondo</span>
                </button>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-350">Subir Fondo de Certificado</h5>
                <p className="text-[9px] text-slate-400 mt-1 max-w-[200px]">Arrastra una imagen de fondo corporativo o haz clic aquí</p>
              </div>
            )}
          </div>

          {/* Ajuste de Posición del Texto */}
          <div className="glass-panel rounded-2.5xl p-5 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-[#2d3a4f]">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                Alineación de Textos
              </h4>
              <button 
                onClick={handleResetLayout}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer" 
                title="Resetear Diseño"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selector de Etiqueta Activa */}
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Campo a Editar</label>
              <select
                className="block w-full px-3 py-2 bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-bold cursor-pointer"
                value={activeLabel}
                onChange={(e) => setActiveLabel(e.target.value)}
              >
                {Object.keys(certConfig.positions).map(key => (
                  <option key={key} value={key}>{labelsMap[key] || key}</option>
                ))}
              </select>
            </div>

            {/* Sliders de Ajuste */}
            {activePosition && (
              <div className="space-y-3.5 pt-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                  <span>Habilitar Visualización</span>
                  <input
                    type="checkbox"
                    checked={activePosition.visible}
                    onChange={(e) => handleUpdatePosition(activeLabel, { visible: e.target.checked })}
                    className="text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5 rounded cursor-pointer"
                  />
                </div>

                {activePosition.visible && (
                  <>
                    {/* Eje X */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                        <span>Alineación Horizontal (X):</span>
                        <span className="font-bold text-emerald-500">{activePosition.x}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        step="1"
                        className="w-full h-1.5 bg-slate-100 dark:bg-[#273449] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        value={activePosition.x}
                        onChange={(e) => handleUpdatePosition(activeLabel, { x: parseInt(e.target.value, 10) })}
                      />
                    </div>

                    {/* Eje Y */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                        <span>Alineación Vertical (Y):</span>
                        <span className="font-bold text-emerald-500">{activePosition.y}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        step="1"
                        className="w-full h-1.5 bg-slate-100 dark:bg-[#273449] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        value={activePosition.y}
                        onChange={(e) => handleUpdatePosition(activeLabel, { y: parseInt(e.target.value, 10) })}
                      />
                    </div>

                    {/* Tamaño Letra */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-450 font-mono">
                        <span>Tamaño de Fuente:</span>
                        <span className="font-bold text-emerald-500">{activePosition.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        step="1"
                        className="w-full h-1.5 bg-slate-100 dark:bg-[#273449] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        value={activePosition.fontSize}
                        onChange={(e) => handleUpdatePosition(activeLabel, { fontSize: parseInt(e.target.value, 10) })}
                      />
                    </div>

                    {/* Color de Texto Global */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#2d3a4f] flex justify-between items-center text-[10px] font-bold text-slate-450">
                      <span>Color de Texto Global</span>
                      <input
                        type="color"
                        value={certConfig.textColor || '#ffffff'}
                        onChange={(e) => onSaveConfig({ ...certConfig, textColor: e.target.value })}
                        className="w-8 h-6 p-0 border border-slate-200 dark:border-[#334155] rounded cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Columna Derecha: Vista Previa en Vivo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-[#cbd5e1] flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Vista Previa Interactiva (Simulación)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Lienzo Proporcional 1200x850</span>
          </div>

          <div className="relative aspect-[1200/850] w-full rounded-3xl overflow-hidden border border-slate-250 dark:border-[#2d3b50] bg-slate-950 text-white shadow-2xl select-none">
            
            {/* Fondo */}
            {certConfig.background ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={certConfig.background} 
                alt="Fondo Certificado" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
              />
            ) : (
              // Fondo de contingencia por defecto
              <div className="absolute inset-0 bg-[#0f172a] pointer-events-none">
                <div className="absolute inset-8 border border-amber-600/30" />
                <div className="absolute inset-10 border border-amber-500/10" />
              </div>
            )}

            {/* Elemento de Cabecera Fija */}
            {!certConfig.background && (
              <div className="absolute top-[18%] left-0 w-full text-center text-slate-400 font-bold uppercase tracking-widest text-[1.4vw] leading-none pointer-events-none">
                LEAN ACADEMY - PHILO B29 SITE
              </div>
            )}

            {/* TEXTOS DINÁMICOS SOBREIMPRESOS EN VIVO */}
            {Object.entries(certConfig.positions).map(([key, pos]) => {
              if (!pos.visible) return null;

              // Obtener textos dummy para simular el diploma en vivo
              const getDummyText = (k: string) => {
                switch (k) {
                  case 'nombreEmpleado': return 'Carlos Pérez Morales';
                  case 'numEmpleado': return 'Número de Empleado: 520478  |  Depto: BE';
                  case 'nombreCurso': return 'LEAN BASICS 1';
                  case 'fechaCompletado': return 'Fecha de Expedición: 22 de julio de 2026';
                  case 'calificacion': return 'Calificación: 95% (Aprobado)';
                  case 'folio': return 'Folio de Evidencia: LGB-LEA-620547';
                  default: return k;
                }
              };

              const style: React.CSSProperties = {
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${(pos.fontSize / 1200) * 100}vw`, // Escalar proporcionalmente al ancho del contenedor responsivo
                fontWeight: 'bold',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                color: key === 'nombreCurso' ? '#10b981' : (key === 'folio' ? '#f59e0b' : (certConfig.textColor || '#ffffff')),
                fontFamily: (key === 'nombreEmpleado' || key === 'nombreCurso') ? 'Georgia, serif' : 'sans-serif',
                transition: 'all 0.1s ease',
              };

              const isLabelActive = activeLabel === key;

              return (
                <div 
                  key={key} 
                  style={style}
                  className={`pointer-events-none rounded px-2.5 py-0.5 border ${
                    isLabelActive 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg animate-pulse' 
                      : 'border-transparent'
                  }`}
                >
                  {getDummyText(key)}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              **Instrucciones**: Mueva los controles deslizantes a la izquierda para posicionar cada texto. Cuando los colaboradores aprueben su examen, el sistema utilizará estas coordenadas exactas para generar el archivo del certificado descargable.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

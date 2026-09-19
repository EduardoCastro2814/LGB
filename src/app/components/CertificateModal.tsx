'use client';

import React, { useRef } from 'react';
import { Award, Download, FileText, X, CheckCircle2 } from 'lucide-react';
import { CertificateConfig } from '../types';

export const DEFAULT_CERT_CONFIG: CertificateConfig = {
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
  templateName: 'Plantilla Estándar',
  templateUploadDate: 'De fábrica',
  templateUrl: 'Interno',
  useCustomTemplate: false,
};

export interface CertificateData {
  userName: string;
  userId: string;
  courseName: string;
  courseId: string;
  completionDate: string;
  score: number;
  folio: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CertificateData;
  certConfig?: CertificateConfig;
}

/**
 * Función utilitaria para dibujar el certificado en un elemento Canvas 2D
 */
export function drawCertificateToCanvas(
  canvas: HTMLCanvasElement,
  data: CertificateData,
  config: CertificateConfig = DEFAULT_CERT_CONFIG
): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve();
      return;
    }

    const width = 1200;
    const height = 850;
    canvas.width = width;
    canvas.height = height;

    const isCustom = !!config.background && config.useCustomTemplate !== false;
    const p = config.positions || DEFAULT_CERT_CONFIG.positions;

    const getCoords = (key: string, defX: number, defY: number, defF: number) => {
      const pKey = p[key as keyof typeof p];
      return {
        x: pKey?.x !== undefined ? (pKey.x / 100) * width : (defX / 100) * width,
        y: pKey?.y !== undefined ? (pKey.y / 100) * height : (defY / 100) * height,
        fontSize: pKey?.fontSize || defF,
        visible: pKey?.visible !== undefined ? pKey.visible : true,
      };
    };

    const renderDynamicText = () => {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // A. Textos estándar fijos de Flex Recognition (solo si no es personalizado)
      if (!isCustom) {
        ctx.fillStyle = '#007fc4';
        ctx.font = 'black 62px sans-serif';
        ctx.fillText('RECOGNITION', 600, 150);

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('Lean Academy Certification Program', 600, 205);

        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 18px sans-serif';
        ctx.fillText('Awarded to:', 600, 260);
      }

      // B. Nombre del Colaborador
      const nEmp = getCoords('nombreEmpleado', 50, 35, 42);
      if (nEmp.visible) {
        ctx.fillStyle = config.textColor || '#0f172a';
        ctx.font = `bold ${nEmp.fontSize}px Georgia, serif`;
        ctx.fillText(data.userName, nEmp.x, nEmp.y);
      }

      // C. Número de Empleado
      const numEmp = getCoords('numEmpleado', 50, 41, 16);
      if (numEmp.visible) {
        ctx.fillStyle = '#64748b';
        ctx.font = `bold ${numEmp.fontSize}px sans-serif`;
        ctx.fillText(`ID de Empleado: ${data.userId}`, numEmp.x, numEmp.y);
      }

      // D. Texto de Acreditación Fijo (solo si no es personalizado)
      if (!isCustom) {
        ctx.fillStyle = '#64748b';
        ctx.font = 'normal 18px sans-serif';
        ctx.fillText('For successfully completing and demonstrating proficiency in:', 600, 435);
      }

      // E. Nombre del Curso
      const nCur = getCoords('nombreCurso', 50, 55, 36);
      if (nCur.visible) {
        ctx.fillStyle = '#0284c7';
        ctx.font = `bold ${nCur.fontSize}px Georgia, serif`;
        ctx.fillText(data.courseName.toUpperCase(), nCur.x, nCur.y);
      }

      // F. Fecha de Completado y Calificación
      const fComp = getCoords('fechaCompletado', 50, 68, 17);
      if (fComp.visible) {
        ctx.fillStyle = '#475569';
        ctx.font = `bold ${fComp.fontSize}px sans-serif`;
        ctx.fillText(
          `Completion Date: ${data.completionDate}   •   Score: ${data.score}%`,
          fComp.x,
          fComp.y
        );
      }

      // G. Calificación específica (si se configuró visible)
      const calif = getCoords('calificacion', 70, 70, 18);
      if (calif.visible && isCustom) {
        ctx.fillStyle = '#059669';
        ctx.font = `bold ${calif.fontSize}px sans-serif`;
        ctx.fillText(`Calificación: ${data.score}%`, calif.x, calif.y);
      }

      // H. Folio de Evidencia
      const fol = getCoords('folio', 50, 80, 14);
      if (fol.visible) {
        ctx.fillStyle = '#64748b';
        ctx.font = `bold ${fol.fontSize}px Courier New, monospace`;
        ctx.fillText(`ID: ${data.folio}`, fol.x, fol.y);
      }

      // I. Firmas Digitales (solo si no es personalizado)
      if (!isCustom) {
        // Firma 1: Director
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(680, 685);
        ctx.lineTo(880, 685);
        ctx.stroke();

        ctx.fillStyle = '#005ea2';
        ctx.font = 'italic 24px Georgia, serif';
        ctx.fillText('Lean Academy', 780, 670);

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Ing. Luis Hernández', 780, 705);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Lean Academy Director', 780, 725);

        // Firma 2: Plant Manager
        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(930, 685);
        ctx.lineTo(1130, 685);
        ctx.stroke();

        ctx.fillStyle = '#005ea2';
        ctx.font = 'italic 24px Georgia, serif';
        ctx.fillText('Philo B29', 1030, 670);

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Dir. Alejandro Ruiz', 1030, 705);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Plant Manager', 1030, 725);
      }

      // J. Barra inferior con degradado y logo Flex (solo si no es personalizado)
      if (!isCustom) {
        const footerGrad = ctx.createLinearGradient(0, 790, 1200, 790);
        footerGrad.addColorStop(0, '#005ea2');
        footerGrad.addColorStop(1, '#0090e1');
        ctx.fillStyle = footerGrad;
        ctx.fillRect(0, 795, width, 55);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold italic 28px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('flex', 1140, 830);
      }

      resolve();
    };

    if (isCustom && config.background) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, width, height);
        renderDynamicText();
      };
      bgImg.onerror = () => {
        renderDynamicText();
      };
      bgImg.src = config.background;
    } else {
      // 1. Fondo Blanco/Gris Claro
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // 2. Triángulo azul superior izquierdo
      const topGrad = ctx.createLinearGradient(0, 0, 300, 300);
      topGrad.addColorStop(0, '#0090e1');
      topGrad.addColorStop(1, '#005ea2');
      ctx.fillStyle = topGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(360, 0);
      ctx.lineTo(0, 360);
      ctx.closePath();
      ctx.fill();

      // 3. Sello circular de Lean Enterprise
      const centerX = 110;
      const centerY = 110;
      const radius = 62;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('FLEX LEAN', centerX, centerY - 22);
      ctx.font = 'black 22px sans-serif';
      ctx.fillText('LGB', centerX, centerY);
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('ENTERPRISE', centerX, centerY + 22);

      renderDynamicText();
    }
  });
}

/**
 * Descarga directa del certificado en formato PNG
 */
export async function downloadCertificatePNG(
  data: CertificateData,
  config?: CertificateConfig
) {
  const canvas = document.createElement('canvas');
  await drawCertificateToCanvas(canvas, data, config || DEFAULT_CERT_CONFIG);
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const safeCourseName = data.courseName.replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
    link.download = `Certificado_${safeCourseName}_${data.userId || 'LGB'}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Error al descargar certificado PNG:', err);
    alert('No fue posible realizar la descarga automática. Por favor use la opción de Imprimir / Guardar PDF.');
  }
}

/**
 * Imprime o genera el PDF del certificado utilizando los estilos exactos del sistema
 */
export function printCertificatePDF(
  data: CertificateData,
  config: CertificateConfig = DEFAULT_CERT_CONFIG
) {
  const isCustom = !!config.background && config.useCustomTemplate !== false;
  const p = config.positions || DEFAULT_CERT_CONFIG.positions;

  const certificateContainerStyle = isCustom
    ? `background-image: url('${config.background}'); background-size: 100% 100%; background-repeat: no-repeat;`
    : `background-color: #f8fafc;`;

  const certificateBody = isCustom
    ? `
        <div class="certificate-container" style="${certificateContainerStyle}">
          ${p.nombreEmpleado?.visible !== false ? `<div class="dynamic-text employee-name" style="left: ${p.nombreEmpleado?.x || 50}%; top: ${p.nombreEmpleado?.y || 34}%; font-size: ${((p.nombreEmpleado?.fontSize || 42) / 1200) * 297}mm; color: ${config.textColor || '#0f172a'}; font-family: Georgia, serif;">${data.userName}</div>` : ''}
          ${p.numEmpleado?.visible ? `<div class="dynamic-text employee-id" style="left: ${p.numEmpleado?.x || 50}%; top: ${p.numEmpleado?.y || 42}%; font-size: ${((p.numEmpleado?.fontSize || 18) / 1200) * 297}mm; color: #64748b;">ID: ${data.userId}</div>` : ''}
          ${p.nombreCurso?.visible !== false ? `<div class="dynamic-text course-name" style="left: ${p.nombreCurso?.x || 50}%; top: ${p.nombreCurso?.y || 56}%; font-size: ${((p.nombreCurso?.fontSize || 36) / 1200) * 297}mm; color: #0284c7; font-family: Georgia, serif; text-transform: uppercase;">${data.courseName}</div>` : ''}
          ${p.fechaCompletado?.visible !== false ? `<div class="dynamic-text completion-date" style="left: ${p.fechaCompletado?.x || 50}%; top: ${p.fechaCompletado?.y || 70}%; font-size: ${((p.fechaCompletado?.fontSize || 18) / 1200) * 297}mm; color: #475569;">Completion Date: ${data.completionDate} • Score: ${data.score}%</div>` : ''}
          ${p.folio?.visible !== false ? `<div class="dynamic-text evidence-id" style="left: ${p.folio?.x || 50}%; top: ${p.folio?.y || 82}%; font-size: ${((p.folio?.fontSize || 14) / 1200) * 297}mm; color: #64748b; font-family: monospace;">ID: ${data.folio}</div>` : ''}
        </div>
      `
    : `
        <div class="certificate-container" style="${certificateContainerStyle}">
          <div class="corner-triangle"></div>
          <div class="seal-container">
            <div class="seal-outer-circle"></div>
            <div class="seal-text-top">Flex Lean</div>
            <div class="seal-center">LGB</div>
            <div class="seal-text-bottom">Enterprise</div>
          </div>
          
          <div class="cert-content">
            <h1 class="title-recognition">RECOGNITION</h1>
            <div class="subtitle">Lean Academy Certification Program</div>
            
            <div class="awarded-to">Awarded to:</div>
            <h2 class="employee-name" style="font-size: ${((p.nombreEmpleado?.fontSize || 42) / 1200) * 297}mm; color: ${config.textColor || '#0f172a'};">${data.userName}</h2>
            <div class="employee-id" style="font-size: 3.5mm; color: #64748b; font-weight: 700; margin-bottom: 5mm;">Colaborador ID: ${data.userId}</div>
            
            <div class="proficiency-text">For successfully completing and demonstrating proficiency in:</div>
            <h3 class="course-name" style="font-size: ${((p.nombreCurso?.fontSize || 36) / 1200) * 297}mm;">${data.courseName}</h3>
            
            <div class="stats-row" style="font-size: ${((p.fechaCompletado?.fontSize || 18) / 1200) * 297}mm;">
              <span>Completion Date: ${data.completionDate}</span>
              <span class="stats-dot">•</span>
              <span>Calificación: <strong>${data.score}%</strong></span>
            </div>
          </div>
          
          <div class="bottom-row">
            <div class="evidence-id-container" style="font-size: ${((p.folio?.fontSize || 14) / 1200) * 297}mm;">
              <span>ID:</span>
              <span>${data.folio}</span>
            </div>

            <div style="display: flex; gap: 15mm;">
              <div class="signature-block">
                <div class="signature-line">
                  <span class="signature-svg">Lean Academy</span>
                </div>
                <span class="signature-name">Ing. Luis Hernández</span>
                <span class="signature-title">Lean Academy Director</span>
              </div>
              
              <div class="signature-block">
                <div class="signature-line">
                  <span class="signature-svg">Philo B29</span>
                </div>
                <span class="signature-name">Dir. Alejandro Ruiz</span>
                <span class="signature-title">Plant Manager</span>
              </div>
            </div>
          </div>
          
          <div class="footer-bar">
            <span class="flex-logo">flex</span>
          </div>
        </div>
      `;

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Certificado - ${data.courseName} - ${data.userName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .certificate-container {
            width: 297mm;
            height: 210mm;
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          }
          .dynamic-text {
            position: absolute;
            transform: translate(-50%, -50%);
            text-align: center;
            white-space: nowrap;
            font-weight: bold;
          }
          .corner-triangle {
            position: absolute;
            top: 0;
            left: 0;
            width: 85mm;
            height: 85mm;
            background: linear-gradient(135deg, #0090e1 0%, #005ea2 100%);
            clip-path: polygon(0 0, 100% 0, 0 100%);
            z-index: 10;
          }
          .seal-container {
            position: absolute;
            top: 8mm;
            left: 8mm;
            width: 32mm;
            height: 32mm;
            border: 0.8mm dashed rgba(255, 255, 255, 0.85);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            text-align: center;
            z-index: 20;
          }
          .seal-outer-circle {
            position: absolute;
            width: 30mm;
            height: 30mm;
            border: 0.4mm solid rgba(255, 255, 255, 0.9);
            border-radius: 50%;
          }
          .seal-text-top {
            font-size: 1.9mm;
            font-weight: 800;
            letter-spacing: 0.2mm;
            margin-top: 1mm;
            text-transform: uppercase;
          }
          .seal-center {
            font-size: 5.5mm;
            font-weight: 950;
            color: #ffffff;
            margin: 1mm 0;
            line-height: 1;
          }
          .seal-text-bottom {
            font-size: 1.7mm;
            font-weight: 700;
            letter-spacing: 0.15mm;
            text-transform: uppercase;
          }
          .cert-content {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 25mm;
            padding-bottom: 20mm;
            box-sizing: border-box;
            text-align: center;
          }
          .title-recognition {
            font-size: 15mm;
            font-weight: 900;
            color: #007fc4;
            margin: 0;
            letter-spacing: 1.5mm;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 4.8mm;
            font-weight: 700;
            color: #475569;
            margin-top: 1.5mm;
            margin-bottom: 6mm;
          }
          .awarded-to {
            font-size: 4.2mm;
            color: #64748b;
            font-style: italic;
            margin-bottom: 2mm;
          }
          .employee-name {
            margin: 0 0 1mm 0;
            font-family: Georgia, serif;
            font-weight: 800;
          }
          .proficiency-text {
            font-size: 4.2mm;
            color: #64748b;
            margin-bottom: 2.5mm;
          }
          .course-name {
            margin: 0 0 5mm 0;
            font-family: Georgia, serif;
            font-weight: 850;
            text-transform: uppercase;
          }
          .stats-row {
            display: flex;
            align-items: center;
            gap: 4mm;
            color: #475569;
            font-weight: 700;
            margin-bottom: 8mm;
          }
          .stats-dot {
            color: #007fc4;
          }
          .bottom-row {
            position: absolute;
            bottom: 22mm;
            left: 0;
            width: 100%;
            padding: 0 18mm;
            box-sizing: border-box;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
          }
          .signature-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 55mm;
            text-align: center;
          }
          .signature-line {
            width: 100%;
            border-bottom: 0.3mm solid #94a3b8;
            margin-bottom: 1.5mm;
            height: 8mm;
            position: relative;
          }
          .signature-svg {
            position: absolute;
            bottom: 0.5mm;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Brush Script MT', cursive, Georgia, serif;
            font-size: 6mm;
            font-style: italic;
            color: #005ea2;
          }
          .signature-title {
            font-size: 2.8mm;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1mm;
          }
          .signature-name {
            font-size: 3.2mm;
            color: #334155;
            font-weight: 800;
          }
          .evidence-id-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #64748b;
            font-family: monospace;
            font-weight: 700;
          }
          .footer-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 13.5mm;
            background: linear-gradient(90deg, #005ea2 0%, #0090e1 100%);
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 18mm;
            box-sizing: border-box;
          }
          .flex-logo {
            color: #ffffff;
            font-size: 6.5mm;
            font-weight: 900;
            font-style: italic;
            font-family: 'Segoe UI', sans-serif;
          }
        </style>
      </head>
      <body>
        ${certificateBody}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printHtml);
    printWindow.document.close();
  } else {
    alert('Por favor permita las ventanas emergentes en su navegador para imprimir o guardar el certificado en PDF.');
  }
}

/**
 * Modal Interactivo para previsualizar el certificado antes de descargar
 */
export default function CertificateModal({
  isOpen,
  onClose,
  data,
  certConfig = DEFAULT_CERT_CONFIG,
}: CertificateModalProps) {
  const isCustom = !!certConfig.background && certConfig.useCustomTemplate !== false;
  const p = certConfig.positions || DEFAULT_CERT_CONFIG.positions;

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadCertificatePNG(data, certConfig);
  };

  const handlePrint = () => {
    printCertificatePDF(data, certConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Cabecera del modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Certificado de Reconocimiento Oficial
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                Lean Academy Program • {data.courseName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Lienzo del Diploma (A4 Landscape) */}
        <div className="p-6 bg-slate-100/50 dark:bg-slate-900/20 flex flex-col items-center gap-6 overflow-x-auto">
          <div
            id="printable-certificate-element"
            className="w-full min-w-[650px] aspect-[297/210] relative bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-lg select-none @container"
          >
            {/* Fondo */}
            {isCustom && certConfig.background ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={certConfig.background}
                alt="Fondo Certificado"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <>
                {/* Triángulo superior izquierdo */}
                <div
                  className="absolute top-0 left-0 w-[28%] h-[28%] bg-gradient-to-br from-[#0090e1] to-[#005ea2]"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                />

                {/* Sello Lean Enterprise */}
                <div className="absolute top-[4%] left-[4%] w-[10%] aspect-square rounded-full border border-dashed border-white/80 flex flex-col items-center justify-center text-white z-10">
                  <div className="absolute inset-[4%] rounded-full border border-white/90" />
                  <span className="text-[0.6cqw] font-extrabold uppercase tracking-wide opacity-90 mt-[10%]">
                    Flex Lean
                  </span>
                  <span className="text-[1.8cqw] font-black leading-none my-[4%]">LGB</span>
                  <span className="text-[0.55cqw] font-bold uppercase tracking-wide opacity-90">
                    Enterprise
                  </span>
                </div>

                {/* Elementos Estáticos de Cabecera */}
                <div className="absolute top-[17.5%] left-0 w-full text-center text-[#007fc4] font-black uppercase tracking-[0.4em] text-[4.6cqw] leading-none pointer-events-none">
                  RECOGNITION
                </div>
                <div className="absolute top-[24%] left-0 w-full text-center text-slate-500 font-bold uppercase text-[1.5cqw] leading-none pointer-events-none">
                  Lean Academy Certification Program
                </div>

                {/* Etiqueta Awarded To */}
                <div className="absolute top-[31.5%] left-0 w-full text-center text-slate-400 font-semibold italic text-[1.4cqw] leading-none pointer-events-none">
                  Awarded to:
                </div>

                {/* Etiqueta Proficiency */}
                <div className="absolute top-[52%] left-0 w-full text-center text-slate-400 font-semibold text-[1.35cqw] leading-none pointer-events-none">
                  For successfully completing and demonstrating proficiency in:
                </div>
              </>
            )}

            {/* TEXTOS DINÁMICOS SOBREIMPRESOS EN VIVO */}
            {Object.entries(p).map(([key, pos]) => {
              if (!pos.visible) return null;

              const getText = (k: string) => {
                switch (k) {
                  case 'nombreEmpleado':
                    return data.userName;
                  case 'numEmpleado':
                    return `ID: ${data.userId}`;
                  case 'nombreCurso':
                    return data.courseName.toUpperCase();
                  case 'fechaCompletado':
                    return `Completion Date: ${data.completionDate} • Score: ${data.score}%`;
                  case 'calificacion':
                    return `Calificación: ${data.score}%`;
                  case 'folio':
                    return `ID: ${data.folio}`;
                  default:
                    return '';
                }
              };

              const txt = getText(key);
              if (!txt) return null;

              const style: React.CSSProperties = {
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${(pos.fontSize / 1200) * 100}cqw`,
                fontWeight: 'bold',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                color:
                  key === 'nombreCurso'
                    ? '#0284c7'
                    : key === 'folio'
                    ? '#64748b'
                    : key === 'calificacion'
                    ? '#059669'
                    : certConfig.textColor || '#0f172a',
                fontFamily:
                  key === 'nombreEmpleado' || key === 'nombreCurso'
                    ? 'Georgia, serif'
                    : 'sans-serif',
              };

              return (
                <div key={key} style={style} className="pointer-events-none rounded px-2.5 py-0.5">
                  {txt}
                </div>
              );
            })}

            {/* Fila inferior con firmas (plantilla estándar) */}
            {!isCustom && (
              <div className="absolute bottom-[9%] left-0 w-full px-[6%] box-border flex items-end justify-between pointer-events-none">
                <div className="flex flex-col items-center font-mono text-[0.9cqw] text-slate-400 font-bold">
                  <span className="uppercase text-[0.8cqw] tracking-wider font-sans font-semibold text-slate-400/80">
                    ID
                  </span>
                  <span className="mt-[0.2cqw]">{data.folio}</span>
                </div>

                <div className="flex gap-[3cqw]">
                  <div className="flex flex-col items-center w-[16cqw]">
                    <div className="w-full border-b border-slate-300 h-[2.5cqw] relative flex items-end justify-center">
                      <span className="font-serif italic text-[1.6cqw] text-[#005ea2] font-semibold leading-none pb-[0.2cqw]">
                        Lean Academy
                      </span>
                    </div>
                    <span className="text-[1cqw] font-extrabold text-slate-700 mt-[0.5cqw] leading-none">
                      Ing. Luis Hernández
                    </span>
                    <span className="text-[0.8cqw] font-bold text-slate-400 uppercase tracking-wider mt-[0.2cqw]">
                      Lean Academy Director
                    </span>
                  </div>

                  <div className="flex flex-col items-center w-[16cqw]">
                    <div className="w-full border-b border-slate-300 h-[2.5cqw] relative flex items-end justify-center">
                      <span className="font-serif italic text-[1.6cqw] text-[#005ea2] font-semibold leading-none pb-[0.2cqw]">
                        Philo B29
                      </span>
                    </div>
                    <span className="text-[1cqw] font-extrabold text-slate-700 mt-[0.5cqw] leading-none">
                      Dir. Alejandro Ruiz
                    </span>
                    <span className="text-[0.8cqw] font-bold text-slate-400 uppercase tracking-wider mt-[0.2cqw]">
                      Plant Manager
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Barra inferior Flex */}
            {!isCustom && (
              <div className="absolute bottom-0 left-0 w-full h-[6.5%] bg-gradient-to-r from-[#005ea2] to-[#0090e1] flex items-center justify-end px-[5%] box-border">
                <span className="text-[#ffffff] text-[2.2cqw] font-black italic tracking-tighter leading-none select-none">
                  flex
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Calificación Aprobatoria: {data.score}%</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Imagen (PNG)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

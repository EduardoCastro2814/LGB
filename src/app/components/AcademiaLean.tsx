'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Circle, 
  Clock, 
  HelpCircle, 
  Download, 
  User, 
  TrendingUp, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  BookOpenCheck,
  AlertCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  Course, 
  UserCourseProgress, 
  UserProgressMap, 
  Exam, 
  Question, 
  CertificateConfig, 
  MergedEmployee 
} from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface AcademiaLeanProps {
  user: MergedEmployee;
  courses: Course[];
  progress: UserProgressMap;
  exams: Exam[];
  onUpdateProgress: (courseId: string, updatedProgress: Partial<UserCourseProgress>) => void;
  certConfig: CertificateConfig;
}

// Diapositivas predeterminadas para los cursos si no tienen material cargado por el admin
const DEFAULT_SLIDES: Record<string, { title: string; content: string }[]> = {
  'lean-basics-1': [
    { title: 'Introducción a Lean Manufacturing', content: 'Lean es una filosofía de gestión enfocada en la reducción de los 8 tipos de desperdicios en procesos de manufactura y servicios, maximizando el valor entregado al cliente con el mínimo de recursos.' },
    { title: 'Los 8 Desperdicios (Mudas)', content: 'Los desperdicios son actividades que no agregan valor: 1. Transporte, 2. Inventario, 3. Movimiento, 4. Espera, 5. Sobreprocesamiento, 6. Sobreproducción, 7. Defectos, y 8. Talento no utilizado.' },
    { title: 'Valor Agregado (VA) vs No Agregado (NVA)', content: 'VA: Actividades por las que el cliente está dispuesto a pagar (cambian la forma, ajuste o función del producto). NVA: Desperdicio puro que debe ser eliminado inmediatamente.' },
    { title: 'El Ciclo PDCA (Deming)', content: 'Es la base de la mejora continua: Planificar (Plan), Hacer (Do), Verificar (Check) y Actuar (Act). Se repite de manera infinita para estandarizar procesos y resolver problemas.' }
  ],
  '5s-1': [
    { title: 'La Metodología de las 5S + 1', content: 'Es una práctica de calidad enfocada en organizar el lugar de trabajo, mantener el orden, la limpieza y la disciplina, sumando la Seguridad (+1) como prioridad transversal.' },
    { title: '1. Seiri (Clasificar) y 2. Seiton (Ordenar)', content: 'Clasificar: Separar lo necesario de lo innecesario en el área de trabajo y descartar esto último. Ordenar: Disponer los elementos necesarios para que se puedan encontrar y usar fácilmente (un lugar para cada cosa y cada cosa en su lugar).' },
    { title: '3. Seiso (Limpiar) y 4. Seiketsu (Estandarizar)', content: 'Limpiar: Eliminar la suciedad y realizar inspecciones detalladas para identificar anomalías. Estandarizar: Crear reglas visuales y procedimientos para mantener el estado de las primeras 3S.' },
    { title: '5. Shitsuke (Disciplina) y +1 Seguridad', content: 'Disciplina: Convertir en hábito el mantenimiento de los estándares establecidos. Seguridad: Identificar y mitigar actos y condiciones inseguras para garantizar cero accidentes en la línea de trabajo.' }
  ],
  '5-whys': [
    { title: 'Análisis de Causa Raíz (RCA)', content: 'El objetivo de la resolución de problemas es eliminar la causa raíz, no el síntoma. Si solo se ataca el síntoma, el problema volverá a ocurrir en el futuro.' },
    { title: 'La Técnica de los 5 Porqués', content: 'Consiste en preguntar "¿Por qué?" sucesivamente (típicamente 5 veces) ante una falla del proceso, hasta descubrir la raíz física, humana o de sistema que la originó.' },
    { title: 'Regla de Oro: Relación Causa-Efecto', content: 'Cada paso de la cadena de porqués debe tener un sustento lógico comprovable en el piso de producción (gemba). No asuma, verifique los hechos.' },
    { title: 'Acción Correctiva vs Acción Preventiva', content: 'Correctiva: Elimina la causa raíz identificada para evitar que el problema se repita. Preventiva: Aplica la misma solución a áreas o equipos similares para evitar la primera ocurrencia.' }
  ],
  '7-ways': [
    { title: 'Generación de Alternativas de Solución', content: 'Ante un problema complejo, la primera idea de solución no siempre es la mejor. La herramienta "7 Ways" obliga al equipo a pensar en 7 enfoques distintos de solución.' },
    { title: 'Metodología de Lluvia de Ideas Estructurada', content: '1. Definir el problema con claridad. 2. Aportar ideas sin juzgar inicialmente. 3. Clasificar los enfoques en al menos 7 categorías o formas distintas de resolución.' },
    { title: 'Matriz de Evaluación de Alternativas', content: 'Evaluar las 7 soluciones bajo criterios predefinidos como: Costo de implementación, Tiempo requerido, Impacto en calidad, Complejidad técnica y Seguridad.' },
    { title: 'Selección e Implementación', content: 'Seleccionar la mejor alternativa (o combinación de ellas) y generar un plan de acción Kaizen con responsables y fechas límite de ejecución.' }
  ],
  'sga-guide': [
    { title: 'Small Group Activities (SGA)', content: 'Las Actividades de Grupos Pequeños son círculos de control de calidad autoorganizados formados por personal operativo (DL) enfocados en resolver problemas de su área cotidiana.' },
    { title: 'Roles clave dentro del Equipo SGA', content: '1. Líder del Equipo: Coordina las reuniones y reporta avances. 2. Facilitador: Asesor metodológico (LGB/BB). 3. Miembros: Operadores que conocen el proceso real.' },
    { title: 'Pasos de un Proyecto SGA (Kaizen)', content: '1. Seleccionar el tema. 2. Entender el estado actual. 3. Analizar causas raíz. 4. Desarrollar e implementar contramedidas. 5. Estandarizar los resultados. 6. Presentar reporte final.' },
    { title: 'Reconocimiento y Estandarización', content: 'El éxito de SGA radica en celebrar los logros del personal operativo en foros corporativos, fomentando la cultura de mejora continua y el orgullo del trabajo bien hecho.' }
  ]
};

export default function AcademiaLean({
  user,
  courses,
  progress,
  exams,
  onUpdateProgress,
  certConfig,
}: AcademiaLeanProps) {
  const [activeTab, setActiveTab] = useState<'cursos' | 'progreso' | 'certificados' | 'perfil'>('cursos');
  
  // Estado para visualización de curso
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // Estado para el examen
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [examResult, setExamResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determinar si todos los cursos requeridos están aprobados
  const requiredCourseIds = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];
  const allCoursesCompleted = useMemo(() => {
    return requiredCourseIds.every(id => progress[id]?.examPassed === true);
  }, [progress]);

  // Manejar click en curso para empezar a leer
  const handleStartCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentSlideIndex(0);
    setActiveExam(null);
    setExamResult(null);
    setSelectedAnswers({});
    
    // Si no está iniciado, actualizar estado a en-progreso
    const currentProg = progress[course.id];
    if (!currentProg || currentProg.status === 'no-iniciado') {
      onUpdateProgress(course.id, {
        status: 'en-progreso',
        progress: 10,
      });
    }
  };

  // Navegar slides
  const handleNextSlide = () => {
    if (!selectedCourse) return;
    const slides = DEFAULT_SLIDES[selectedCourse.id] || [{ title: 'Sin contenido', content: 'No hay material disponible.' }];
    if (currentSlideIndex < slides.length - 1) {
      const nextIdx = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIdx);
      
      // Actualizar porcentaje de lectura progresivamente
      const currentProg = progress[selectedCourse.id];
      if (currentProg && !currentProg.contentViewed) {
        const pct = Math.round((nextIdx / (slides.length - 1)) * 90);
        onUpdateProgress(selectedCourse.id, {
          progress: Math.max(currentProg.progress, pct),
        });
      }
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // Finalizar lectura y habilitar examen
  const handleFinishReading = () => {
    if (!selectedCourse) return;
    onUpdateProgress(selectedCourse.id, {
      contentViewed: true,
      progress: 90, // Deja 10% para el examen
    });
  };

  // Iniciar examen
  const handleStartExam = () => {
    if (!selectedCourse) return;
    const exam = exams.find(e => e.courseId === selectedCourse.id);
    if (exam) {
      setActiveExam(exam);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setExamResult(null);
    } else {
      alert('Aviso: No hay examen disponible para este curso aún. Comuníquese con el administrador.');
    }
  };

  // Seleccionar respuesta de pregunta de examen
  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex,
    });
  };

  // Avanzar pregunta examen
  const handleNextQuestion = () => {
    if (activeExam && currentQuestionIndex < activeExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Calificar examen
  const handleSubmitExam = () => {
    if (!activeExam || !selectedCourse) return;

    let correctCount = 0;
    activeExam.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const totalQuestions = activeExam.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const minPassing = activeExam.minScore || 80;
    const passed = score >= minPassing;

    const currentProg = progress[selectedCourse.id] || { examAttempts: 0 };
    const attempts = (currentProg.examAttempts || 0) + 1;

    setExamResult({
      score,
      passed,
      correctCount,
      totalQuestions,
    });

    if (passed) {
      // Generar folio único para el certificado
      const randHex = Math.floor(100000 + Math.random() * 900000).toString();
      const folio = `LGB-${selectedCourse.id.substring(0, 3).toUpperCase()}-${randHex}`;
      const nowStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

      onUpdateProgress(selectedCourse.id, {
        status: 'completado',
        progress: 100,
        examPassed: true,
        examScore: score,
        examAttempts: attempts,
        completionDate: nowStr,
        certificateFolio: folio,
      });
    } else {
      onUpdateProgress(selectedCourse.id, {
        examPassed: false,
        examScore: score,
        examAttempts: attempts,
      });
    }
  };

  // Generar y descargar certificado
  const handleDownloadCertificate = (course: Course) => {
    const prog = progress[course.id];
    if (!prog || !prog.examPassed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 850;
    canvas.width = width;
    canvas.height = height;

    // 1. Dibujar Fondo de Certificado
    if (certConfig.background) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawDynamicText(ctx, course, prog);
        triggerDownload(canvas, course.name);
      };
      img.src = certConfig.background;
    } else {
      // Dibujar fondo elegante predeterminado
      ctx.fillStyle = '#0f172a'; // Oscuro elegante
      ctx.fillRect(0, 0, width, height);

      // Marco dorado doble
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 10;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, width - 90, height - 90);

      // Elementos visuales (Esquinas geométricas)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(46, 46, 120, 120);
      ctx.fillRect(width - 166, 46, 120, 120);
      ctx.fillRect(46, height - 166, 120, 120);
      ctx.fillRect(width - 166, height - 166, 120, 120);

      // Marca de agua de Lean
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 300px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LEAN', width / 2, height / 2);
      ctx.globalAlpha = 1.0;

      // Dibujar Textos
      drawDynamicText(ctx, course, prog);
      triggerDownload(canvas, course.name);
    }
  };

  const drawDynamicText = (
    ctx: CanvasRenderingContext2D, 
    course: Course, 
    prog: UserCourseProgress
  ) => {
    // Configuración por defecto para textos
    const defPositions = {
      nombreEmpleado: { x: 50, y: 38, fontSize: 42, color: '#ffffff', visible: true },
      numEmpleado: { x: 50, y: 46, fontSize: 18, color: '#94a3b8', visible: true },
      nombreCurso: { x: 50, y: 58, fontSize: 36, color: '#10b981', visible: true },
      fechaCompletado: { x: 30, y: 72, fontSize: 18, color: '#cbd5e1', visible: true },
      calificacion: { x: 70, y: 72, fontSize: 18, color: '#cbd5e1', visible: true },
      folio: { x: 50, y: 84, fontSize: 14, color: '#f59e0b', visible: true },
    };

    const p = certConfig.positions || {};
    
    // Helper para mapear posiciones relativas en porcentaje a pixeles en canvas de 1200x850
    const getCoords = (key: string, defX: number, defY: number, defF: number) => {
      const pKey = p[key as keyof typeof p];
      return {
        x: pKey?.x !== undefined ? (pKey.x / 100) * 1200 : (defX / 100) * 1200,
        y: pKey?.y !== undefined ? (pKey.y / 100) * 850 : (defY / 100) * 850,
        fontSize: pKey?.fontSize || defF,
        visible: pKey?.visible !== undefined ? pKey.visible : true,
      };
    };

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Título General Fijo
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('LEAN ACADEMY - PHILO B29 SITE', 600, 160);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText('Otorga el presente certificado de aprobación a:', 600, 220);

    // 2. Nombre del Empleado
    const nEmp = getCoords('nombreEmpleado', 50, 34, 42);
    if (nEmp.visible) {
      ctx.fillStyle = certConfig.textColor || '#ffffff';
      ctx.font = `bold ${nEmp.fontSize}px Georgia, serif`;
      ctx.fillText(user.Nombre, nEmp.x, nEmp.y);
    }

    // 3. Número de Empleado
    const numEmp = getCoords('numEmpleado', 50, 42, 18);
    if (numEmp.visible) {
      ctx.fillStyle = '#64748b';
      ctx.font = `semibold ${numEmp.fontSize}px sans-serif`;
      ctx.fillText(`Número de Empleado: ${user.ID}  |  Depto: ${user.Departamento}`, numEmp.x, numEmp.y);
    }

    // 4. Texto de Acreditación Fijo
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'normal 18px sans-serif';
    ctx.fillText('Por haber cursado, comprendido y aprobado satisfactoriamente la materia de:', 600, 440);

    // 5. Nombre del Curso
    const nCur = getCoords('nombreCurso', 50, 56, 36);
    if (nCur.visible) {
      ctx.fillStyle = '#10b981'; // Color verde de la academia
      ctx.font = `bold ${nCur.fontSize}px Georgia, serif`;
      ctx.fillText(course.name.toUpperCase(), nCur.x, nCur.y);
    }

    // 6. Fecha de Completación
    const fComp = getCoords('fechaCompletado', 30, 70, 18);
    if (fComp.visible) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `normal ${fComp.fontSize}px sans-serif`;
      ctx.fillText(`Fecha de Expedición: ${prog.completionDate || 'N/A'}`, fComp.x, fComp.y);
    }

    // 7. Calificación Obtenida
    const cal = getCoords('calificacion', 70, 70, 18);
    if (cal.visible) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `normal ${cal.fontSize}px sans-serif`;
      ctx.fillText(`Calificación: ${prog.examScore}% (Aprobado)`, cal.x, cal.y);
    }

    // 8. Folio Generado
    const fol = getCoords('folio', 50, 82, 14);
    if (fol.visible) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f59e0b';
      ctx.font = `bold ${fol.fontSize}px Courier New, monospace`;
      ctx.fillText(`Folio de Evidencia: ${prog.certificateFolio || 'N/A'}`, fol.x, fol.y);
    }
  };

  const triggerDownload = (canvas: HTMLCanvasElement, courseName: string) => {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `LGB_Certificado_${courseName.replace(/\s+/g, '_')}_${user.ID}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Error exportando certificado:', e);
      alert('No se pudo generar la descarga directa. Intente imprimir la pantalla o configurar el certificado.');
    }
  };

  // KPIs de Progreso del Alumno
  const userKPIs = useMemo(() => {
    const total = requiredCourseIds.length;
    let completed = 0;
    let enProgreso = 0;
    let noIniciado = 0;
    let sumScore = 0;
    let countScore = 0;

    requiredCourseIds.forEach((id) => {
      const cProg = progress[id];
      if (cProg) {
        if (cProg.status === 'completado') {
          completed++;
        } else if (cProg.status === 'en-progreso') {
          enProgreso++;
        } else {
          noIniciado++;
        }
        if (cProg.examScore !== null) {
          sumScore += cProg.examScore;
          countScore++;
        }
      } else {
        noIniciado++;
      }
    });

    const pctAvance = Math.round((completed / total) * 100);
    const avgScore = countScore > 0 ? Math.round(sumScore / countScore) : 0;

    return {
      total,
      completed,
      enProgreso,
      noIniciado,
      pctAvance,
      avgScore,
    };
  }, [progress]);

  // Datos para gráficos de Recharts
  const chartData = useMemo(() => {
    return [
      { name: 'Completados', value: userKPIs.completed, color: '#10b981' },
      { name: 'En Progreso', value: userKPIs.enProgreso, color: '#f59e0b' },
      { name: 'No Iniciados', value: userKPIs.noIniciado, color: '#ef4444' },
    ];
  }, [userKPIs]);

  const scoresChartData = useMemo(() => {
    return requiredCourseIds.map(id => {
      const course = courses.find(c => c.id === id);
      const cProg = progress[id];
      return {
        name: course ? course.name.substring(0, 12) + '...' : id,
        calificacion: cProg ? cProg.examScore || 0 : 0,
      };
    });
  }, [progress, courses]);

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in text-slate-805 dark:text-[#f8fafc]">
      
      {/* Canvas Oculto para Generar el Certificado */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Academia Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-[#f8fafc] flex items-center gap-2">
            🎓 Academia Lean Green Belt
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#cbd5e1] font-semibold uppercase mt-0.5 tracking-wider">
            Capacítate en manufactura esbelta, realiza exámenes y obtén tus certificados
          </p>
        </div>

        {allCoursesCompleted ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm animate-bounce">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>CERTIFICADO LEAN GREEN BELT</span>
          </span>
        ) : (
          <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl px-4 py-2 text-xs font-bold text-slate-650 dark:text-[#cbd5e1]">
            <span>Progreso General:</span>
            <span className="text-emerald-500 dark:text-emerald-400">{userKPIs.pctAvance}%</span>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      {!selectedCourse && (
        <div className="flex border-b border-slate-200 dark:border-[#334155] gap-4">
          {[
            { id: 'cursos', label: 'Mis Cursos', icon: BookOpen },
            { id: 'progreso', label: 'Mi Progreso', icon: TrendingUp },
            { id: 'certificados', label: 'Mis Certificados', icon: Award },
            { id: 'perfil', label: 'Mi Perfil', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  isActive 
                    ? 'border-emerald-500 text-emerald-500 dark:text-emerald-400 font-extrabold'
                    : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-[#cbd5e1]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: CURSOS */}
      {activeTab === 'cursos' && !selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const prog = progress[course.id] || { status: 'no-iniciado', progress: 0, examPassed: false };
            const statusLabel = prog.status === 'completado' 
              ? 'Completado' 
              : prog.status === 'en-progreso' 
                ? 'En progreso' 
                : 'No iniciado';
            
            return (
              <div 
                key={course.id} 
                className="glass-panel rounded-2.5xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] flex flex-col justify-between hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono bg-slate-100 dark:bg-[#273449] px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-[#334155]/50">
                      Orden: {course.order}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      prog.status === 'completado'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : prog.status === 'en-progreso'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                          : 'bg-slate-100 text-slate-400 dark:bg-[#273449] dark:text-slate-500 border-transparent'
                    }`}>
                      {prog.status === 'completado' ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-[#f8fafc] mb-2 group-hover:text-emerald-500 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-medium leading-relaxed mb-4">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-[#2d3a4f] space-y-4">
                  <div className="flex justify-between text-[11px] font-bold text-slate-450 dark:text-[#94a3b8]">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {course.duration}</span>
                    <span>Progreso: {prog.progress || 0}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#273449] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-505 ${
                        prog.status === 'completado' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${prog.progress || 0}%` }}
                    />
                  </div>

                  <button
                    onClick={() => handleStartCourse(course)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      prog.status === 'completado'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#273449] dark:hover:bg-[#2f3e58] dark:text-[#cbd5e1]'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                    }`}
                  >
                    <span>{prog.status === 'completado' ? 'Repasar Contenido' : prog.status === 'en-progreso' ? 'Continuar Curso' : 'Iniciar Curso'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: VISOR DE CURSO INDIVIDUAL (LECTURA / DIAPOSITIVAS) */}
      {activeTab === 'cursos' && selectedCourse && !activeExam && (
        <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] flex flex-col gap-6">
          
          {/* Header Visor */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-[#2d3a4f]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#273449] dark:hover:bg-[#2d3b52] text-slate-655 dark:text-[#cbd5e1] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[9px] font-bold tracking-widest text-emerald-500 uppercase">Módulo de Lectura</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-[#f8fafc]">{selectedCourse.name}</h3>
              </div>
            </div>

            {/* Requisito de Lectura / Estado Examen */}
            <div className="flex items-center gap-3">
              {progress[selectedCourse.id]?.contentViewed ? (
                <button
                  onClick={handleStartExam}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md cursor-pointer animate-pulse"
                >
                  <BookOpenCheck className="w-4 h-4" />
                  <span>Realizar Examen</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3.5 py-2 rounded-xl text-xs font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Finaliza la lectura para habilitar el examen</span>
                </div>
              )}
            </div>
          </div>

          {/* Diapositivas / Contenido de Lectura */}
          {(() => {
            const slides = DEFAULT_SLIDES[selectedCourse.id] || [{ title: 'Contenido Simulado', content: 'El administrador aún no ha cargado diapositivas para este curso.' }];
            const currentSlide = slides[currentSlideIndex];
            
            return (
              <div className="flex flex-col gap-6">
                
                {/* Diapositiva Principal */}
                <div className="aspect-[16/9] w-full max-w-4xl mx-auto rounded-3xl bg-slate-950 text-white p-8 flex flex-col justify-between border border-slate-800 relative shadow-2xl overflow-hidden select-none">
                  {/* Patrón de fondo */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1525,#0d1f39)] opacity-90" />
                  <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[80px]" />
                  
                  {/* Contenido Diapositiva */}
                  <div className="relative z-10">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-550 uppercase tracking-widest border-b border-slate-800/80 pb-3">
                      <span>Lean Academy B29</span>
                      <span className="text-emerald-400">{selectedCourse.name}</span>
                    </div>

                    <div className="mt-8 md:mt-12">
                      <h4 className="text-lg md:text-2xl font-extrabold text-white leading-tight">
                        {currentSlide.title}
                      </h4>
                      <p className="mt-4 md:mt-6 text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-3xl">
                        {currentSlide.content}
                      </p>
                    </div>
                  </div>

                  {/* Pie Diapositiva */}
                  <div className="relative z-10 flex justify-between items-center text-[10px] font-bold text-slate-500/80 border-t border-slate-800/80 pt-3">
                    <span>Material Oficial de Capacitación</span>
                    <span>Diapositiva {currentSlideIndex + 1} de {slides.length}</span>
                  </div>
                </div>

                {/* Controles Diapositiva */}
                <div className="flex justify-between items-center max-w-4xl w-full mx-auto">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#273449] disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-700 dark:text-[#cbd5e1]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex gap-1.5">
                    {slides.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          currentSlideIndex === idx ? 'w-6 bg-emerald-500' : 'w-2.5 bg-slate-200 dark:bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>

                  {currentSlideIndex === slides.length - 1 ? (
                    <button
                      onClick={handleFinishReading}
                      disabled={progress[selectedCourse.id]?.contentViewed}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                        progress[selectedCourse.id]?.contentViewed
                          ? 'bg-slate-100 text-slate-400 dark:bg-[#273449] cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{progress[selectedCourse.id]?.contentViewed ? 'Lectura Completada' : 'Finalizar Lectura'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextSlide}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-[#f8fafc] text-white dark:text-slate-900 hover:opacity-90 transition-all cursor-pointer"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sección de material complementario (Simulado) */}
                <div className="mt-4 pt-6 border-t border-slate-150 dark:border-[#2d3a4f] max-w-4xl w-full mx-auto">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-[#f8fafc] uppercase tracking-wider mb-3">
                    Material Complementario Cargado
                  </h4>
                  {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCourse.materials.map(mat => (
                        <div key={mat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#273449]/40 border border-slate-200/50 dark:border-[#334155]/50">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-500" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{mat.name}</p>
                              <span className="text-[9px] uppercase text-slate-400">{mat.type} {mat.size ? `(${mat.size})` : ''}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => alert(`Visualizando archivo adjunto: ${mat.name} (${mat.type})`)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400 dark:text-slate-500">
                      El administrador no ha adjuntado archivos PDF, PPT o Videos adicionales para este curso.
                    </p>
                  )}
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* VIEW: MODULO DE EXAMEN INTERACTIVO */}
      {activeTab === 'cursos' && selectedCourse && activeExam && (
        <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] flex flex-col gap-6">
          
          {/* Header Examen */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-[#2d3a4f]">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/15 p-2 rounded-xl text-emerald-500 dark:text-emerald-400">
                <HelpCircle className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[9px] font-bold tracking-widest text-emerald-500 uppercase">Evaluación del Módulo</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-[#f8fafc]">Examen de {selectedCourse.name}</h3>
              </div>
            </div>

            {!examResult && (
              <span className="text-xs font-bold text-slate-500 dark:text-[#cbd5e1] bg-slate-100 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl px-3 py-1.5">
                Calificación Mínima: {activeExam.minScore}%
              </span>
            )}
          </div>

          {/* CUERPO DEL EXAMEN */}
          {!examResult ? (
            <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
              
              {/* Progreso Preguntas */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-450 dark:text-slate-400 mb-2">
                  <span>Pregunta {currentQuestionIndex + 1} de {activeExam.questions.length}</span>
                  <span>{Math.round(((currentQuestionIndex + 1) / activeExam.questions.length) * 100)}% Completado</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-350"
                    style={{ width: `${((currentQuestionIndex + 1) / activeExam.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Caja de Pregunta */}
              {(() => {
                const currentQuestion = activeExam.questions[currentQuestionIndex];
                if (!currentQuestion) return <p>Cargando pregunta...</p>;

                return (
                  <div className="flex flex-col gap-5 animate-fade-in" key={currentQuestion.id}>
                    <h4 className="text-base font-bold text-slate-800 dark:text-[#f8fafc]">
                      {currentQuestion.text}
                    </h4>

                    {/* Opciones */}
                    <div className="flex flex-col gap-3">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                            className={`w-full text-left p-4.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 text-xs font-bold ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 border-slate-200 dark:border-[#334155] text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center border transition-all ${
                              isSelected 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-350 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Botones de navegación del examen */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-150 dark:border-[#2d3a4f] mt-4">
                      <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#273449] disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-700 dark:text-[#cbd5e1]"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      {currentQuestionIndex === activeExam.questions.length - 1 ? (
                        <button
                          onClick={handleSubmitExam}
                          disabled={Object.keys(selectedAnswers).length < activeExam.questions.length}
                          className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed shadow-md cursor-pointer transition-all"
                        >
                          <BookOpenCheck className="w-4 h-4" />
                          <span>Finalizar Examen</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-[#f8fafc] text-white dark:text-slate-900 hover:opacity-90 transition-all cursor-pointer"
                        >
                          <span>Siguiente</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })()}

            </div>
          ) : (
            /* FEEDBACK DE RESULTADOS DEL EXAMEN */
            <div className="max-w-md w-full mx-auto text-center flex flex-col items-center py-6 animate-fade-in">
              {examResult.passed ? (
                <>
                  <div className="bg-emerald-500/15 p-5 rounded-full border border-emerald-500/20 text-emerald-500 mb-6">
                    <Award className="w-16 h-16 animate-bounce" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-800 dark:text-[#f8fafc] mb-1">
                    ¡Felicidades, Aprobaste!
                  </h4>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">
                    ✅ Curso Aprobado
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-[#334155] rounded-2xl p-5 w-full mb-6 text-left space-y-2.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-[#94a3b8]">
                      <span>Calificación obtenida:</span>
                      <span className="text-emerald-500 text-sm font-extrabold">{examResult.score}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-[#94a3b8]">
                      <span>Preguntas correctas:</span>
                      <span className="text-slate-800 dark:text-[#cbd5e1]">{examResult.correctCount} de {examResult.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-[#94a3b8] pt-2 border-t border-slate-200/50 dark:border-[#334155]/50">
                      <span>Mínimo requerido:</span>
                      <span>{activeExam.minScore}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={() => handleDownloadCertificate(selectedCourse)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar Diploma</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        setActiveExam(null);
                        setExamResult(null);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#273449] transition-colors cursor-pointer text-slate-700 dark:text-[#cbd5e1]"
                    >
                      Volver a la Academia
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-red-500/15 p-5 rounded-full border border-red-500/20 text-red-500 mb-6">
                    <AlertCircle className="w-16 h-16 animate-pulse" />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-800 dark:text-[#f8fafc] mb-1">
                    Examen No Aprobado
                  </h4>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">
                    ❌ Curso Reprobado
                  </p>
                  <p className="text-xs text-slate-400 dark:text-[#94a3b8] font-medium leading-relaxed mb-6">
                    Has obtenido un score menor al 80% mínimo aprobatorio. Te sugerimos repasar las diapositivas del módulo e intentarlo nuevamente. ¡Tú puedes lograrlo!
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-[#334155] rounded-2xl p-5 w-full mb-6 text-left space-y-2.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-[#94a3b8]">
                      <span>Calificación obtenida:</span>
                      <span className="text-red-500 text-sm font-extrabold">{examResult.score}%</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-[#94a3b8]">
                      <span>Preguntas correctas:</span>
                      <span className="text-slate-800 dark:text-[#cbd5e1]">{examResult.correctCount} de {examResult.totalQuestions}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handleStartExam}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reintentar Examen</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(null);
                        setActiveExam(null);
                        setExamResult(null);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#273449] transition-colors cursor-pointer text-slate-700 dark:text-[#cbd5e1]"
                    >
                      Volver
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: MI PROGRESO */}
      {activeTab === 'progreso' && (
        <div className="flex flex-col gap-6">
          
          {/* Tarjetas resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Cursos Asignados', val: userKPIs.total, color: 'text-slate-800 dark:text-white', icon: BookOpen },
              { label: 'Cursos Aprobados', val: userKPIs.completed, color: 'text-emerald-500', icon: CheckCircle2 },
              { label: 'Promedio Exámenes', val: `${userKPIs.avgScore}%`, color: 'text-blue-500', icon: TrendingUp },
              { label: 'Estatus Lean Green Belt', val: allCoursesCompleted ? 'Certificado' : 'En Proceso', color: allCoursesCompleted ? 'text-emerald-500' : 'text-amber-500', icon: Award },
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="glass-panel rounded-2.5xl p-5 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                    <h3 className={`text-lg font-black ${kpi.color}`}>{kpi.val}</h3>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-750 text-slate-450 dark:text-slate-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráficos de Progreso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gráfico 1: Estado de Cursos (Torta) */}
            <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#f8fafc] mb-1">Estado General de Cursos</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Distribución de avance académico</p>
              </div>

              <div className="h-64 flex items-center justify-center mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Calificaciones por curso */}
            <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-[#f8fafc] mb-1">Calificaciones Obtenidas</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Resultados por materia aprobada</p>
              </div>

              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoresChartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '10px' }} />
                    <Bar dataKey="calificacion" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={35}>
                      {scoresChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.calificacion >= 80 ? '#10b981' : '#f59e0b'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: MIS CERTIFICADOS */}
      {activeTab === 'certificados' && (
        <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#f8fafc] mb-1">Mis Evidencias Individuales</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Diplomas descargables de materias acreditadas</p>
          </div>

          {requiredCourseIds.some(id => progress[id]?.examPassed) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => {
                const prog = progress[course.id];
                if (!prog || !prog.examPassed) return null;

                return (
                  <div 
                    key={course.id} 
                    className="p-5 rounded-2.5xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-[#334155] flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          FOLIO: {prog.certificateFolio}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {prog.completionDate}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1">
                        {course.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Calificación obtenida: <span className="font-bold text-emerald-500">{prog.examScore}%</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDownloadCertificate(course)}
                      className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Descargar Diploma (PNG)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-450 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Award className="w-12 h-12 stroke-1 text-slate-300 dark:text-slate-650 mx-auto mb-3" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Ningún diploma generado aún</h4>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                Aparecerán aquí las evidencias una vez que apruebes el examen de cada materia con un puntaje mínimo del 80%.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MI PERFIL */}
      {activeTab === 'perfil' && (
        <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] max-w-2xl mx-auto w-full">
          <div className="text-center pb-6 border-b border-slate-100 dark:border-[#2d3a4f] mb-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-emerald-500/15 mb-4 uppercase">
              {user.Nombre.charAt(0)}
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-[#f8fafc]">{user.Nombre}</h3>
            <p className="text-xs font-bold text-emerald-500 tracking-wider uppercase mt-1">Estatus: {user.Estatus}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
            {[
              { label: 'Número de Empleado', val: user.ID, font: 'font-mono' },
              { label: 'Departamento / Área', val: user.Departamento },
              { label: 'Puesto de Trabajo', val: user.Puesto || 'General DL' },
              { label: 'Manager Directo (N1)', val: user.Manager || 'N/A' },
              { label: 'Clasificación de Personal', val: user.TipoPersonal === 'DL' ? 'Mano de Obra Directa (DL)' : 'Mano de Obra Indirecta (IDL)' },
              { label: 'Plan de Certificación', val: 'Lean Green Belt (5 Materias)' },
            ].map((field, idx) => (
              <div key={idx} className="border-b border-slate-100/50 dark:border-[#2d3a4f]/50 pb-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">{field.label}</p>
                <p className={`font-bold text-slate-700 dark:text-slate-200 ${field.font || ''}`}>{field.val}</p>
              </div>
            ))}
          </div>

          {/* Estado Green Belt */}
          <div className="mt-8 p-5 rounded-2.5xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-[#334155]/50 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 border border-emerald-500/20">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-850 dark:text-white">Lean Green Belt (LGB) Status</h4>
              {allCoursesCompleted ? (
                <p className="text-[11px] font-bold text-emerald-500 mt-0.5">
                  🎉 ¡Felicidades! Has completado y aprobado el 100% de las materias requeridas. Eres oficialmente un **Lean Green Belt Certificado**.
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Avance: **{userKPIs.completed} de 5** materias obligatorias aprobadas. Completa todos los exámenes para obtener tu certificación Lean Green Belt.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

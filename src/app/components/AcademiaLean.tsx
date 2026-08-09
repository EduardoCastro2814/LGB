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
  Sparkles,
  X,
  FileText
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
    { 
      title: '1. Bienvenida y objetivos', 
      content: '¡Bienvenidos al curso de Lean Basics 1!\n\nEste curso está diseñado especialmente para nuestro personal operativo (DL).\n\nObjetivos del curso:\n• Aprender qué es la filosofía Lean de manera muy sencilla.\n• Entender la diferencia entre agregar valor y generar desperdicios.\n• Conocer las herramientas clave: 5S+1, VSM y Supermercados.\n• Aprender cómo proponer ideas de mejora en tu área de trabajo (Kaizen).' 
    },
    { 
      title: '2. ¿Qué es Lean? (Pensamiento Esbelto)', 
      content: 'Es una forma de trabajar enfocada en eliminar lo que no sirve (desperdicio) para concentrarnos en lo que el cliente realmente valora.\n\nIdeas principales:\n• Nació para facilitarnos el trabajo, no para hacernos trabajar más rápido.\n• Busca que las actividades fluyan sin interrupciones.\n• Su meta es lograr la máxima calidad y seguridad con el mínimo de recursos.\n• Elimina el esfuerzo innecesario de los operadores.' 
    },
    { 
      title: '3. Los 5 Principios Lean', 
      content: 'Son las cinco reglas básicas para guiar la mejora continua en planta:\n\n• 1. Especificar el Valor: Definir qué es lo que el cliente quiere y paga.\n• 2. Mapear el Flujo de Valor: Identificar todos los pasos y ver dónde se traba.\n• 3. Crear Flujo Continuo: Hacer que el material avance de un paso a otro sin detenerse.\n• 4. Sistema Pull (Jalar): Producir solo cuando el cliente o el siguiente proceso lo pide.\n• 5. Buscar la Perfección: Trabajar en mejorar un poco todos los días.' 
    },
    { 
      title: '4. Historia de Lean y sus Creadores', 
      content: 'Lean se originó en Japón, en las fábricas de Toyota (TPS), buscando competir con la producción en masa de EE.UU.:\n\n• Sakichi Toyoda: Inventó el concepto "Jidoka" (máquinas inteligentes que detectan errores y se detienen solas).\n• Kiichiro Toyoda: Impulsó el concepto "Justo a Tiempo" (producir solo lo necesario).\n• Taiichi Ohno: Diseñó el sistema de Supermercados Lean para controlar materiales.\n• Shigeo Shingo: Creó los "Poka-Yokes" (dispositivos físicos a prueba de errores).' 
    },
    { 
      title: '5. Valor Agregado vs Desperdicio', 
      content: 'En tu día a día en la estación de trabajo, realizas dos tipos de actividades:\n\n• Valor Agregado (VA):\n  Actividades que transforman el producto y por las cuales el cliente paga.\n  *Ejemplos: Ensamblar componentes, soldar, colocar tornillos.*\n\n• Desperdicio (No Valor Agregado - NVA):\n  Actividades que consumen tiempo y esfuerzo pero no aportan nada al producto.\n  *Ejemplos: Buscar herramientas, esperar material, reparar piezas.*' 
    },
    { 
      title: '6. Los 8 Desperdicios Lean (Mudas)', 
      content: 'Son los 8 enemigos del flujo eficiente en piso de producción (TIMWOODS):\n\n• T - Transporte: Mover materiales de un lado a otro innecesariamente.\n• I - Inventario: Acumulación excesiva de materia prima o piezas (WIP).\n• M - Movimiento: Caminar, agacharse o estirarse de más por mala organización.\n• W - Espera: Operador o máquina parados por falta de material o información.\n• O - Sobreproducción: Hacer más piezas o antes de que se necesiten.\n• O - Sobreprocesamiento: Hacer tareas adicionales que el cliente no pidió.\n• D - Defectos: Generar scrap o tener que re-trabajar piezas.\n• S - Talento No Utilizado: No escuchar ni aprovechar las ideas de mejora del operador.' 
    },
    { 
      title: '7. Ejemplos de Desperdicios en Planta', 
      content: 'Veamos cómo se ven los desperdicios en nuestro piso de trabajo real:\n\n• Transporte: Mover palets vacíos o llevar materiales a almacenes lejanos.\n• Inventario: Cerros de cajas acumuladas entre estaciones bloqueando pasillos.\n• Movimiento: Buscar la soldadura o las pinzas porque no tienen un lugar fijo.\n• Espera: Estar parado en la línea porque la máquina está descompuesta o falta material.\n• Sobreproducción: Hacer ensambles de más "por si acaso" llenando la mesa de trabajo.\n• Defectos: Reparar una tarjeta con componentes mal soldados.' 
    },
    { 
      title: '8. Introducción a la Metodología 5S+1', 
      content: 'Es la herramienta fundamental para tener un área de trabajo ordenada, limpia y libre de peligros.\n\n¿Por qué es importante para ti?\n• Hace que cualquier problema o anomalía sea visible al instante.\n• Reduce el tiempo perdido buscando herramientas o materiales.\n• Evita el estrés y el cansancio físico innecesario.\n• La Seguridad (+1) se coloca en el centro para proteger tu integridad física.' 
    },
    { 
      title: '9. Los Pasos de las 5S+1', 
      content: 'Consiste en 5 palabras en japonés más el enfoque de seguridad:\n\n• 1. Clasificar (Seiri): Separar lo útil de lo inútil y retirar lo que no sirve.\n• 2. Ordenar (Seiton): Un lugar para cada cosa y cada cosa en su lugar.\n• 3. Limpiar (Seiso): Limpiar a fondo e inspeccionar las máquinas para detectar fallas.\n• 4. Estandarizar (Seiketsu): Señalar visualmente las reglas de orden y limpieza.\n• 5. Disciplina (Shitsuke): Convertir los pasos anteriores en un hábito diario.\n• +1. Seguridad: Eliminar condiciones de riesgo (cables sueltos, EPP incompleto).' 
    },
    { 
      title: '10. Mapeo del Flujo de Valor (VSM)', 
      content: 'Es un diagrama visual que dibuja todo el proceso de un producto, desde el proveedor hasta el cliente final:\n\n¿Qué nos muestra?\n• El flujo físico de los materiales (cómo se mueven).\n• El flujo de información (órdenes de trabajo, programación).\n• Los cuellos de botella y áreas donde el material se estanca.\n• Los tiempos de valor agregado (ensamble) vs. tiempos de desperdicio (esperas).' 
    },
    { 
      title: '11. El Supermercado Lean', 
      content: 'Es un almacén controlado y cercano a la línea que funciona como un supermercado comercial:\n\n• Regla FIFO (PEPS): Primero en entrar, primero en salir (evita material viejo).\n• Surtido por "Water Spider": Persona dedicada a reponer stock según se consume.\n• Las 5 Reglas del "NO":\n  1. NO pensar (todo está señalizado con Kanban).\n  2. NO buscar (cada componente tiene su sitio exacto).\n  3. NO esperar (surtido asegurado).\n  4. NO escribir (sistema visual sin papeleo).\n  5. NO contar (cantidades máximas y mínimas visibles).' 
    },
    { 
      title: '12. Kaizen: Mejora Continua en tu Día a Día', 
      content: 'Kaizen significa "Cambio para mejor" (Kai = Cambio, Zen = Bueno):\n\nPrincipios clave:\n• Pequeños cambios diarios sumados logran grandes resultados a largo plazo.\n• Regla de los 3 Gen (Gemba, Genbutsu, Genjitsu): Ir al lugar de trabajo real, observar la pieza/máquina real y analizar los datos y hechos reales.\n• Cultura de Calidad: No recibas defectos, no fabriques defectos, no pases defectos.\n• ¡Cualquier operador puede proponer una idea Kaizen!' 
    },
    { 
      title: '13. ¿Cómo aplicamos Lean en Flex?', 
      content: 'En Flex construimos la "Casa Flex Lean Enterprise" (FLE):\n\n• Cimientos: Estandarización, 5S+1 y Supermercados en todas las líneas.\n• Pilares:\n  - Justo a Tiempo (JIT): Takt Time (ritmo del cliente) y flujo pieza por pieza.\n  - Jidoka: Detener la línea ante cualquier falla para corregir el problema de raíz.\n• Tu participación:\n  - Proponer ideas en el SGA (Actividades de Grupos Pequeños).\n  - Participar activamente en los talleres Kaizen de tu línea.' 
    },
    { 
      title: '14. Resumen y Preparación para tu Examen', 
      content: 'Repasemos los aprendizajes más importantes antes de evaluar tu conocimiento:\n\n• El foco de Lean es eliminar desperdicios (Mudas) para dar valor al cliente.\n• Aplica la autodisciplina y mantén tus 5S+1 al inicio y fin de tu turno.\n• Respeta las señales Kanban y el flujo FIFO del Supermercado.\n• Participa, tu opinión en el piso es la más valiosa para mejorar.\n• El examen consta de 10 preguntas. Requiere 80% para aprobar (8 correctas).\n\n¡Muchas gracias por tu compromiso con la mejora continua!' 
    }
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
  
  // Estado para previsualización interactiva de certificado
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCertCourse, setSelectedCertCourse] = useState<Course | null>(null);
  
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

  const isCustom = !!certConfig.background && certConfig.useCustomTemplate !== false;

  React.useEffect(() => {
    if (showCertModal && selectedCertCourse) {
      const activeId = isCustom ? "custom-template" : "corporate-standard";
      const activeName = isCustom ? (certConfig.templateName || "Personalizada") : "Plantilla Corporativa Estándar";
      const activeUrl = isCustom ? (certConfig.templateUrl || "Base64") : "Interno";

      console.log(`[LGB TEMPLATE LOG] Modal de Certificado (Vista Previa Alumno):
Template Activa:
ID: ${activeId}
Nombre: ${activeName}
URL: ${activeUrl ? activeUrl.substring(0, 80) + '...' : 'N/A'}

Template usada para render:
ID: ${activeId}
Nombre: ${activeName}
URL: ${activeUrl ? activeUrl.substring(0, 80) + '...' : 'N/A'}`);
    }
  }, [showCertModal, selectedCertCourse, isCustom, certConfig]);

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

  // Generar y descargar certificado (PNG)
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

    // Loguear plantilla utilizada para generación
    const activeId = isCustom ? "custom-template" : "corporate-standard";
    const activeName = isCustom ? (certConfig.templateName || "Personalizada") : "Plantilla Corporativa Estándar";
    const activeUrl = isCustom ? (certConfig.templateUrl || "Base64") : "Interno";
    const logData = { id: activeId, name: activeName, url: activeUrl };
    localStorage.setItem('lgb_generation_log', JSON.stringify(logData));
    
    console.log(`[LGB TEMPLATE LOG] Generación PNG (Descarga):
Template Activa:
ID: ${activeId}
Nombre: ${activeName}
URL: ${activeUrl ? activeUrl.substring(0, 80) + '...' : 'N/A'}

Template usada para render:
ID: ${activeId}
Nombre: ${activeName}
URL: ${activeUrl ? activeUrl.substring(0, 80) + '...' : 'N/A'}`);

    const runRender = () => {
      drawDynamicText(ctx, course, prog);
    };

    if (isCustom) {
      // Cargar fondo personalizado de forma asíncrona
      const bgImg = new Image();
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, width, height);
        runRender();
      };
      bgImg.src = certConfig.background;
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

      // Inner solid circle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 8, 0, Math.PI * 2);
      ctx.stroke();

      // Seal text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('FLEX LEAN', centerX, centerY - 22);
      ctx.font = 'black 22px sans-serif';
      ctx.fillText('LGB', centerX, centerY);
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('ENTERPRISE', centerX, centerY + 22);

      runRender();
    }
  };

  const drawDynamicText = (
    ctx: CanvasRenderingContext2D, 
    course: Course, 
    prog: UserCourseProgress
  ) => {
    const width = 1200;
    const height = 850;

    // Utiliza isCustom del componente

    // Helper para posiciones relativas en porcentaje
    const p = certConfig.positions || {};
    const getCoords = (key: string, defX: number, defY: number, defF: number) => {
      const pKey = p[key as keyof typeof p];
      return {
        x: pKey?.x !== undefined ? (pKey.x / 100) * width : (defX / 100) * width,
        y: pKey?.y !== undefined ? (pKey.y / 100) * height : (defY / 100) * height,
        fontSize: pKey?.fontSize || defF,
        visible: pKey?.visible !== undefined ? pKey.visible : true,
      };
    };

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // A. Títulos fijos estilo Flex Recognition (solo si no es personalizado)
    if (!isCustom) {
      ctx.fillStyle = '#007fc4';
      ctx.font = 'black 64px sans-serif';
      ctx.fillText('RECOGNITION', 600, 150);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Lean Academy Certification Program', 600, 205);

      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText('Awarded to:', 600, 265);
    }

    // B. Nombre del Empleado
    const nEmp = getCoords('nombreEmpleado', 50, 34, 42);
    if (nEmp.visible) {
      ctx.fillStyle = certConfig.textColor || '#0f172a';
      ctx.font = `bold ${nEmp.fontSize}px Georgia, serif`;
      ctx.fillText(user.Nombre, nEmp.x, nEmp.y);
    }

    // D. Texto de Acreditación Fijo (solo si no es personalizado)
    if (!isCustom) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 18px sans-serif';
      ctx.fillText('For successfully completing and demonstrating proficiency in:', 600, 440);
    }

    // E. Nombre del Curso
    const nCur = getCoords('nombreCurso', 50, 56, 36);
    if (nCur.visible) {
      ctx.fillStyle = '#0284c7';
      ctx.font = `bold ${nCur.fontSize}px Georgia, serif`;
      ctx.fillText(course.name.toUpperCase(), nCur.x, nCur.y);
    }

    // F. Fecha de Completado
    const fComp = getCoords('fechaCompletado', 30, 70, 18);
    if (fComp.visible) {
      ctx.fillStyle = '#475569';
      ctx.font = `bold ${fComp.fontSize}px sans-serif`;
      ctx.fillText(`Completion Date: ${prog.completionDate}`, fComp.x, fComp.y);
    }

    // H. Folio
    const fol = getCoords('folio', 50, 82, 14);
    if (fol.visible) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = `bold ${fol.fontSize}px Courier New, monospace`;
      ctx.fillText(`ID: ${prog.certificateFolio}`, fol.x, fol.y);
    }

    // I. Firmas Digitales (solo si no es personalizado)
    if (!isCustom) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(680, 680);
      ctx.lineTo(880, 680);
      ctx.stroke();

      ctx.fillStyle = '#005ea2';
      ctx.font = 'italic 24px Georgia, serif';
      ctx.fillText('Lean Academy', 780, 665);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Ing. Luis Hernández', 780, 700);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Lean Academy Director', 780, 720);

      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(930, 680);
      ctx.lineTo(1130, 680);
      ctx.stroke();

      ctx.fillStyle = '#005ea2';
      ctx.font = 'italic 24px Georgia, serif';
      ctx.fillText('Philo B29', 1030, 665);

      ctx.fillStyle = '#334155';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Dir. Alejandro Ruiz', 1030, 700);
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Plant Manager', 1030, 720);
    }

    // J. Barra inferior con degradado y logo (solo si no es personalizado)
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

    // Descarga directa sin QR
    triggerDownload(canvasRef.current!, course.name);
  };

  // Imprimir Certificado en PDF
  const handlePrintCertificate = (course: Course) => {
    const prog = progress[course.id];
    if (!prog || !prog.examPassed) return;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      `Folio: ${prog.certificateFolio}\nColaborador: ${user.Nombre} (${user.ID})\nCurso: ${course.name}\nFecha: ${prog.completionDate}\nEstatus: Certificado`
    )}`;

    const p = certConfig.positions || {};

    // Loguear plantilla utilizada para generación
    const activeId = isCustom ? "custom-template" : "corporate-standard";
    const activeName = isCustom ? (certConfig.templateName || "Personalizada") : "Plantilla Corporativa Estándar";
    const activeUrl = isCustom ? (certConfig.templateUrl || "Base64") : "Interno";
    const logData = { id: activeId, name: activeName, url: activeUrl };
    localStorage.setItem('lgb_generation_log', JSON.stringify(logData));
    
    console.log(`[LGB TEMPLATE LOG] Generación PDF (Impresión):
Template Activa:
ID: ${activeId}
Nombre: ${activeName}
URL: ${activeUrl ? activeUrl.substring(0, 80) + '...' : 'N/A'}

Template usada para render:
ID: ${activeId}
Nombre: ${activeName}
URL: ${activeUrl ? activeUrl.substring(0, 80) + '...' : 'N/A'}`);

    const certificateContainerStyle = isCustom
      ? `background-image: url('${certConfig.background}'); background-size: 100% 100%; background-repeat: no-repeat;`
      : `background-color: #f8fafc;`;

    // Renderizar cuerpo del certificado en base a si es personalizado o estándar
    const certificateBody = isCustom
      ? `
          <div class="certificate-container" style="${certificateContainerStyle}">
            ${p.nombreEmpleado?.visible !== false ? `<div class="dynamic-text employee-name" style="left: ${p.nombreEmpleado?.x || 50}%; top: ${p.nombreEmpleado?.y || 34}%; font-size: ${((p.nombreEmpleado?.fontSize || 42) / 1200) * 297}mm; color: ${certConfig.textColor || '#0f172a'}; font-family: Georgia, serif;">${user.Nombre}</div>` : ''}
            
            ${p.nombreCurso?.visible !== false ? `<div class="dynamic-text course-name" style="left: ${p.nombreCurso?.x || 50}%; top: ${p.nombreCurso?.y || 56}%; font-size: ${((p.nombreCurso?.fontSize || 36) / 1200) * 297}mm; color: #0284c7; font-family: Georgia, serif; text-transform: uppercase;">${course.name}</div>` : ''}
            
            ${p.fechaCompletado?.visible !== false ? `<div class="dynamic-text completion-date" style="left: ${p.fechaCompletado?.x || 30}%; top: ${p.fechaCompletado?.y || 70}%; font-size: ${((p.fechaCompletado?.fontSize || 18) / 1200) * 297}mm; color: #475569;">Completion Date: ${prog.completionDate}</div>` : ''}
            
            ${p.folio?.visible !== false ? `<div class="dynamic-text evidence-id" style="left: ${p.folio?.x || 50}%; top: ${p.folio?.y || 82}%; font-size: ${((p.folio?.fontSize || 14) / 1200) * 297}mm; color: #64748b; font-family: monospace;">ID: ${prog.certificateFolio}</div>` : ''}
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
              <h2 class="employee-name" style="font-size: ${((p.nombreEmpleado?.fontSize || 42) / 1200) * 297}mm; color: ${certConfig.textColor || '#0f172a'};">${user.Nombre}</h2>
              
              <div class="proficiency-text">For successfully completing and demonstrating proficiency in:</div>
              <h3 class="course-name" style="font-size: ${((p.nombreCurso?.fontSize || 36) / 1200) * 297}mm;">${course.name}</h3>
              
              <div class="stats-row" style="font-size: ${((p.fechaCompletado?.fontSize || 18) / 1200) * 297}mm;">
                <span>Completion Date: ${prog.completionDate}</span>
              </div>
            </div>
            
            <div class="bottom-row">
              <div class="evidence-id-container" style="font-size: ${((p.folio?.fontSize || 14) / 1200) * 297}mm;">
                <span>ID:</span>
                <span>${prog.certificateFolio}</span>
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
      <html>
        <head>
          <title>Certificado - ${course.name}</title>
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
            
            /* Clases para posicionamiento dinámico */
            .dynamic-text {
              position: absolute;
              transform: translate(-50%, -50%);
              text-align: center;
              white-space: nowrap;
              font-weight: bold;
            }
            .qr-code-custom {
              position: absolute;
              bottom: 22mm;
              left: 18mm;
              width: 26mm;
              height: 26mm;
              border: 0.3mm solid #cbd5e1;
              padding: 1mm;
              background-color: #ffffff;
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
              margin-bottom: 8mm;
            }
            .awarded-to {
              font-size: 4.2mm;
              color: #64748b;
              font-style: italic;
              margin-bottom: 2mm;
            }
            .employee-name {
              margin: 0 0 1.5mm 0;
              font-family: Georgia, serif;
              font-weight: 800;
            }
            .employee-details {
              color: #475569;
              font-weight: 700;
              margin-bottom: 8mm;
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
              gap: 6mm;
              color: #475569;
              font-weight: 700;
              margin-bottom: 10mm;
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
            .qr-code {
              width: 26mm;
              height: 26mm;
              border: 0.3mm solid #cbd5e1;
              padding: 1mm;
              background-color: #ffffff;
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
      alert('Por favor permita las ventanas emergentes para poder imprimir el certificado.');
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
                      <p className="mt-4 md:mt-6 text-sm md:text-base text-slate-300 font-medium leading-relaxed max-w-3xl whitespace-pre-line">
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
                      onClick={() => {
                        setSelectedCertCourse(selectedCourse);
                        setShowCertModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md cursor-pointer transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      <span>Ver Diploma de Reconocimiento</span>
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
                      onClick={() => {
                        setSelectedCertCourse(course);
                        setShowCertModal(true);
                      }}
                      className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer transition-colors"
                    >
                      <Award className="w-4.5 h-4.5" />
                      <span>Ver Certificado de Reconocimiento</span>
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

      {/* MODAL DE PREVISUALIZACIÓN INTERACTIVA DE CERTIFICADO */}
      {showCertModal && selectedCertCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col">
            
            {/* Cabecera del modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Certificado de Reconocimiento</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Lean Academy Program - Philo B29 Site</p>
              </div>
              <button
                onClick={() => {
                  setShowCertModal(false);
                  setSelectedCertCourse(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido / Lienzo del Diploma */}
            <div className="p-6 bg-slate-100/50 dark:bg-slate-900/20 flex flex-col items-center gap-6 overflow-x-auto">
              
              {/* Diploma A4 Landscape */}
              <div 
                id="printable-certificate-element"
                className="w-full min-w-[700px] aspect-[297/210] relative bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/40 shadow-lg select-none @container"
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
                      <span className="text-[0.6cqw] font-extrabold uppercase tracking-wide opacity-90 mt-[10%]">Flex Lean</span>
                      <span className="text-[1.8cqw] font-black leading-none my-[4%]">LGB</span>
                      <span className="text-[0.55cqw] font-bold uppercase tracking-wide opacity-90">Enterprise</span>
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

                {/* TEXTOS DINÁMICOS SOBREIMPRESOS EN VIVO O SEGÚN POSICIONES */}
                {Object.entries(certConfig.positions || {}).map(([key, pos]) => {
                  if (!pos.visible) return null;
                  if (key === 'numEmpleado' || key === 'calificacion') return null;

                  const getText = (k: string) => {
                    switch (k) {
                      case 'nombreEmpleado': return user.Nombre;
                      case 'nombreCurso': return selectedCertCourse.name.toUpperCase();
                      case 'fechaCompletado': return `Completion Date: ${progress[selectedCertCourse.id]?.completionDate || ''}`;
                      case 'folio': return `ID: ${progress[selectedCertCourse.id]?.certificateFolio || ''}`;
                      default: return '';
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
                    color: key === 'nombreCurso' ? '#0284c7' : (key === 'folio' ? '#64748b' : (certConfig.textColor || '#0f172a')),
                    fontFamily: (key === 'nombreEmpleado' || key === 'nombreCurso') ? 'Georgia, serif' : 'sans-serif',
                  };
 
                  return (
                    <div key={key} style={style} className="pointer-events-none rounded px-2.5 py-0.5 border border-transparent">
                      {txt}
                    </div>
                  );
                })}
 
                {/* Fila inferior con firmas (siempre visibles, pero ajustándose a si es personalizado) */}
                <div className="absolute bottom-[9%] left-0 w-full px-[6%] box-border flex items-end justify-between pointer-events-none">
                  {/* ID */}
                  {!isCustom && (
                    <div className="flex flex-col items-center font-mono text-[0.9cqw] text-slate-400 font-bold">
                      <span className="uppercase text-[0.8cqw] tracking-wider font-sans font-semibold text-slate-400/80">ID</span>
                      <span className="mt-[0.2cqw]">{progress[selectedCertCourse.id]?.certificateFolio}</span>
                    </div>
                  )}

                  {/* Firmas */}
                  {!isCustom && (
                    <div className="flex gap-[3cqw]">
                      <div className="flex flex-col items-center w-[16cqw]">
                        <div className="w-full border-b border-slate-300 h-[2.5cqw] relative flex items-end justify-center">
                          <span className="font-serif italic text-[1.6cqw] text-[#005ea2] font-semibold leading-none pb-[0.2cqw]">Lean Academy</span>
                        </div>
                        <span className="text-[1cqw] font-extrabold text-slate-700 mt-[0.5cqw] leading-none">Ing. Luis Hernández</span>
                        <span className="text-[0.8cqw] font-bold text-slate-400 uppercase tracking-wider mt-[0.2cqw]">Lean Academy Director</span>
                      </div>

                      <div className="flex flex-col items-center w-[16cqw]">
                        <div className="w-full border-b border-slate-300 h-[2.5cqw] relative flex items-end justify-center">
                          <span className="font-serif italic text-[1.6cqw] text-[#005ea2] font-semibold leading-none pb-[0.2cqw]">Philo B29</span>
                        </div>
                        <span className="text-[1cqw] font-extrabold text-slate-700 mt-[0.5cqw] leading-none">Dir. Alejandro Ruiz</span>
                        <span className="text-[0.8cqw] font-bold text-slate-400 uppercase tracking-wider mt-[0.2cqw]">Plant Manager</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra inferior Flex */}
                {!isCustom && (
                  <div className="absolute bottom-0 left-0 w-full h-[6.5%] bg-gradient-to-r from-[#005ea2] to-[#0090e1] flex items-center justify-end px-[5%] box-border">
                    <span className="text-[#ffffff] text-[2.2cqw] font-black italic tracking-tighter leading-none select-none">flex</span>
                  </div>
                )}
              </div>

              {/* Canvas oculto para descarga PNG */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleDownloadCertificate(selectedCertCourse)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-white shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Imagen (PNG)</span>
              </button>
              <button
                onClick={() => handlePrintCertificate(selectedCertCourse)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

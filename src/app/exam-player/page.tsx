'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Award, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  BookOpen,
  LayoutList,
  Layers,
  HelpCircle,
  History,
  Sparkles
} from 'lucide-react';
import { getAssetPath } from '../utils/paths';
import { 
  saveSupabaseUserProgress, 
  saveSupabaseCertificate, 
  updateSupabaseEmployeeDetails
} from '../utils/supabaseService';
import { MergedEmployee, Course, Exam, Question, UserCourseProgress, ExamAttempt } from '../types';
import officialExams from '@/data/exams.json';

function ExamPlayerContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [currentUser, setCurrentUser] = useState<MergedEmployee | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [attemptsCount, setAttemptsCount] = useState(0);

  // Modo de visualización: paso a paso o cuestionario completo
  const [viewMode, setViewMode] = useState<'stepped' | 'full'>('stepped');

  // Estados del examen
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [examResult, setExamResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    incorrectCount: number;
    totalQuestions: number;
  } | null>(null);

  // Filtro de revisión en pantalla de resultados
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  // Cargar datos al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('lgb_logged_in_user');
    const savedCourses = localStorage.getItem('lgb_courses_list');
    const savedExams = localStorage.getItem('lgb_exams_list');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
    
    // Validar si los exámenes en localStorage tienen la versión oficial completa
    if (savedExams) {
      const parsed = JSON.parse(savedExams) as Exam[];
      const isValid = parsed.length >= (officialExams as any).length &&
        parsed.every(e => e.questions && e.questions.length >= 10 && e.questions.some(q => !!q.explanation));
      if (isValid) {
        setExams(parsed);
      } else {
        setExams(officialExams as unknown as Exam[]);
      }
    } else {
      setExams(officialExams as unknown as Exam[]);
    }

    setLoading(false);
  }, []);

  // Redirigir si no está logueado o falta courseId
  useEffect(() => {
    if (!loading && (!currentUser || !courseId)) {
      window.location.href = getAssetPath('/');
    }
  }, [currentUser, courseId, loading]);

  // Obtener curso y examen correspondientes
  const currentCourse = useMemo(() => {
    return courses.find(c => c.id === courseId) || null;
  }, [courses, courseId]);

  const activeExam = useMemo(() => {
    const fromList = exams.find(e => e.courseId === courseId);
    if (fromList) return fromList;
    return (officialExams as unknown as Exam[]).find(e => e.courseId === courseId) || null;
  }, [exams, courseId]);

  const questions = useMemo(() => {
    return activeExam?.questions || [];
  }, [activeExam]);

  if (loading || !currentUser || !currentCourse || !activeExam) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0082c8]" />
          <p className="text-sm font-semibold tracking-wider text-slate-400">Cargando Evaluación...</p>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleSubmitExam = async () => {
    if (!currentUser || !courseId || !activeExam) return;

    if (!isAllAnswered) {
      const pendingCount = questions.length - answeredCount;
      const confirmSubmit = confirm(
        `Tienes ${pendingCount} pregunta(s) sin responder. Las preguntas no contestadas se calificarán como incorrectas.\n\n¿Deseas finalizar la evaluación de todas formas?`
      );
      if (!confirmSubmit) return;
    }

    let correctCount = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length || 10;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const minPassing = activeExam.minScore || 80;
    const passed = score >= minPassing;
    const incorrectCount = totalQuestions - correctCount;

    const result = {
      score,
      passed,
      correctCount,
      incorrectCount,
      totalQuestions
    };

    setExamResult(result);

    // 1. Obtener progreso anterior
    const savedTraining = localStorage.getItem('lgb_training_state');
    const trainingState = savedTraining ? JSON.parse(savedTraining) : {};
    const userProgMap = trainingState[currentUser.ID] || {};
    const prevProg = userProgMap[courseId] || { examAttempts: 0, contentViewed: false };
    
    const attempts = (prevProg.examAttempts || 0) + 1;
    setAttemptsCount(attempts);
    const now = new Date().toISOString();
    
    let folio = prevProg.certificateFolio || null;
    if (passed && !folio) {
      const randHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
      folio = `LGB-${courseId.substring(0, 3).toUpperCase()}-${randHex}`;
    }

    const failedThreeTimes = !passed && (attempts % 3 === 0);

    // Requerimiento 6: El curso solo debe marcarse como completado cuando:
    // 1) El usuario haya visualizado el contenido (contentViewed)
    // 2) Y además haya aprobado el examen (passed)
    const isContentViewed = prevProg.contentViewed === true;
    const isCompleted = passed && isContentViewed;

    const updatedProg: UserCourseProgress = {
      status: isCompleted ? 'completado' : 'en-progreso',
      progress: isCompleted ? 100 : (passed ? 95 : (failedThreeTimes ? 10 : Math.max(prevProg.progress || 0, 80))),
      contentViewed: failedThreeTimes ? false : isContentViewed,
      examAttempts: attempts,
      examScore: score,
      examPassed: passed,
      completionDate: isCompleted ? now : (prevProg.completionDate || null),
      certificateFolio: isCompleted ? folio : null,
    };

    // 2. Guardar en Historial de Exámenes (Requerimiento 8)
    const newAttempt: ExamAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      employeeId: currentUser.ID,
      courseId: courseId,
      courseName: currentCourse.name,
      score,
      passed,
      correctCount,
      incorrectCount,
      totalQuestions,
      attemptNumber: attempts,
      date: new Date().toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestamp: now,
      answers: { ...selectedAnswers }
    };

    try {
      const historyRaw = localStorage.getItem('lgb_exam_history');
      const history: ExamAttempt[] = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(newAttempt);
      localStorage.setItem('lgb_exam_history', JSON.stringify(history));
    } catch (e) {
      console.error('Error al persistir historial de exámenes:', e);
    }

    // 3. Actualizar localmente el progreso
    userProgMap[courseId] = updatedProg;
    trainingState[currentUser.ID] = userProgMap;
    localStorage.setItem('lgb_training_state', JSON.stringify(trainingState));

    // 4. Sincronizar en Supabase (Progreso)
    try {
      await saveSupabaseUserProgress(currentUser.ID, courseId, updatedProg);
    } catch (e) {
      console.error('Error al guardar progreso en Supabase:', e);
    }

    // 5. Registrar Certificado en Supabase si completó satisfactoriamente
    if (isCompleted && folio) {
      try {
        const certId = `${currentUser.ID}-${courseId}`;
        await saveSupabaseCertificate(
          certId,
          currentUser.ID,
          courseId,
          currentCourse.name,
          now,
          score,
          folio
        );
      } catch (certErr) {
        console.error('Error al registrar certificado en Supabase:', certErr);
      }
    }

    // 6. Verificar regla de certificación LGB global (Requerimiento 7)
    // El certificado LGB solo debe habilitarse cuando TODOS los cursos estén completados y TODOS los exámenes aprobados
    const requiredIds = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];
    const passedAllExams = requiredIds.every(id => userProgMap[id]?.examPassed === true);
    const completedAllCourses = requiredIds.every(id => userProgMap[id]?.status === 'completado');
    
    const savedTools = localStorage.getItem('lgb_applied_tools');
    const appliedTools = savedTools ? JSON.parse(savedTools) : [];
    const hasApprovedTool = appliedTools.some(
      (tool: any) => tool.employee_number === currentUser.ID && tool.status === 'Aprobada'
    );

    if (passedAllExams && completedAllCourses && hasApprovedTool && currentUser.Estatus !== 'Certificado') {
      const updatedUser = {
        ...currentUser,
        Estatus: 'Certificado' as any,
        Action: 'Complete'
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('lgb_logged_in_user', JSON.stringify(updatedUser));
      
      try {
        await updateSupabaseEmployeeDetails(currentUser.ID, {
          certification_status: 'Certificado'
        });
      } catch (err) {
        console.error('Error al actualizar estatus de colaborador a Certificado:', err);
      }
    }
  };

  const handleExit = () => {
    window.location.href = getAssetPath('/');
  };

  const handleReviewContent = () => {
    window.location.href = getAssetPath(`/course-player?courseId=${courseId}`);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExamResult(null);
    setReviewFilter('all');
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentAnswered = selectedAnswers[currentQuestion?.id] !== undefined;

  // Filtrar preguntas para revisión final
  const filteredReviewQuestions = useMemo(() => {
    if (!examResult) return [];
    return questions.filter(q => {
      const isCorrect = selectedAnswers[q.id] === q.correctOptionIndex;
      if (reviewFilter === 'incorrect') return !isCorrect;
      if (reviewFilter === 'correct') return isCorrect;
      return true;
    });
  }, [questions, selectedAnswers, reviewFilter, examResult]);

  return (
    <div className="w-screen h-screen bg-[#f3f4f6] flex flex-col font-sans text-slate-800 select-none overflow-hidden m-0 p-0">
      
      {/* HEADER DE EXAMEN */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 100 35" width="85" height="30" xmlns="http://www.w3.org/2000/svg" className="text-[#0082C8] fill-current">
            <path d="M12,8 C9,8 7.5,9.5 7.5,12.5 L7.5,30 M3.5,14 L11.5,14" stroke="#0082C8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M16.5,4 L16.5,30" stroke="#0082C8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M26,20 L36,20 C36,13.5 26,13.5 26,20 C26,26.5 36,26.5 37.5,23" stroke="#0082C8" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M54.5,12 L44.5,29" stroke="#0082C8" strokeWidth="4.2" strokeLinecap="round" fill="none" />
            <path d="M44.5,12.5 C48,16 51,21 54.5,28.5" stroke="#0082C8" strokeWidth="4.8" strokeLinecap="round" fill="none" />
          </svg>
          <span className="text-[10px] font-black text-[#0082C8] tracking-widest uppercase border-l border-slate-300 pl-3">B29 SITE</span>
        </div>

        <div className="text-center">
          <span className="text-[9px] font-black text-[#0082c8] uppercase tracking-wider block">Evaluación Oficial</span>
          <h1 className="text-sm font-extrabold text-slate-800">Examen de {currentCourse.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {!examResult && (
            <button
              onClick={() => setViewMode(prev => prev === 'stepped' ? 'full' : 'stepped')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 cursor-pointer"
              title={viewMode === 'stepped' ? 'Ver todo el cuestionario' : 'Ver pregunta por pregunta'}
            >
              {viewMode === 'stepped' ? (
                <>
                  <LayoutList className="w-3.5 h-3.5 text-[#0082c8]" />
                  <span className="hidden sm:inline">Ver Cuestionario Completo</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5 text-[#0082c8]" />
                  <span className="hidden sm:inline">Modo Paso a Paso</span>
                </>
              )}
            </button>
          )}

          {!examResult ? (
            <button
              onClick={() => {
                if (confirm('¿Desea salir del examen? Tu progreso en esta evaluación no se guardará.')) {
                  handleExit();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 shadow-sm cursor-pointer"
            >
              <span>Salir</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleExit}
              className="px-4 py-1.5 rounded-xl bg-[#0082c8] hover:bg-[#0070ad] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Volver a la Academia</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* CUERPO PRINCIPAL DEL EVALUADOR */}
      <div className="flex-1 flex flex-col items-center p-4 md:p-6 overflow-y-auto">
        {!examResult ? (
          viewMode === 'stepped' ? (
            // ==========================================
            // MODO 1: PASO A PASO (1 Pregunta a la vez)
            // ==========================================
            <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8 flex flex-col justify-between min-h-[520px] my-auto">
              
              {/* Barra superior con navegación numérica de preguntas */}
              <div className="shrink-0 mb-5">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase mb-2">
                  <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full font-mono text-slate-600">
                    Respondidas: {answeredCount}/{questions.length}
                  </span>
                </div>
                
                {/* Indicadores Pills de preguntas 1..10 */}
                <div className="flex gap-1.5 mb-3">
                  {questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = currentQuestionIndex === idx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`flex-1 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer border ${
                          isCurrent
                            ? 'border-[#0082c8] bg-[#0082c8] text-white shadow-md'
                            : isAnswered
                              ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700 font-extrabold'
                              : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                        title={`Pregunta ${idx + 1}${isAnswered ? ' (Respondida)' : ' (Pendiente)'}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-[#0082C8] transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Texto de la pregunta */}
              <div className="flex-1 flex flex-col justify-center mb-6">
                <span className="text-[10px] font-bold text-[#0082c8] uppercase tracking-widest block mb-2 font-mono">
                  Pregunta {currentQuestion.questionNumber || currentQuestionIndex + 1} • Valor: 10 Puntos
                </span>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
                  {currentQuestion.text}
                </h2>
              </div>

              {/* Opciones de respuesta */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === idx;
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left font-bold text-sm transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#0082c8] bg-[#0082c8]/8 text-[#0082c8] shadow-sm ring-1 ring-[#0082c8]' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/60 text-slate-700'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border transition-all ${
                        isSelected 
                          ? 'bg-[#0082c8] text-white border-transparent' 
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}>
                        {letter}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navegación del examen */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-5 shrink-0">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-700 shadow-sm cursor-pointer transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-3">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-all"
                    >
                      <span>Finalizar y Calificar Examen</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md cursor-pointer transition-all"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ) : (
            // ==========================================
            // MODO 2: CUESTIONARIO COMPLETO (Full Mode)
            // ==========================================
            <div className="max-w-4xl w-full flex flex-col gap-6 pb-12">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-20">
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">Cuestionario Completo ({questions.length} Preguntas)</h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Selecciona una respuesta para cada pregunta y presiona &quot;Finalizar y Calificar Examen&quot;.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    Respondidas: {answeredCount} de {questions.length}
                  </span>
                  <button
                    onClick={handleSubmitExam}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer transition-all"
                  >
                    <span>Finalizar Examen</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {questions.map((q, qIdx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                return (
                  <div 
                    key={q.id}
                    className={`bg-white rounded-3xl border p-6 md:p-8 shadow-sm transition-all ${
                      isAnswered ? 'border-slate-200' : 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-[#0082c8] uppercase tracking-widest font-mono">
                        Pregunta {qIdx + 1} de {questions.length} • 10 Pts
                      </span>
                      {isAnswered ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Respondida
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Pendiente
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mb-5 leading-snug">
                      {q.text}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[q.id] === oIdx;
                        const letter = String.fromCharCode(65 + oIdx);
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleAnswerSelect(q.id, oIdx)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#0082c8] bg-[#0082c8]/8 text-[#0082c8] ring-1 ring-[#0082c8]'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/60 text-slate-700'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-[#0082c8] text-white border-transparent'
                                : 'bg-white border-slate-200 text-slate-500'
                            }`}>
                              {letter}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="text-center pt-4">
                <button
                  onClick={handleSubmitExam}
                  className="px-8 py-3.5 rounded-2xl text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer transition-all"
                >
                  Finalizar y Calificar Examen
                </button>
              </div>
            </div>
          )
        ) : (
          // ==========================================
          // PANTALLA DE RESULTADOS Y RETROALIMENTACIÓN
          // ==========================================
          <div className="max-w-4xl w-full flex flex-col gap-6 pb-12 animate-fade-in">
            
            {/* Tarjeta de Resumen General */}
            <div className={`bg-white rounded-3xl border shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${
              examResult.passed ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-red-200 ring-1 ring-red-100'
            }`}>
              
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2.5xl flex items-center justify-center shrink-0 ${
                  examResult.passed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                }`}>
                  {examResult.passed ? (
                    <Award className="w-10 h-10 animate-bounce" />
                  ) : (
                    <AlertTriangle className="w-10 h-10" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      examResult.passed 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                    }`}>
                      {examResult.passed ? 'Aprobado ✅' : 'Reprobado ❌'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Intento #{attemptsCount}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900">
                    {examResult.passed ? '¡Felicidades! Examen Acreditado' : 'Calificación Insuficiente'}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {examResult.passed 
                      ? `Has superado exitosamente la evaluación oficial de ${currentCourse.name}.`
                      : `Obtuviste una calificación menor al 80% mínimo requerido. Repasa el material y las explicaciones antes de reintentar.`
                    }
                  </p>
                </div>
              </div>

              {/* Indicadores numéricos del score */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shrink-0">
                <div className="text-center px-3 border-r border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Calificación</span>
                  <span className={`text-3xl font-black ${examResult.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {examResult.score}
                    <span className="text-sm font-bold text-slate-400">/100</span>
                  </span>
                </div>
                <div className="space-y-1 text-xs font-bold text-slate-600 pr-2">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{examResult.correctCount} Correctas</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{examResult.incorrectCount} Incorrectas</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    Mínimo aprobatorio: 80%
                  </div>
                </div>
              </div>

            </div>

            {/* Acciones Rápidas */}
            <div className="flex flex-wrap gap-3">
              {!examResult.passed && (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar Examen</span>
                </button>
              )}
              
              <button
                onClick={handleReviewContent}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm cursor-pointer transition-all"
              >
                <BookOpen className="w-4 h-4 text-[#0082c8]" />
                <span>Repasar Diapositivas</span>
              </button>

              <button
                onClick={handleExit}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm cursor-pointer transition-all"
              >
                <History className="w-4 h-4 text-emerald-600" />
                <span>Ver Historial en Academia</span>
              </button>
            </div>

            {/* Sección de Retroalimentación Detallada (Requerimiento 5) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 md:p-8">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#0082c8]" />
                    <span>Retroalimentación y Explicaciones Oficiales</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Revisa las justificaciones técnicas tomadas directamente de los manuales y PDFs de Lean Enterprise.
                  </p>
                </div>

                {/* Filtro de Preguntas */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
                  <button
                    onClick={() => setReviewFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      reviewFilter === 'all' 
                        ? 'bg-white text-slate-800 shadow-sm font-extrabold' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Todas ({questions.length})
                  </button>
                  <button
                    onClick={() => setReviewFilter('incorrect')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      reviewFilter === 'incorrect' 
                        ? 'bg-red-50 text-red-600 shadow-sm font-extrabold border border-red-200' 
                        : 'text-slate-500 hover:text-red-600'
                    }`}
                  >
                    <span>Incorrectas</span>
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 text-[10px] flex items-center justify-center font-bold">
                      {examResult.incorrectCount}
                    </span>
                  </button>
                  <button
                    onClick={() => setReviewFilter('correct')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      reviewFilter === 'correct' 
                        ? 'bg-emerald-50 text-emerald-600 shadow-sm font-extrabold border border-emerald-200' 
                        : 'text-slate-500 hover:text-emerald-600'
                    }`}
                  >
                    <span>Correctas</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 text-[10px] flex items-center justify-center font-bold">
                      {examResult.correctCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Lista de Preguntas con Retroalimentación */}
              <div className="space-y-6">
                {filteredReviewQuestions.length > 0 ? (
                  filteredReviewQuestions.map((q) => {
                    const userOptionIdx = selectedAnswers[q.id];
                    const isCorrect = userOptionIdx === q.correctOptionIndex;
                    const correctLetter = String.fromCharCode(65 + q.correctOptionIndex);
                    const userLetter = userOptionIdx !== undefined ? String.fromCharCode(65 + userOptionIdx) : 'Sin responder';
                    
                    return (
                      <div 
                        key={q.id}
                        className={`rounded-2xl border p-5 transition-all ${
                          isCorrect 
                            ? 'bg-emerald-50/20 border-emerald-200/80' 
                            : 'bg-red-50/20 border-red-200/80'
                        }`}
                      >
                        {/* Cabecera de la pregunta */}
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                            Pregunta {q.questionNumber || q.id}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            isCorrect 
                              ? 'bg-emerald-100/60 text-emerald-700 border-emerald-300/60' 
                              : 'bg-red-100/60 text-red-700 border-red-300/60'
                          }`}>
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Correcta (+10 pts)</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Incorrecta (0 pts)</span>
                              </>
                            )}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 mb-4 leading-snug">
                          {q.text}
                        </h4>

                        {/* Desglose de Respuestas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className={`p-3 rounded-xl border text-xs font-semibold ${
                            isCorrect 
                              ? 'bg-emerald-100/30 border-emerald-300 text-emerald-800' 
                              : 'bg-red-100/30 border-red-300 text-red-800'
                          }`}>
                            <span className="text-[10px] font-black uppercase block mb-1">Tu Respuesta Seleccionada:</span>
                            <span className="font-bold">
                              {userOptionIdx !== undefined ? `${userLetter}) ${q.options[userOptionIdx]}` : 'Ninguna opción seleccionada'}
                            </span>
                          </div>

                          {!isCorrect && (
                            <div className="p-3 rounded-xl border bg-emerald-100/30 border-emerald-300 text-emerald-800 text-xs font-semibold">
                              <span className="text-[10px] font-black uppercase block mb-1">Respuesta Correcta:</span>
                              <span className="font-bold">
                                {correctLetter}) {q.options[q.correctOptionIndex]}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Explicación Oficial del Markdown */}
                        {q.explanation && (
                          <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700">
                            <span className="text-[10px] font-black text-[#0082c8] uppercase tracking-wider block mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#0082c8]" />
                              Explicación Oficial (Clave Lean)
                            </span>
                            <p className="leading-relaxed font-medium">
                              {q.explanation}
                            </p>
                          </div>
                        )}

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-slate-400 font-semibold text-xs">
                    No hay preguntas para mostrar en este filtro.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
}

export default function ExamPlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0082c8]" />
          <p className="text-sm font-semibold tracking-wider text-slate-400">Cargando...</p>
        </div>
      </div>
    }>
      <ExamPlayerContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, Award, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getAssetPath } from '../utils/paths';
import { 
  saveSupabaseUserProgress, 
  saveSupabaseCertificate, 
  updateSupabaseEmployeeDetails
} from '../utils/supabaseService';
import { MergedEmployee, Course, Exam, Question, UserCourseProgress } from '../types';

function ExamPlayerContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [currentUser, setCurrentUser] = useState<MergedEmployee | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del examen
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [examResult, setExamResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

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
    if (savedExams) {
      setExams(JSON.parse(savedExams));
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
    return exams.find(e => e.courseId === courseId) || null;
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

  const handleSubmitExam = async () => {
    if (!currentUser || !courseId || !activeExam) return;

    let correctCount = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= activeExam.minScore;

    const result = {
      score,
      passed,
      correctCount,
      totalQuestions: questions.length
    };

    setExamResult(result);

    // 1. Obtener progreso anterior
    const savedTraining = localStorage.getItem('lgb_training_state');
    const trainingState = savedTraining ? JSON.parse(savedTraining) : {};
    const userProgMap = trainingState[currentUser.ID] || {};
    const prevProg = userProgMap[courseId] || { examAttempts: 0 };
    
    const attempts = (prevProg.examAttempts || 0) + 1;
    const now = new Date().toISOString();
    
    // Generar Folio de certificado si aprobó
    let folio = prevProg.certificateFolio || null;
    if (passed && !folio) {
      const randHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
      folio = `LGB-${courseId.substring(0, 3).toUpperCase()}-${randHex}`;
    }

    const updatedProg: UserCourseProgress = {
      status: passed ? 'completado' : 'en-progreso',
      progress: passed ? 100 : Math.max(prevProg.progress || 0, 90),
      contentViewed: true,
      examAttempts: attempts,
      examScore: score,
      examPassed: passed,
      completionDate: passed ? now : (prevProg.completionDate || null),
      certificateFolio: folio,
    };

    // 2. Actualizar localmente el progreso
    userProgMap[courseId] = updatedProg;
    trainingState[currentUser.ID] = userProgMap;
    localStorage.setItem('lgb_training_state', JSON.stringify(trainingState));

    // 3. Sincronizar en Supabase (Progreso)
    try {
      await saveSupabaseUserProgress(currentUser.ID, courseId, updatedProg);
    } catch (e) {
      console.error('Error al guardar progreso en Supabase:', e);
    }

    // 4. Registrar Certificado en Supabase si aprobó
    if (passed && folio) {
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

    // 5. Verificar regla de certificación LGB global
    const requiredIds = ['lean-basics-1', '5s-1', '5-whys', '7-ways', 'sga-guide'];
    const passedAll = requiredIds.every(id => userProgMap[id]?.examPassed === true);
    
    const savedTools = localStorage.getItem('lgb_applied_tools');
    const appliedTools = savedTools ? JSON.parse(savedTools) : [];
    const hasApprovedTool = appliedTools.some(
      (tool: any) => tool.employee_number === currentUser.ID && tool.status === 'Aprobada'
    );

    if (passedAll && hasApprovedTool && currentUser.Estatus !== 'Certificado') {
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

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExamResult(null);
  };

  // Determinar si ha respondido la pregunta actual
  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentAnswered = selectedAnswers[currentQuestion?.id] !== undefined;

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
          <span className="text-[10px] font-black text-[#0082C8] tracking-widest uppercase border-l border-slate-350 pl-3">B29 SITE</span>
        </div>

        <div className="text-center">
          <span className="text-[9px] font-black text-[#0082c8] uppercase tracking-wider block">Evaluación de Módulo</span>
          <h1 className="text-sm font-extrabold text-slate-800">Examen de {currentCourse.name}</h1>
        </div>

        {!examResult ? (
          <button
            onClick={() => {
              if (confirm('¿Desea salir del examen? Tu progreso no se guardará y se contará como intento incompleto.')) {
                handleExit();
              }
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-200 shadow-sm cursor-pointer"
          >
            <span>Abortar Examen</span>
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-20" /> // Spacer
        )}
      </div>

      {/* CUERPO PRINCIPAL DEL EVALUADOR */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8 overflow-y-auto">
        {!examResult ? (
          // CONTENEDOR DE EVALUACIÓN ACTIVA
          <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 flex flex-col justify-between min-h-[480px]">
            
            {/* Barra de progreso de preguntas */}
            <div className="shrink-0 mb-6">
              <div className="flex justify-between text-[10px] font-black text-slate-450 uppercase mb-2">
                <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
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
              <span className="text-[10px] font-bold text-[#0082c8] uppercase tracking-widest block mb-2 font-mono">Enunciado</span>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Opciones de respuesta */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === idx;
                const letter = String.fromCharCode(65 + idx); // A, B, C, D...
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left font-bold text-sm transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#0082c8] bg-[#0082c8]/5 text-[#0082c8] shadow-sm' 
                        : 'border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100/50 text-slate-705'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border transition-all ${
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

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  disabled={!isCurrentAnswered}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md cursor-pointer transition-all disabled:opacity-40 disabled:hover:bg-[#0082c8]"
                >
                  <span>Finalizar Examen</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={!isCurrentAnswered}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md cursor-pointer transition-all disabled:opacity-40 disabled:hover:bg-[#0082c8]"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        ) : (
          // RENDIMIENTO Y RESULTADOS DEL EXAMEN
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center flex flex-col items-center">
            {examResult.passed ? (
              // VISTA: APROBADO 🎉
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 animate-bounce">
                  <Award className="w-9 h-9" />
                </div>
                
                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  ¡Módulo Aprobado!
                </h3>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">
                  Calificación obtenida: {examResult.score}%
                </p>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
                  Felicidades. Has acreditado con éxito el examen de {currentCourse.name}. El folio de tu certificado digital ya ha sido emitido y guardado en tu historial académico.
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 w-full mb-6 text-left space-y-2.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Preguntas correctas:</span>
                    <span className="text-slate-800 font-extrabold">{examResult.correctCount} de {examResult.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Calificación mínima:</span>
                    <span className="text-slate-805">{activeExam.minScore}%</span>
                  </div>
                </div>

                <button
                  onClick={handleExit}
                  className="w-full py-3.5 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md transition-all cursor-pointer"
                >
                  Volver a la Academia
                </button>
              </>
            ) : (
              // VISTA: REPROBADO ❌
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-650 mb-6">
                  <AlertTriangle className="w-9 h-9" />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                  Calificación Insuficiente
                </h3>
                <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">
                  Score obtenido: {examResult.score}%
                </p>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-6">
                  Has obtenido un porcentaje menor al {activeExam.minScore}% requerido para aprobar. Te sugerimos repasar la presentación oficial del módulo antes de volver a intentarlo.
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 w-full mb-6 text-left space-y-2.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Respuestas correctas:</span>
                    <span className="text-slate-850">{examResult.correctCount} de {examResult.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Estatus del módulo:</span>
                    <span className="text-amber-500">En Progreso</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleRetry}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reintentar</span>
                  </button>
                  <button
                    onClick={handleExit}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-705 cursor-pointer transition-colors shadow-sm"
                  >
                    Salir
                  </button>
                </div>
              </>
            )}
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

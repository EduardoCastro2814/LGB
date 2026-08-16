'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, X, BookOpenCheck } from 'lucide-react';
import { getAssetPath } from '../utils/paths';
import { DEFAULT_SLIDES } from '../components/AcademiaLean';
import { saveSupabaseUserProgress } from '../utils/supabaseService';
import { MergedEmployee, Course, UserCourseProgress } from '../types';

const COURSES_WITH_IMAGES = ['lean-basics-1', '5s-1', '7-ways', 'sga-guide', '5-whys'];

function CoursePlayerContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [currentUser, setCurrentUser] = useState<MergedEmployee | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Cargar usuario y cursos desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('lgb_logged_in_user');
    const savedCourses = localStorage.getItem('lgb_courses_list');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    }
    setLoading(false);
  }, []);

  // Obtener curso actual
  const currentCourse = useMemo(() => {
    return courses.find(c => c.id === courseId) || null;
  }, [courses, courseId]);

  // Si no está logueado o falta courseId, redirigir al home
  useEffect(() => {
    if (!loading && (!currentUser || !courseId)) {
      window.location.href = getAssetPath('/');
    }
  }, [currentUser, courseId, loading]);

  const slides = useMemo(() => {
    if (!courseId) return [];
    return DEFAULT_SLIDES[courseId] || [{ title: 'Contenido Simulado', content: 'No hay material disponible.' }];
  }, [courseId]);

  if (loading || !currentUser || !currentCourse) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0082c8]" />
          <p className="text-sm font-semibold tracking-wider text-slate-400">Cargando Reproductor...</p>
        </div>
      </div>
    );
  }

  // Guardar avance de la diapositiva
  const handleUpdateSlideProgress = async (slideIndex: number) => {
    if (!currentUser || !courseId) return;

    const savedTraining = localStorage.getItem('lgb_training_state');
    const trainingState = savedTraining ? JSON.parse(savedTraining) : {};
    const userProgMap = trainingState[currentUser.ID] || {};
    const currentProg: UserCourseProgress = userProgMap[courseId] || {
      status: 'en-progreso',
      progress: 0,
      contentViewed: false,
      examAttempts: 0,
      examScore: null,
      examPassed: false,
      completionDate: null,
      certificateFolio: null,
    };

    const calculatedProgress = Math.max(
      currentProg.progress,
      Math.round(((slideIndex + 1) / slides.length) * 90) // Capped at 90% until exam is completed
    );

    const updatedProg: UserCourseProgress = {
      ...currentProg,
      status: 'en-progreso',
      progress: calculatedProgress,
      contentViewed: slideIndex === slides.length - 1 ? true : currentProg.contentViewed,
    };

    userProgMap[courseId] = updatedProg;
    trainingState[currentUser.ID] = userProgMap;
    localStorage.setItem('lgb_training_state', JSON.stringify(trainingState));

    try {
      await saveSupabaseUserProgress(currentUser.ID, courseId, updatedProg);
    } catch (e) {
      console.error('Error al guardar progreso en Supabase:', e);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIndex);
      handleUpdateSlideProgress(nextIndex);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleFinishReading = async () => {
    if (!currentUser || !courseId) return;
    
    const savedTraining = localStorage.getItem('lgb_training_state');
    const trainingState = savedTraining ? JSON.parse(savedTraining) : {};
    const userProgMap = trainingState[currentUser.ID] || {};
    const currentProg: UserCourseProgress = userProgMap[courseId] || {
      status: 'en-progreso',
      progress: 0,
      contentViewed: false,
      examAttempts: 0,
      examScore: null,
      examPassed: false,
      completionDate: null,
      certificateFolio: null,
    };

    const updatedProg: UserCourseProgress = {
      ...currentProg,
      progress: 90, // Deja 10% para el examen
      contentViewed: true,
    };

    userProgMap[courseId] = updatedProg;
    trainingState[currentUser.ID] = userProgMap;
    localStorage.setItem('lgb_training_state', JSON.stringify(trainingState));

    try {
      await saveSupabaseUserProgress(currentUser.ID, courseId, updatedProg);
    } catch (e) {
      console.error('Error al finalizar lectura en Supabase:', e);
    }
  };

  const handleStartExam = () => {
    window.location.href = getAssetPath(`/exam-player?courseId=${courseId}`);
  };

  const isImageBased = COURSES_WITH_IMAGES.includes(courseId || '');

  return (
    <div className="w-screen h-screen bg-[#0b0f19] flex flex-col font-sans text-slate-100 select-none overflow-hidden m-0 p-0">
      {/* Header del Visor PPT */}
      <div className="flex justify-between items-center px-6 py-4 bg-[#111827]/85 backdrop-blur-md border-b border-white/10 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 100 35" width="85" height="30" xmlns="http://www.w3.org/2000/svg" className="text-[#0082C8] fill-current">
              <path d="M12,8 C9,8 7.5,9.5 7.5,12.5 L7.5,30 M3.5,14 L11.5,14" stroke="#0082C8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M16.5,4 L16.5,30" stroke="#0082C8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M26,20 L36,20 C36,13.5 26,13.5 26,20 C26,26.5 36,26.5 37.5,23" stroke="#0082C8" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M54.5,12 L44.5,29" stroke="#0082C8" strokeWidth="4.2" strokeLinecap="round" fill="none" />
              <path d="M44.5,12.5 C48,16 51,21 54.5,28.5" stroke="#0082C8" strokeWidth="4.8" strokeLinecap="round" fill="none" />
            </svg>
            <span className="text-[10px] font-black text-[#0082C8] tracking-widest uppercase border-l border-white/20 pl-3">B29 SITE</span>
          </div>
        </div>

        <div className="text-center">
          <span className="text-[9px] font-bold tracking-widest text-[#0082c8] uppercase block">Presentación Oficial de Diapositivas</span>
          <h1 className="text-sm font-extrabold text-white">{currentCourse.name}</h1>
        </div>

        <button 
          onClick={() => {
            if (confirm('¿Desea salir de la capacitación? Tu progreso actual se guardará.')) {
              window.location.href = getAssetPath('/');
            }
          }}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10 shadow-sm"
        >
          <span>Salir</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Cuerpo del Visor */}
      {isImageBased ? (
        // Vista PowerPoint Real con Diapositiva PNG que toca los bordes
        <div className="flex-1 flex flex-col justify-between p-4 md:p-6 max-w-full w-full overflow-hidden">
          
          {/* Diapositiva Centrada */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div className="relative bg-[#111827] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/5 aspect-[16/9] w-full max-h-[75vh] flex items-center justify-center overflow-hidden">
              <img 
                src={getAssetPath(`/slides/${currentCourse.id}/slide_${currentSlideIndex + 1}.png`)} 
                alt={`Diapositiva ${currentSlideIndex + 1}`}
                className="w-full h-full object-contain select-none pointer-events-none"
              />
              {/* Indicador flotante en la diapositiva */}
              <span className="absolute bottom-4 right-6 bg-[#0082c8]/85 text-white text-[10px] font-bold font-mono px-2 py-1 rounded shadow">
                Slide {currentSlideIndex + 1} / {slides.length}
              </span>
            </div>
          </div>

          {/* Controles de Navegación y Progreso */}
          <div className="w-full flex flex-col gap-4 mt-2 shrink-0">
            {/* Barra de Progreso */}
            <div>
              <div className="flex justify-between text-[9px] font-black text-slate-450 uppercase mb-1">
                <span>Progreso de Diapositivas</span>
                <span>{Math.round(((currentSlideIndex + 1) / slides.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-[#0082C8] transition-all duration-300"
                  style={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex justify-between items-center pb-2">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer text-white shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlideIndex === idx ? 'w-6 bg-[#0082c8]' : 'w-2.5 bg-white/10 hover:bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {currentSlideIndex === slides.length - 1 ? (
                <button
                  onClick={async () => {
                    await handleFinishReading();
                    handleStartExam();
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md cursor-pointer transition-all animate-pulse"
                >
                  <BookOpenCheck className="w-4 h-4" />
                  <span>Comenzar Examen</span>
                </button>
              ) : (
                <button
                  onClick={handleNextSlide}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0082c8] hover:bg-[#0070ad] text-white shadow-md transition-all cursor-pointer"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      ) : (
        // Fallback para otros cursos con formato tradicional
        <div className="flex-1 flex flex-col justify-between p-6 max-w-full w-full overflow-y-auto">
          <div className="flex-1 flex items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 max-w-3xl mx-auto w-full">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold text-white">{slides[currentSlideIndex]?.title}</h2>
              <p className="text-sm text-slate-300 max-w-lg leading-relaxed whitespace-pre-line">{slides[currentSlideIndex]?.content}</p>
            </div>
          </div>
          <div className="w-full flex flex-col gap-4 mt-4 max-w-3xl mx-auto shrink-0">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold disabled:opacity-30 border border-white/10 text-white cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-400 font-mono">Página {currentSlideIndex + 1} de {slides.length}</span>
              {currentSlideIndex === slides.length - 1 ? (
                <button
                  onClick={async () => {
                    await handleFinishReading();
                    handleStartExam();
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-bold text-white cursor-pointer"
                >
                  Comenzar Examen
                </button>
              ) : (
                <button
                  onClick={handleNextSlide}
                  className="px-4 py-2 bg-[#0082c8] hover:bg-[#0070ad] rounded-xl text-xs font-bold text-white cursor-pointer"
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CoursePlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0082c8]" />
          <p className="text-sm font-semibold tracking-wider text-slate-400">Cargando...</p>
        </div>
      </div>
    }>
      <CoursePlayerContent />
    </Suspense>
  );
}

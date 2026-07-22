'use client';

import React, { useState, useMemo } from 'react';
import { Course, Exam, Question } from '../types';
import { BookOpen, Plus, Edit2, Trash2, Save, X, HelpCircle, Check, Award, AlertCircle } from 'lucide-react';

interface ConfigExamsProps {
  courses: Course[];
  exams: Exam[];
  onSaveExams: (updatedExams: Exam[]) => void;
}

export default function ConfigExams({ courses, exams, onSaveExams }: ConfigExamsProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  
  // Modificar pregunta activa
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Formulario de Pregunta
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [points, setPoints] = useState(10);

  // Buscar examen activo para el curso seleccionado
  const activeExam = useMemo(() => {
    return exams.find(e => e.courseId === selectedCourseId);
  }, [exams, selectedCourseId]);

  // Obtener curso seleccionado
  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  // Crear o inicializar examen para el curso
  const handleCreateExam = () => {
    if (!selectedCourseId) return;
    const newExam: Exam = {
      courseId: selectedCourseId,
      minScore: 80,
      questions: [],
    };
    onSaveExams([...exams, newExam]);
  };

  // Guardar puntuación mínima aprobatoria
  const handleUpdateMinScore = (score: number) => {
    if (!activeExam) return;
    const updated = exams.map(e => {
      if (e.courseId === selectedCourseId) {
        return { ...e, minScore: score };
      }
      return e;
    });
    onSaveExams(updated);
  };

  // Iniciar creación de pregunta
  const startAddQuestion = () => {
    setIsAddingQuestion(true);
    setEditingQuestion(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectIndex(0);
    setPoints(10);
  };

  // Iniciar edición de pregunta
  const startEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setIsAddingQuestion(false);
    setQuestionText(q.text);
    setOptionA(q.options[0] || '');
    setOptionB(q.options[1] || '');
    setOptionC(q.options[2] || '');
    setOptionD(q.options[3] || '');
    setCorrectIndex(q.correctOptionIndex);
    setPoints(q.points || 10);
  };

  // Guardar pregunta en el examen
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam) return;

    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      alert('La pregunta debe tener al menos un enunciado y las primeras dos opciones (A y B) completas.');
      return;
    }

    const optionsList = [optionA, optionB];
    if (optionC.trim()) optionsList.push(optionC);
    if (optionD.trim()) optionsList.push(optionD);

    if (correctIndex >= optionsList.length) {
      alert('La respuesta correcta debe ser una de las opciones con texto cargado.');
      return;
    }

    let updatedQuestions = [...activeExam.questions];

    if (isAddingQuestion) {
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        text: questionText,
        options: optionsList,
        correctOptionIndex: correctIndex,
        points: points,
      };
      updatedQuestions.push(newQuestion);
      setIsAddingQuestion(false);
    } else if (editingQuestion) {
      updatedQuestions = updatedQuestions.map(q => {
        if (q.id === editingQuestion.id) {
          return {
            ...q,
            text: questionText,
            options: optionsList,
            correctOptionIndex: correctIndex,
            points: points,
          };
        }
        return q;
      });
      setEditingQuestion(null);
    }

    const updatedExams = exams.map(ex => {
      if (ex.courseId === selectedCourseId) {
        return { ...ex, questions: updatedQuestions };
      }
      return ex;
    });

    onSaveExams(updatedExams);
  };

  // Eliminar pregunta
  const handleDeleteQuestion = (qId: string) => {
    if (!activeExam) return;
    if (confirm('¿Está seguro de eliminar esta pregunta del examen?')) {
      const updatedQuestions = activeExam.questions.filter(q => q.id !== qId);
      const updatedExams = exams.map(ex => {
        if (ex.courseId === selectedCourseId) {
          return { ...ex, questions: updatedQuestions };
        }
        return ex;
      });
      onSaveExams(updatedExams);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Selector de Curso */}
      <div className="glass-panel rounded-2.5xl p-6 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Constructor de Exámenes Dinámico</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Configura reactivos y respuestas por materia del plan</p>
        </div>

        {courses.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl px-3.5 py-1.5 w-full sm:w-64">
            <BookOpen className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <select
              className="bg-transparent text-xs font-bold text-slate-705 dark:text-[#cbd5e1] border-none outline-none focus:ring-0 cursor-pointer w-full"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setIsAddingQuestion(false);
                setEditingQuestion(null);
              }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ESTADO EXAMEN */}
      {selectedCourse && (
        <>
          {!activeExam ? (
            <div className="glass-panel rounded-3xl p-10 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#1e293b] border-slate-202">
              <HelpCircle className="w-16 h-16 stroke-1 text-slate-300 dark:text-slate-650 mx-auto mb-4" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-350 mb-1">
                No hay examen configurado para este curso
              </h4>
              <p className="text-xs max-w-sm mx-auto mb-5 font-medium">
                Los colaboradores no podrán finalizar el curso hasta que exista una prueba de evaluación y preguntas configuradas.
              </p>
              <button
                onClick={handleCreateExam}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Inicializar Examen</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Columna Izquierda: Listado Preguntas & Puntuación Aprobatoria */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Panel Puntuación Aprobatoria */}
                <div className="glass-panel rounded-2.5xl p-5 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">Regla de Aprobación</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Calificación aprobatoria mínima (Score %)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      className="w-16 px-2 py-1 text-center bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-bold font-mono"
                      value={activeExam.minScore || 80}
                      onChange={(e) => handleUpdateMinScore(parseInt(e.target.value, 10))}
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                {/* Listado de Preguntas */}
                <div className="glass-panel rounded-3xl p-6 bg-white dark:bg-[#1e293b] border-slate-202">
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100 dark:border-[#2d3a4f]">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                        Preguntas del Examen ({activeExam.questions.length})
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Materia: {selectedCourse.name}</p>
                    </div>

                    {!isAddingQuestion && !editingQuestion && (
                      <button
                        onClick={startAddQuestion}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Pregunta</span>
                      </button>
                    )}
                  </div>

                  {activeExam.questions.length > 0 ? (
                    <div className="space-y-4">
                      {activeExam.questions.map((q, idx) => (
                        <div 
                          key={q.id}
                          className="p-4.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/35 border border-slate-200 dark:border-[#334155] flex justify-between gap-4 items-start"
                        >
                          <div className="space-y-2 flex-1">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                              {idx + 1}. {q.text}
                            </h5>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.correctOptionIndex === oIdx;
                                return (
                                  <li key={oIdx} className="flex items-center gap-1.5 truncate">
                                    <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center border ${
                                      isCorrect 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950'
                                    }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span className={isCorrect ? 'text-emerald-500 dark:text-emerald-400 font-bold' : ''}>{opt}</span>
                                  </li>
                                );
                              })}
                            </ul>
                            <div className="pt-2 border-t border-slate-100/50 dark:border-[#2d3a4f]/50 text-[10px] text-slate-400 font-bold flex gap-3">
                              <span>Puntaje: <span className="text-emerald-500">{q.points || 10} pts</span></span>
                            </div>
                          </div>

                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => startEditQuestion(q)}
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-[#1e293b] dark:hover:bg-[#2d3b52] border border-slate-200 dark:border-[#334155] text-slate-500 transition-colors cursor-pointer"
                              title="Editar Pregunta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-505 transition-colors cursor-pointer"
                              title="Eliminar Pregunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <AlertCircle className="w-8 h-8 stroke-1 text-slate-300 dark:text-slate-650 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-0.5">Examen sin preguntas</p>
                      <p className="text-[10px] text-slate-500">Haga clic en &quot;Agregar Pregunta&quot; para registrar reactivos.</p>
                    </div>
                  )}

                </div>

              </div>

              {/* Columna Derecha: Formulario Nueva / Editar Pregunta */}
              {(isAddingQuestion || editingQuestion) && (
                <div className="glass-panel rounded-3xl p-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-[#334155] space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-[#334155] pb-2">
                    {isAddingQuestion ? 'Agregar Pregunta' : 'Editar Pregunta'}
                  </h4>

                  <form onSubmit={handleSaveQuestion} className="space-y-4">
                    
                    {/* Enunciado */}
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Enunciado de la Pregunta</label>
                      <textarea
                        rows={3}
                        className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
                        placeholder="Escriba la pregunta claramente..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        required
                      />
                    </div>

                    {/* Opciones */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Opciones de Respuesta</label>
                      
                      {[
                        { val: optionA, set: setOptionA, label: 'Opción A', idx: 0 },
                        { val: optionB, set: setOptionB, label: 'Opción B', idx: 1 },
                        { val: optionC, set: setOptionC, label: 'Opción C (Opcional)', idx: 2 },
                        { val: optionD, set: setOptionD, label: 'Opción D (Opcional)', idx: 3 },
                      ].map((opt) => (
                        <div key={opt.idx} className="flex gap-2 items-center">
                          <input
                            type="radio"
                            name="correct-option-radio"
                            checked={correctIndex === opt.idx}
                            onChange={() => setCorrectIndex(opt.idx)}
                            className="text-emerald-500 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <input
                            type="text"
                            className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
                            placeholder={opt.label}
                            value={opt.val}
                            onChange={(e) => opt.set(e.target.value)}
                            required={opt.idx < 2} // Opciones A y B obligatorias
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor en Puntos</label>
                        <input
                          type="number"
                          min="1"
                          className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-bold"
                          value={points}
                          onChange={(e) => setPoints(parseInt(e.target.value, 10))}
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col justify-end">
                        <span className="text-[10px] text-slate-450 italic pb-2 font-medium">Seleccione la opción correcta con el botón circular.</span>
                      </div>
                    </div>

                    {/* Controles Formulario */}
                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#334155]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingQuestion(false);
                          setEditingQuestion(null);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-205 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#273449] transition-colors cursor-pointer text-slate-700 dark:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar</span>
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          )}
        </>
      )}

    </div>
  );
}

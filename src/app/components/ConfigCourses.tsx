'use client';

import React, { useState } from 'react';
import { Course, CourseMaterial } from '../types';
import { BookOpen, Plus, Edit2, Trash2, X, Save, FileText, Play, Image, FileCode, Paperclip, Clock } from 'lucide-react';

interface ConfigCoursesProps {
  courses: Course[];
  onSaveCourses: (updatedCourses: Course[]) => void;
}

export default function ConfigCourses({ courses, onSaveCourses }: ConfigCoursesProps) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Estados para formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [order, setOrder] = useState(1);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);

  // Estado para material nuevo
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialType, setNewMaterialType] = useState<'pdf' | 'ppt' | 'video' | 'image'>('pdf');

  // Iniciar creación de curso
  const startAddCourse = () => {
    setIsAdding(true);
    setEditingCourse(null);
    setName('');
    setDescription('');
    setDuration('2 horas');
    setOrder(courses.length + 1);
    setMaterials([]);
  };

  // Iniciar edición de curso
  const startEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsAdding(false);
    setName(course.name);
    setDescription(course.description);
    setDuration(course.duration);
    setOrder(course.order);
    setMaterials(course.materials || []);
  };

  // Guardar curso (Nuevo o Editado)
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Por favor complete el nombre y la descripción.');
      return;
    }

    if (isAdding) {
      const newId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Validar duplicados
      if (courses.some(c => c.id === newId)) {
        alert('Ya existe un curso con un nombre muy similar.');
        return;
      }

      const newCourse: Course = {
        id: newId,
        name,
        description,
        duration,
        order,
        materials,
      };

      onSaveCourses([...courses, newCourse].sort((a, b) => a.order - b.order));
      setIsAdding(false);
    } else if (editingCourse) {
      const updatedCourses = courses.map((c) => {
        if (c.id === editingCourse.id) {
          return {
            ...c,
            name,
            description,
            duration,
            order,
            materials,
          };
        }
        return c;
      });

      onSaveCourses(updatedCourses.sort((a, b) => a.order - b.order));
      setEditingCourse(null);
    }
  };

  // Eliminar curso
  const handleDeleteCourse = (courseId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este curso? Se perderán las preguntas de examen y el historial de progreso vinculados a él.')) {
      const updated = courses.filter(c => c.id !== courseId);
      onSaveCourses(updated);
    }
  };

  // Agregar archivo/material complementario (simulado)
  const handleAddMaterial = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeInKB = (file.size / 1024).toFixed(1);
      
      const newMaterial: CourseMaterial = {
        id: `mat-${Date.now()}`,
        name: newMaterialName || file.name,
        type: newMaterialType,
        url: '', // Simulado en local
        size: `${sizeInKB} KB`,
      };

      setMaterials([...materials, newMaterial]);
      setNewMaterialName('');
    }
  };

  const handleRemoveMaterial = (materialId: string) => {
    setMaterials(materials.filter(m => m.id !== materialId));
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'ppt': return <FileCode className="w-4 h-4 text-orange-500" />;
      case 'video': return <Play className="w-4 h-4 text-blue-500" />;
      case 'image': return <Image className="w-4 h-4 text-emerald-500" />;
      default: return <Paperclip className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Administración de Cursos</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Crea, edita y organiza las materias del plan académico</p>
        </div>
        
        {!isAdding && !editingCourse && (
          <button
            onClick={startAddCourse}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Nuevo Curso</span>
          </button>
        )}
      </div>

      {/* FORMULARIO DE EDICIÓN O CREACIÓN */}
      {(isAdding || editingCourse) && (
        <form onSubmit={handleSaveCourse} className="glass-panel rounded-2.5xl p-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-205 dark:border-[#334155] space-y-5">
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
            {isAdding ? 'Crear Nuevo Curso' : `Editar Curso: ${editingCourse?.name}`}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Curso</label>
              <input
                type="text"
                className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
                placeholder="Ej: Análisis de Causa Raíz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Duración Estimada</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
                  placeholder="Ej: 2 horas"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Orden de Certificación</label>
                <input
                  type="number"
                  min="1"
                  className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10))}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descripción Breve</label>
            <textarea
              rows={3}
              className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
              placeholder="Explique el objetivo y alcance del entrenamiento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Gestión de archivos adjuntos */}
          <div className="border-t border-slate-200 dark:border-[#334155] pt-4 space-y-4">
            <h5 className="text-[10px] font-extrabold text-slate-455 dark:text-[#94a3b8] uppercase tracking-wider">
              Materiales y Archivos Adjuntos
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre del Material</label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs"
                  placeholder="Ej: Diapositiva Explicativa PDF"
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tipo de Archivo</label>
                <select
                  className="block w-full px-3 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] rounded-xl text-xs cursor-pointer"
                  value={newMaterialType}
                  onChange={(e) => setNewMaterialType(e.target.value as any)}
                >
                  <option value="pdf">Documento PDF</option>
                  <option value="ppt">Presentación PowerPoint</option>
                  <option value="video">Video Instruccional</option>
                  <option value="image">Diagrama / Imagen</option>
                </select>
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="material-file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleAddMaterial}
                />
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-200 dark:bg-[#273449] hover:bg-slate-300 dark:hover:bg-[#2d3b52] text-slate-700 dark:text-white cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Adjuntar Archivo</span>
                </button>
              </div>
            </div>

            {/* Listado de archivos cargados */}
            {materials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {materials.map((mat) => (
                  <div key={mat.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155]">
                    <div className="flex items-center gap-2.5">
                      {getMaterialIcon(mat.type)}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-705 dark:text-slate-200 truncate">{mat.name}</p>
                        <span className="text-[9px] uppercase text-slate-400 font-bold">{mat.type} • {mat.size}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(mat.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-slate-400 dark:text-slate-500">Ningún archivo cargado por el momento.</p>
            )}
          </div>

          {/* Botones de control del formulario */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#334155]">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingCourse(null);
              }}
              className="px-4.5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-[#273449] transition-colors cursor-pointer text-slate-700 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Curso</span>
            </button>
          </div>
        </form>
      )}

      {/* LISTADO DE CURSOS EXISTENTES */}
      {!isAdding && !editingCourse && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="glass-panel rounded-2.5xl p-6 bg-white dark:bg-[#1e293b] border-slate-205 dark:border-[#334155] flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-[#273449] px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-[#334155]/50">
                    Orden: {course.order}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startEditCourse(course)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#273449] dark:hover:bg-[#2e3c54] text-slate-600 dark:text-[#cbd5e1] transition-colors cursor-pointer"
                      title="Editar Curso"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
                      title="Eliminar Curso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-805 dark:text-[#f8fafc] mb-2 truncate">
                  {course.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-medium leading-relaxed mb-4 line-clamp-3">
                  {course.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-[#2d3a4f] flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-[#cbd5e1]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-450" /> {course.duration}
                </span>
                <span>
                  Archivos: {course.materials?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

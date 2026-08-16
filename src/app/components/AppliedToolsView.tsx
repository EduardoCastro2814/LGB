'use client';

import React, { useState } from 'react';
import { Wrench, PlusCircle, Trash2, Edit2, ClipboardList, CheckCircle2, Clock, XCircle, Info, Calendar } from 'lucide-react';
import { MergedEmployee, AppliedTool } from '../types';

interface AppliedToolsViewProps {
  user: MergedEmployee;
  appliedTools: AppliedTool[];
  onSaveAppliedTool: (tool: Omit<AppliedTool, 'employee_number' | 'status' | 'id'> & { id?: string }) => Promise<void>;
  onDeleteAppliedTool: (id: string) => Promise<void>;
}

const LEAN_TOOLS_LIST = [
  '5 Whys',
  '5S',
  '7 Steps of Office Kaizen',
  '7 Ways',
  'Cell Deployment',
  'Chaku Chaku',
  'Create Flow',
  'Crew Based on Machine Ratio',
  'Crew to Takt',
  'Cross Functional VSM',
  'Cycle Time',
  'Lean',
  'Level Loading',
  'No Hand Fixture',
  'One Piece Flow',
  'Process Mapping',
  'Replenishment',
  'Six Sigma',
  'SMED',
  'Standard WIP',
  'Standard Work',
  'Standard Work Combination Sheet',
  'Gemba Observation Log Sheet',
  'Golf Scoring',
  'Heijunka',
  'Jidoka',
  'Kanban',
  'Supermarket',
  'Takt Time',
  'TPM',
  'Value Stream Mapping',
  'Water Spider'
];

export default function AppliedToolsView({
  user,
  appliedTools,
  onSaveAppliedTool,
  onDeleteAppliedTool
}: AppliedToolsViewProps) {
  // Filtrar las herramientas del usuario actual
  const userTools = appliedTools.filter(t => t.employee_number === user.ID);

  // Estados del formulario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedToolName, setSelectedToolName] = useState('');
  const [customToolName, setCustomToolName] = useState('');
  const [application, setApplication] = useState('');
  const [result, setResult] = useState('');
  const [comment, setComment] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setSelectedToolName('');
    setCustomToolName('');
    setApplication('');
    setResult('');
    setComment('');
    setFormError(null);
  };

  const handleEdit = (tool: AppliedTool) => {
    setEditingId(tool.id);
    const isCustom = !LEAN_TOOLS_LIST.includes(tool.tool_name);
    setSelectedToolName(isCustom ? 'OTRA HERRAMIENTA' : tool.tool_name);
    setCustomToolName(isCustom ? tool.tool_name : '');
    setApplication(tool.application);
    setResult(tool.result);
    setComment(tool.comment);
    setFormError(null);
    setFormSuccess(null);
    
    // Auto-scroll to form
    const formElement = document.getElementById('evidence-form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validar campos
    if (!selectedToolName) {
      setFormError('Por favor seleccione una herramienta.');
      return;
    }
    if (selectedToolName === 'OTRA HERRAMIENTA' && !customToolName.trim()) {
      setFormError('Por favor especifique el nombre de la herramienta.');
      return;
    }
    if (!application.trim()) {
      setFormError('Por favor describa la aplicación en su área.');
      return;
    }
    if (!result.trim()) {
      setFormError('Por favor describa el resultado obtenido.');
      return;
    }
    if (!comment.trim()) {
      setFormError('Por favor agregue un comentario o aprendizaje.');
      return;
    }

    setIsLoading(true);
    try {
      const toolName = selectedToolName === 'OTRA HERRAMIENTA' ? customToolName.trim() : selectedToolName;
      
      await onSaveAppliedTool({
        id: editingId || undefined,
        tool_name: toolName,
        custom_tool_name: selectedToolName === 'OTRA HERRAMIENTA' ? customToolName.trim() : '',
        application: application.trim(),
        result: result.trim(),
        comment: comment.trim()
      });

      setFormSuccess(editingId ? '¡Evidencia actualizada exitosamente!' : '¡Evidencia enviada a revisión exitosamente!');
      resetForm();
    } catch (err: any) {
      setFormError(`Error al procesar la evidencia: ${err.message || 'Intente de nuevo.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este registro de herramienta aplicada?')) {
      try {
        await onDeleteAppliedTool(id);
        if (editingId === id) resetForm();
      } catch (err: any) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-850 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-emerald-600 animate-pulse" />
            <span>Mis Herramientas Lean Aplicadas</span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
            Demuestre sus conocimientos y aplicación práctica de herramientas de mejora continua
          </p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            Aprobadas: {userTools.filter(t => t.status === 'Aprobada').length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Formulario de Evidencia */}
        <div id="evidence-form-card" className="lg:col-span-1 glass-panel rounded-2.5xl p-6 bg-white border border-slate-200 shadow-sm sticky top-6">
          <h3 className="text-sm font-extrabold text-slate-850 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <PlusCircle className="w-4.5 h-4.5 text-emerald-500" />
            <span>{editingId ? 'Editar Evidencia' : 'Registrar Evidencia'}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
            
            {/* Combo de Herramienta */}
            <div>
              <label htmlFor="toolName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Herramienta Aprendida
              </label>
              <select
                id="toolName"
                className="block w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                value={selectedToolName}
                onChange={(e) => {
                  setSelectedToolName(e.target.value);
                  if (e.target.value !== 'OTRA HERRAMIENTA') setCustomToolName('');
                }}
              >
                <option value="">-- Seleccionar herramienta --</option>
                {LEAN_TOOLS_LIST.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
                <option value="OTRA HERRAMIENTA">OTRA HERRAMIENTA (Especificar)</option>
              </select>
            </div>

            {/* Campo Libre si es Otra */}
            {selectedToolName === 'OTRA HERRAMIENTA' && (
              <div className="animate-fade-in">
                <label htmlFor="customToolName" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nombre de la Herramienta
                </label>
                <input
                  type="text"
                  id="customToolName"
                  placeholder="Ej: Andon, Poka Yoke, Hoshin Kanri"
                  className="block w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-slate-850 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                  value={customToolName}
                  onChange={(e) => setCustomToolName(e.target.value)}
                />
              </div>
            )}

            {/* Aplicación en su Área */}
            <div>
              <label htmlFor="application" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Aplicación en su Área
              </label>
              <textarea
                id="application"
                rows={3}
                placeholder="¿Cómo aplicó esta herramienta en su puesto o línea de trabajo?"
                className="block w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-850 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                value={application}
                onChange={(e) => setApplication(e.target.value)}
              />
            </div>

            {/* Resultado Obtenido */}
            <div>
              <label htmlFor="result" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Resultado Obtenido
              </label>
              <textarea
                id="result"
                rows={3}
                placeholder="¿Qué mejoras cuantitativas o cualitativas se obtuvieron?"
                className="block w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-850 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                value={result}
                onChange={(e) => setResult(e.target.value)}
              />
            </div>

            {/* Comentario / Aprendizaje */}
            <div>
              <label htmlFor="comment" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Comentario / Aprendizaje
              </label>
              <textarea
                id="comment"
                rows={2}
                placeholder="¿Qué aprendizajes o conclusiones obtuvo de este ejercicio?"
                className="block w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-850 placeholder-slate-455 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Avisos */}
            {formError && (
              <p className="text-red-655 font-bold flex items-start gap-1 text-[11px] bg-red-50 p-2.5 rounded-xl border border-red-100">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </p>
            )}
            {formSuccess && (
              <p className="text-emerald-700 font-bold flex items-start gap-1 text-[11px] bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </p>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2.5 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer disabled:opacity-50 transition-all text-center"
              >
                {isLoading ? 'Guardando...' : editingId ? 'Actualizar Evidencia' : 'Enviar Evidencia'}
              </button>
            </div>
          </form>
        </div>

        {/* Matriz de Herramientas Registradas */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-2.5xl p-6 bg-white border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-850 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ClipboardList className="w-4.5 h-4.5 text-slate-500" />
                <span>Historial de Evidencias</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total: {userTools.length} registros
              </span>
            </h3>

            {userTools.length === 0 ? (
              <div className="text-center py-16 text-slate-405 flex flex-col items-center">
                <Wrench className="w-12 h-12 stroke-1 text-slate-300 mb-3" />
                <h4 className="text-xs font-bold text-slate-700 mb-1">Sin Evidencias Registradas</h4>
                <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                  Aún no has registrado ninguna herramienta Lean aplicada. Completa el formulario de la izquierda para enviar tu primera evidencia a revisión.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3.5 pl-1">Herramienta</th>
                      <th className="pb-3.5">Detalles de Aplicación</th>
                      <th className="pb-3.5">Fecha</th>
                      <th className="pb-3.5">Estado</th>
                      <th className="pb-3.5 text-right pr-1">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {userTools.map((tool) => {
                      const dateStr = tool.created_at 
                        ? new Date(tool.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Reciente';

                      return (
                        <tr key={tool.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-1 font-bold text-slate-800 align-top max-w-[140px] truncate" title={tool.tool_name}>
                            {tool.tool_name}
                          </td>
                          <td className="py-4 pr-3 align-top">
                            <div className="flex flex-col gap-1.5 max-w-sm font-semibold text-slate-700">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aplicación</span>
                                <p className="text-slate-650 mt-0.5 leading-relaxed font-normal whitespace-pre-wrap">{tool.application}</p>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resultado</span>
                                <p className="text-slate-650 mt-0.5 leading-relaxed font-normal whitespace-pre-wrap">{tool.result}</p>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comentario / Aprendizaje</span>
                                <p className="text-slate-500 mt-0.5 leading-relaxed font-normal whitespace-pre-wrap italic">&quot;{tool.comment}&quot;</p>
                              </div>
                              
                              {tool.admin_comment && (
                                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Comentarios del Revisor</span>
                                  <p className="text-slate-600 mt-0.5 leading-relaxed font-normal">{tool.admin_comment}</p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 font-semibold text-slate-500 align-top whitespace-nowrap text-[10px]">
                            <div className="flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{dateStr}</span>
                            </div>
                          </td>
                          <td className="py-4 align-top whitespace-nowrap">
                            <div className="mt-0.5">
                              {tool.status === 'Aprobada' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Aprobada</span>
                                </span>
                              )}
                              {tool.status === 'Rechazada' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Rechazada</span>
                                </span>
                              )}
                              {tool.status === 'Pendiente' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Pendiente</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-right pr-1 align-top whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleEdit(tool)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                                title="Editar evidencia"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(tool.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-600 transition-all cursor-pointer border border-transparent hover:border-red-500/15"
                                title="Eliminar evidencia"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

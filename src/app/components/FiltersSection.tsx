'use client';

import React from 'react';
import { Search, Layers, CheckCircle2, Sparkles, Clock, Filter } from 'lucide-react';
import { LGBStatus, TipoPersonal } from '../types';

interface FiltersSectionProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedDept: string;
  setSelectedDept: (val: string) => void;
  selectedStatus: LGBStatus | 'Todos';
  setSelectedStatus: (val: LGBStatus | 'Todos') => void;
  selectedTipoPersonal: TipoPersonal | 'Todos';
  setSelectedTipoPersonal: (val: TipoPersonal | 'Todos') => void;
  departments: string[];
  filteredCount?: number;
  totalCount?: number;
}

export default function FiltersSection({
  searchTerm,
  setSearchTerm,
  selectedDept,
  setSelectedDept,
  selectedStatus,
  setSelectedStatus,
  selectedTipoPersonal,
  setSelectedTipoPersonal,
  departments,
  filteredCount,
  totalCount,
}: FiltersSectionProps) {
  const statusFilters: { label: string; value: LGBStatus | 'Todos'; icon: any; colorClass: string; activeColor: string }[] = [
    { 
      label: 'Todos', 
      value: 'Todos', 
      icon: Layers, 
      colorClass: 'hover:bg-slate-100 text-slate-500', 
      activeColor: 'bg-slate-900 text-white border-transparent' 
    },
    { 
      label: 'Certificados', 
      value: 'Certificado', 
      icon: CheckCircle2, 
      colorClass: 'hover:bg-emerald-50 text-emerald-500 border-slate-200', 
      activeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/35' 
    },
    { 
      label: 'Potencial', 
      value: 'Potencial', 
      icon: Sparkles, 
      colorClass: 'hover:bg-amber-50 text-amber-500 border-slate-200', 
      activeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/35' 
    },
    { 
      label: 'Por Certificar', 
      value: 'Por Certificar', 
      icon: Clock, 
      colorClass: 'hover:bg-red-50 text-red-500 border-slate-200', 
      activeColor: 'bg-red-500/10 text-red-600 border-red-500/35' 
    },
  ];

  return (
    <section className="glass-panel rounded-2xl p-5 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 animate-fade-in bg-white border-slate-200" style={{ animationDelay: '0.15s' }}>
      {/* Row of Search and selectors */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto flex-1">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 lg:flex-initial lg:max-w-xs flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID, Nombre, Depto, Estatus..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
          />
          {filteredCount !== undefined && totalCount !== undefined && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-505 bg-slate-200/60 px-2 py-1 rounded-lg font-mono">
              {filteredCount}/{totalCount}
            </span>
          )}
        </div>

        {/* Selector Tipo de Personal (Filtro Global 1) */}
        <div className="w-full sm:flex-1 lg:flex-initial lg:w-[180px] flex-shrink-0">
          <select
            value={selectedTipoPersonal}
            onChange={(e) => setSelectedTipoPersonal(e.target.value as TipoPersonal | 'Todos')}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold cursor-pointer"
          >
            <option value="Todos">Personal: Todos</option>
            <option value="IDL">Personal: IDL (Indirecto)</option>
            <option value="DL">Personal: DL (Directo)</option>
          </select>
        </div>

        {/* Selector Departamento (Filtro Global 2) */}
        <div className="w-full sm:flex-1 lg:flex-initial lg:w-[220px] flex-shrink-0">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold cursor-pointer"
          >
            <option value="Todos">Depto: Todos</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                Depto: {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status pills selector */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
        {statusFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedStatus === filter.value;
          
          return (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                isActive 
                  ? filter.activeColor
                  : `bg-transparent text-slate-500 border-slate-200 ${filter.colorClass}`
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

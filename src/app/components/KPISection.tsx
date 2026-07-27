'use client';

import React from 'react';
import { Users, CheckCircle2, Sparkles, Clock, Percent, ClipboardList } from 'lucide-react';
import { KPIStats, TipoPersonal } from '../types';

interface KPISectionProps {
  stats: KPIStats;
  selectedTipoPersonal: TipoPersonal | 'Todos';
}

export default function KPISection({ stats, selectedTipoPersonal }: KPISectionProps) {
  const { totalHeadcount, certifiedCount, potentialCount, pendingCount, globalPercentage } = stats;

  const kpiItems = [
    {
      title: 'Headcount Total',
      value: totalHeadcount.toLocaleString(),
      percentage: '100%',
      subText: 'Colaboradores del Site',
      icon: Users,
      colorClass: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20',
      barColor: 'bg-blue-500',
      barWidth: 'w-full'
    },
    {
      title: 'Certificados',
      value: certifiedCount.toLocaleString(),
      percentage: `${totalHeadcount > 0 ? Math.round((certifiedCount / totalHeadcount) * 100) : 0}%`,
      subText: 'Complete / Complete-Resigned',
      icon: CheckCircle2,
      colorClass: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20',
      barColor: 'bg-emerald-500',
      barWidth: totalHeadcount > 0 ? `${Math.round((certifiedCount / totalHeadcount) * 100)}%` : 'w-0'
    },
    {
      title: 'Potencial de Certificación',
      value: potentialCount.toLocaleString(),
      percentage: `${totalHeadcount > 0 ? Math.round((potentialCount / totalHeadcount) * 100) : 0}%`,
      subText: 'Estatus: Create Form',
      icon: Sparkles,
      colorClass: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20',
      barColor: 'bg-amber-500',
      barWidth: totalHeadcount > 0 ? `${Math.round((potentialCount / totalHeadcount) * 100)}%` : 'w-0'
    },
    {
      title: 'Por Certificar',
      value: pendingCount.toLocaleString(),
      percentage: `${totalHeadcount > 0 ? Math.round((pendingCount / totalHeadcount) * 100) : 0}%`,
      subText: 'Sin acción válida o sin registro',
      icon: Clock,
      colorClass: 'text-red-500 bg-red-500/10 dark:bg-red-500/20 border-red-500/20',
      barColor: 'bg-red-500',
      barWidth: totalHeadcount > 0 ? `${Math.round((pendingCount / totalHeadcount) * 100)}%` : 'w-0'
    },
    {
      title: 'Avance de Certificación',
      value: `${globalPercentage}%`,
      percentage: `${globalPercentage}%`,
      subText: 'Meta Global B29',
      icon: Percent,
      colorClass: 'text-teal-500 bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/20',
      barColor: 'bg-teal-500',
      barWidth: `${globalPercentage}%`
    }
  ];

  return (
    <section 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 animate-fade-in" 
      style={{ animationDelay: '0.1s' }}
    >
      {/* Primeros 5 KPIs tradicionales */}
      {kpiItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div 
            key={index} 
            className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-[155px] bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
                  {item.title}
                </span>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-[#f8fafc] mt-1">
                  {item.value}
                </div>
              </div>
              <div className={`p-2 rounded-xl border ${item.colorClass}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="w-full mt-2">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-[#273449] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.barColor} transition-all duration-500`}
                  style={{ width: item.percentage }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center mt-2 text-[10px] font-semibold">
                <span className="text-slate-500 dark:text-[#cbd5e1] truncate max-w-[70%]">
                  {item.subText}
                </span>
                <span className="text-slate-700 dark:text-[#f8fafc] font-bold">
                  {item.percentage}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 6. NUEVA TARJETA KPI: Resumen Filtrado (Cambio 4) */}
      <div 
        className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-[155px] bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155] lg:col-span-1 border-l-4 border-l-emerald-500 dark:border-l-emerald-500"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-[#94a3b8] uppercase tracking-wider">
              Resumen Filtrado
            </span>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              Filtro: {selectedTipoPersonal === 'Todos' ? 'Todos (IDL + DL)' : selectedTipoPersonal}
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 text-[10px] font-bold text-slate-500 dark:text-[#cbd5e1] mt-2">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/40 pb-0.5">
            <span>HC Total:</span>
            <span className="text-slate-800 dark:text-[#f8fafc]">{totalHeadcount}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/40 py-0.5">
            <span>Certificados:</span>
            <span className="text-emerald-600 dark:text-emerald-450">{certifiedCount} ({totalHeadcount > 0 ? Math.round((certifiedCount / totalHeadcount) * 100) : 0}%)</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/40 py-0.5">
            <span>Potencial:</span>
            <span className="text-amber-500">{potentialCount}</span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span>Por Certificar:</span>
            <span className="text-red-500">{pendingCount}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

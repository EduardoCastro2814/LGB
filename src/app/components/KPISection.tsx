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
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
      barColor: 'bg-blue-500',
      barWidth: 'w-full'
    },
    {
      title: 'Certificados',
      value: certifiedCount.toLocaleString(),
      percentage: `${totalHeadcount > 0 ? Math.round((certifiedCount / totalHeadcount) * 100) : 0}%`,
      subText: 'Complete / Complete-Resigned',
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      barColor: 'bg-emerald-500',
      barWidth: totalHeadcount > 0 ? `${Math.round((certifiedCount / totalHeadcount) * 100)}%` : 'w-0'
    },
    {
      title: 'Potencial',
      value: potentialCount.toLocaleString(),
      percentage: `${totalHeadcount > 0 ? Math.round((potentialCount / totalHeadcount) * 100) : 0}%`,
      subText: 'Estatus: Create Form',
      icon: Sparkles,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
      barColor: 'bg-amber-500',
      barWidth: totalHeadcount > 0 ? `${Math.round((potentialCount / totalHeadcount) * 100)}%` : 'w-0'
    },
    {
      title: 'Por Certificar',
      value: pendingCount.toLocaleString(),
      percentage: `${totalHeadcount > 0 ? Math.round((pendingCount / totalHeadcount) * 100) : 0}%`,
      subText: 'Sin acción válida o registro',
      icon: Clock,
      colorClass: 'text-red-655 bg-red-50 border-red-100',
      barColor: 'bg-red-500',
      barWidth: totalHeadcount > 0 ? `${Math.round((pendingCount / totalHeadcount) * 100)}%` : 'w-0'
    },
    {
      title: 'Avance',
      value: `${globalPercentage}%`,
      percentage: `${globalPercentage}%`,
      subText: 'Meta Global B29',
      icon: Percent,
      colorClass: 'text-teal-600 bg-teal-50 border-teal-100',
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
            className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-[155px] bg-white border border-slate-200"
          >
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate" title={item.title}>
                  {item.title}
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
                  {item.value}
                </div>
              </div>
              <div className={`p-1.5 sm:p-2 rounded-xl border flex-shrink-0 ${item.colorClass}`}>
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>

            <div className="w-full mt-2">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.barColor} transition-all duration-500`}
                  style={{ width: item.percentage }}
                ></div>
              </div>
              
              <div className="flex justify-between items-end mt-2 text-[9px] sm:text-[10px] font-semibold gap-1">
                <span className="text-slate-500 whitespace-normal line-clamp-2 flex-1 leading-tight" title={item.subText}>
                  {item.subText}
                </span>
                <span className="text-slate-700 font-bold flex-shrink-0 self-end">
                  {item.percentage}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 6. NUEVA TARJETA KPI: Resumen Filtrado */}
      <div 
        className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-[155px] bg-white border border-slate-200 border-l-4 border-l-emerald-500"
      >
        <div className="flex justify-between items-start gap-1">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Resumen Filtrado
            </span>
            <div className="text-[10px] font-bold text-emerald-600 mt-0.5 truncate" title={selectedTipoPersonal === 'Todos' ? 'Todos (IDL + DL)' : selectedTipoPersonal}>
              Filtro: {selectedTipoPersonal === 'Todos' ? 'Todos' : selectedTipoPersonal}
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 text-[9px] sm:text-[10px] font-bold text-slate-500 mt-2">
          <div className="flex justify-between border-b border-slate-100 pb-0.5">
            <span>HC Total:</span>
            <span className="text-slate-800">{totalHeadcount}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-0.5">
            <span>Certificados:</span>
            <span className="text-emerald-600">{certifiedCount} ({totalHeadcount > 0 ? Math.round((certifiedCount / totalHeadcount) * 100) : 0}%)</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 py-0.5">
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

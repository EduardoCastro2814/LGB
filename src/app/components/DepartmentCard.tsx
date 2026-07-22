'use client';

import React from 'react';
import { DepartmentSummary } from '../types';
import { ChevronRight, Users, CheckCircle2, Clock } from 'lucide-react';

interface DepartmentCardProps {
  summary: DepartmentSummary;
  onClick: () => void;
}

export default function DepartmentCard({ summary, onClick }: DepartmentCardProps) {
  const { Departamento, totalHC, certified, potential, pending, percentage } = summary;

  // Determinar color del porcentaje
  let pctColorClass = 'text-red-500 dark:text-red-400';
  let barColorClass = 'bg-red-500';
  if (percentage >= 70) {
    pctColorClass = 'text-emerald-600 dark:text-emerald-400';
    barColorClass = 'bg-emerald-500';
  } else if (percentage >= 35) {
    pctColorClass = 'text-amber-500 dark:text-amber-400';
    barColorClass = 'bg-amber-500';
  }

  const pendientesTotal = potential + pending;

  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between h-[135px] bg-slate-50 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] hover:border-slate-350 dark:hover:border-[#2d3b52] hover:bg-slate-100 dark:hover:bg-[#2d3b52] group transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="max-w-[70%]">
          <h3 className="text-sm font-bold text-slate-800 dark:text-[#f8fafc] group-hover:text-emerald-650 dark:group-hover:text-emerald-400 transition-colors truncate">
            {Departamento}
          </h3>
          <p className="text-[9px] text-slate-400 dark:text-[#94a3b8] font-bold uppercase mt-0.5 tracking-wider">
            Depto
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <span className={`text-xl font-extrabold ${pctColorClass}`}>{percentage}%</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#94a3b8] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      <div className="mt-1">
        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-200 dark:bg-[#0f172a] rounded-full overflow-hidden">
          <div 
            className={`h-full ${barColorClass} transition-all duration-300`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-1 mt-3.5 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 dark:text-[#94a3b8] flex items-center gap-0.5 uppercase">
              <Users className="w-2.5 h-2.5 text-slate-400" /> HC
            </span>
            <span className="text-xs font-extrabold text-slate-700 dark:text-[#f8fafc] mt-0.5">
              {totalHC}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-200 dark:border-[#334155]">
            <span className="text-[8px] font-bold text-slate-400 dark:text-[#94a3b8] flex items-center gap-0.5 uppercase">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> Cert
            </span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-450 mt-0.5">
              {certified}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-400 dark:text-[#94a3b8] flex items-center gap-0.5 uppercase">
              <Clock className="w-2.5 h-2.5 text-red-500" /> Pend
            </span>
            <span className="text-xs font-extrabold text-red-500 mt-0.5">
              {pendientesTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

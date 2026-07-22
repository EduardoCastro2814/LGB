'use client';

import React from 'react';
import { Award, Sun, Moon, LayoutDashboard, Settings, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

interface DashboardHeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  currentRole: UserRole;
  setCurrentRole: (val: UserRole) => void;
  currentView: 'dashboard' | 'config';
  setCurrentView: (val: 'dashboard' | 'config') => void;
}

export default function DashboardHeader({
  darkMode,
  setDarkMode,
  currentRole,
  setCurrentRole,
  currentView,
  setCurrentView,
}: DashboardHeaderProps) {
  return (
    <header className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 animate-fade-in bg-white dark:bg-[#1e293b] border-slate-200 dark:border-[#334155]">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-[#f8fafc]">
            Lean Green Belt Certification Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#cbd5e1] font-medium">
            Métricas de Certificación y Control de Headcount | Philo B29 Site
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Selector de Rol */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#273449] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#cbd5e1]">
          <UserCheck className="w-3.5 h-3.5 text-slate-500 dark:text-[#94a3b8]" />
          <select
            value={currentRole}
            onChange={(e) => {
              const role = e.target.value as UserRole;
              setCurrentRole(role);
              if (role === 'General') {
                setCurrentView('dashboard');
              }
            }}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-[#cbd5e1] border-none outline-none focus:ring-0 cursor-pointer"
          >
            <option value="General" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Usuario General</option>
            <option value="Admin" className="dark:bg-[#1e293b] dark:text-[#f8fafc]">Administrador</option>
          </select>
        </div>

        {/* Botón de Navegación Condicional */}
        {currentRole === 'Admin' && (
          <button
            onClick={() => setCurrentView(currentView === 'dashboard' ? 'config' : 'dashboard')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-[#f8fafc] dark:text-slate-900 hover:opacity-90 transition-all cursor-pointer shadow-sm"
          >
            {currentView === 'dashboard' ? (
              <>
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="w-4 h-4" />
                <span>Ver Dashboard</span>
              </>
            )}
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#e2e8f0] dark:bg-[#273449] dark:hover:bg-[#2d3b52] text-slate-600 dark:text-[#cbd5e1] border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer"
          title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      </div>
    </header>
  );
}

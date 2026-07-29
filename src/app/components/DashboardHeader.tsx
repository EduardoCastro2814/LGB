'use client';

import React from 'react';
import { Award, Sun, Moon, LayoutDashboard, Settings, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

interface DashboardHeaderProps {
  currentRole: UserRole;
  setCurrentRole: (val: UserRole) => void;
  currentView: 'dashboard' | 'config';
  setCurrentView: (val: 'dashboard' | 'config') => void;
}

export default function DashboardHeader({
  currentRole,
  setCurrentRole,
  currentView,
  setCurrentView,
}: DashboardHeaderProps) {
  return (
    <header className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 animate-fade-in bg-white border-slate-200">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-500">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Lean Green Belt Certification Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Métricas de Certificación y Control de Headcount | Philo B29 Site
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Selector de Rol */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={currentRole}
            onChange={(e) => {
              const role = e.target.value as UserRole;
              setCurrentRole(role);
              if (role === 'General') {
                setCurrentView('dashboard');
              }
            }}
            className="bg-transparent text-xs font-bold text-slate-700 border-none outline-none focus:ring-0 cursor-pointer"
          >
            <option value="General">Usuario General</option>
            <option value="Admin">Administrador</option>
          </select>
        </div>

        {/* Botón de Navegación Condicional */}
        {currentRole === 'Admin' && (
          <button
            onClick={() => setCurrentView(currentView === 'dashboard' ? 'config' : 'dashboard')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:opacity-90 transition-all cursor-pointer shadow-sm"
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
      </div>
    </header>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Award, 
  LayoutDashboard, 
  Grid, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User, 
  GraduationCap 
} from 'lucide-react';
import { MergedEmployee, UserRole } from '../types';

interface SidebarProps {
  user: MergedEmployee;
  role: UserRole;
  currentView: string;
  onViewChange: (view: string) => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  user,
  role,
  currentView,
  onViewChange,
  darkMode,
  onDarkModeToggle,
  onLogout,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard LGB', icon: LayoutDashboard },
    { id: 'matrix', label: 'Matriz de Entrenamiento', icon: Grid },
    { id: 'academia', label: 'Academia Lean', icon: GraduationCap },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  const generalMenu = [
    { id: 'academia', label: 'Academia Lean', icon: GraduationCap },
  ];

  const menuItems = role === 'Admin' ? adminMenu : generalMenu;

  // Inicial del nombre del usuario para el avatar
  const avatarLetter = user.Nombre ? user.Nombre.trim().charAt(0).toUpperCase() : 'U';

  const handleItemClick = (id: string) => {
    onViewChange(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón de Menú Móvil (Hamburguesa) */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-2xl bg-white dark:bg-[#1e293b] text-slate-800 dark:text-[#f8fafc] border border-slate-200 dark:border-[#334155] shadow-md hover:bg-slate-50 dark:hover:bg-[#2d3b52] transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop para Móvil */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 flex flex-col bg-white dark:bg-[#111c2e] border-r border-slate-250 dark:border-[#1e2d42] transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Encabezado Logo */}
        <div className="p-6 flex items-center gap-3.5 border-b border-slate-250 dark:border-[#1e2d42]">
          <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-500 dark:text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-[#f8fafc]">
              Lean B29
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Academy & Tracker
            </p>
          </div>
        </div>

        {/* Perfil del Usuario */}
        <div className="p-6 border-b border-slate-250 dark:border-[#1e2d42] bg-slate-50/50 dark:bg-[#162237]/45">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/15 uppercase">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-[#f8fafc] truncate" title={user.Nombre}>
                {user.Nombre}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-550 font-medium truncate" title={user.Departamento}>
                {user.Departamento}
              </p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                role === 'Admin' 
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/15'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/15'
              }`}>
                {role === 'Admin' ? 'Administrador' : 'Colaborador'}
              </span>
            </div>
          </div>
          <div className="mt-4.5 pt-4 border-t border-slate-250/60 dark:border-[#1e2d42]/70 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-[#cbd5e1] gap-1 bg-white/50 dark:bg-black/10 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1a2b42]">
            <span>ID: <span className="font-mono text-slate-700 dark:text-slate-200">{user.ID}</span></span>
            <span className="text-slate-300 dark:text-[#1e2d42]">|</span>
            <span className="uppercase text-[9px]">{user.TipoPersonal}</span>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-2.5">
            Navegación
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white shadow-lg shadow-emerald-500/15'
                    : 'text-slate-650 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#162237] border border-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? '' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar (Ajustes y Logout) */}
        <div className="p-4 border-t border-slate-250 dark:border-[#1e2d42] space-y-2 bg-slate-50/30 dark:bg-[#121d2f]">
          {/* Toggle de Modo Claro/Oscuro */}
          <button
            onClick={onDarkModeToggle}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-650 dark:text-[#cbd5e1] hover:bg-slate-100 dark:hover:bg-[#1a283e] transition-colors cursor-pointer border border-slate-200/60 dark:border-[#1e2d42]"
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Sun className="w-4 h-4 text-amber-450" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-[#25354e] text-slate-650 dark:text-slate-350">
              {darkMode ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Botón de Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

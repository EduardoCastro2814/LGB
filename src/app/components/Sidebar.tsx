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
  onLogout: () => void;
}

export default function Sidebar({
  user,
  role,
  currentView,
  onViewChange,
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
          className="p-3 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-md hover:bg-slate-50 transition-colors cursor-pointer"
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
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 flex flex-col bg-white border-r border-slate-250 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Encabezado Logo */}
        <div className="p-6 flex items-center gap-3.5 border-b border-slate-250">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              Lean B29
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Academy & Tracker
            </p>
          </div>
        </div>

        {/* Perfil del Usuario */}
        <div className="p-6 border-b border-slate-250 bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/15 uppercase">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate" title={user.Nombre}>
                {user.Nombre}
              </p>
              <p className="text-[11px] text-slate-400 font-medium truncate" title={user.Departamento}>
                {user.Departamento}
              </p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider ${
                role === 'Admin' 
                  ? 'bg-purple-500/10 text-purple-600 border border-purple-500/15'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/15'
              }`}>
                {role === 'Admin' ? 'Administrador' : 'Colaborador'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3.5 border-t border-slate-250/60 flex items-center justify-between text-[10px] font-bold text-slate-500 gap-1 bg-white/50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>ID: <span className="font-mono text-slate-700">{user.ID}</span></span>
            <span className="text-slate-300">|</span>
            <span className="uppercase text-[8px]">{user.TipoPersonal}</span>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
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
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15'
                    : 'text-slate-650 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? '' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar (Ajustes y Logout) */}
        <div className="p-4 border-t border-slate-250 space-y-2 bg-slate-50/30">
          {/* Botón de Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import { Award, KeyRound, ArrowRight, ShieldAlert, AlertCircle } from 'lucide-react';
import { MergedEmployee, UserRole } from '../types';
import { normalizeId } from '../utils/dataProcessor';

interface LoginViewProps {
  employees: MergedEmployee[];
  onLogin: (employee: MergedEmployee, role: UserRole) => void;
  hcLoaded: boolean;
}

export default function LoginView({ employees, onLogin, hcLoaded }: LoginViewProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedInput = normalizeId(employeeId);
    if (!normalizedInput) {
      setError('Por favor, ingrese un número de empleado válido.');
      return;
    }

    // 1. Caso especial: si no hay base de datos cargada y se ingresa el ID de administrador inicial
    if (!hcLoaded || employees.length === 0) {
      if (normalizedInput === '1163146') {
        const mockAdmin: MergedEmployee = {
          ID: '1163146',
          Nombre: 'Administrador Inicial',
          Departamento: 'BE',
          Puesto: 'Administrador del Sistema',
          Manager: 'N/A',
          Action: '',
          Estatus: 'Certificado',
          TipoPersonal: 'IDL',
          role: 'Admin'
        };
        onLogin(mockAdmin, 'Admin');
        return;
      }
      setError('La base de datos de headcount aún no está cargada. Ingrese el número del administrador inicial (1163146) para acceder y configurarla.');
      return;
    }

    // 2. Buscar en la lista de empleados
    const foundEmployee = employees.find(emp => normalizeId(emp.ID) === normalizedInput);

    if (foundEmployee) {
      const role: UserRole = foundEmployee.role === 'Admin' ? 'Admin' : 'General';
      onLogin(foundEmployee, role);
    } else {
      setError(`No se encontró ningún empleado con el número "${employeeId}". Verifique el número e inténtelo de nuevo.`);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc] text-slate-800 relative overflow-hidden">
      {/* Círculos de gradiente decorativos */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 bg-white/90 border border-slate-200 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in">
        
        {/* Encabezado Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-emerald-600 mb-4 animate-pulse">
            <Award className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-850">
            Lean Green Belt Academy
          </h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1.5 tracking-wider">
            Plataforma de Entrenamiento y Certificación | B29
          </p>
        </div>

        {/* Alerta de datos no cargados */}
        {!hcLoaded && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Base de Datos Sin Cargar</p>
              <p className="font-normal text-slate-600 mt-0.5">
                Para el primer ingreso, digite &quot;<span className="text-emerald-600 font-mono font-bold">admin</span>&quot; para cargar los archivos de headcount Excel en Configuración.
              </p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="employeeId" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Número de Empleado
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                id="employeeId"
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono font-bold"
                placeholder="Ej: 520478 o 'admin'"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoComplete="off"
              />
            </div>
            {error && (
              <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
          >
            <span>Ingresar al Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Lean Enterprise Integration Platform | Site Philo B29
          </p>
        </div>
      </div>
    </div>
  );
}

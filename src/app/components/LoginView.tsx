'use client';

import React, { useState } from 'react';
import { Award, KeyRound, ArrowRight, ShieldAlert, AlertCircle, Users } from 'lucide-react';
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

    // 1. Caso especial: si no hay base de datos cargada y se ingresa un ID de administrador de pruebas
    if (!hcLoaded || employees.length === 0) {
      if (normalizedInput.toLowerCase() === 'admin' || normalizedInput === '123' || normalizedInput.toLowerCase() === 'admin-test') {
        const mockAdmin: MergedEmployee = {
          ID: 'ADMIN-TEST',
          Nombre: 'Administrador de Pruebas',
          Departamento: 'BE', // Pertenece a BE para ser administrador
          Puesto: 'Ingeniero de Procesos Principal',
          Manager: 'Director de Planta',
          Action: '',
          Estatus: 'Certificado',
          TipoPersonal: 'IDL',
        };
        onLogin(mockAdmin, 'Admin');
        return;
      }
      setError('La base de datos de headcount aún no está cargada. Ingrese "admin" para acceder como Administrador de Pruebas y cargar los archivos Excel.');
      return;
    }

    // 2. Buscar en la lista de empleados
    const foundEmployee = employees.find(emp => normalizeId(emp.ID) === normalizedInput);

    if (foundEmployee) {
      // Determinar rol: si el departamento es BE, es Admin. De lo contrario, General.
      const role: UserRole = foundEmployee.Departamento.toUpperCase() === 'BE' ? 'Admin' : 'General';
      onLogin(foundEmployee, role);
    } else {
      // Como contingencia, permitir un ID administrador universal 'admin'
      if (normalizedInput.toLowerCase() === 'admin') {
        const mockAdmin: MergedEmployee = {
          ID: 'ADMIN-TEST',
          Nombre: 'Administrador de Contingencia',
          Departamento: 'BE',
          Puesto: 'Soporte del Sistema',
          Manager: 'Administrador de Red',
          Action: '',
          Estatus: 'Certificado',
          TipoPersonal: 'IDL',
        };
        onLogin(mockAdmin, 'Admin');
        return;
      }
      setError(`No se encontró ningún empleado con el número "${employeeId}". Verifique el número e inténtelo de nuevo.`);
    }
  };

  const handleTestLogin = (isAdmin: boolean) => {
    if (employees.length > 0) {
      if (isAdmin) {
        // Encontrar el primer empleado del departamento BE
        const beEmp = employees.find(e => e.Departamento.toUpperCase() === 'BE');
        if (beEmp) {
          onLogin(beEmp, 'Admin');
          return;
        }
      } else {
        // Encontrar el primer empleado de producción / DL (cualquiera no BE)
        const dlEmp = employees.find(e => e.Departamento.toUpperCase() !== 'BE' && e.TipoPersonal === 'DL') 
                     || employees.find(e => e.Departamento.toUpperCase() !== 'BE');
        if (dlEmp) {
          onLogin(dlEmp, 'General');
          return;
        }
      }
    }

    // Si no hay empleados, usar mock
    const mockUser: MergedEmployee = isAdmin
      ? { ID: '1001', Nombre: 'Carlos Admin BE', Departamento: 'BE', Puesto: 'LGB Coordinator', Manager: 'Supervisor N1', Action: '', Estatus: 'Potencial', TipoPersonal: 'IDL' }
      : { ID: '5002', Nombre: 'Juan Operador DL', Departamento: 'Ensamble', Puesto: 'Operador DL B29', Manager: 'Carlos Admin BE', Action: '', Estatus: 'Por Certificar', TipoPersonal: 'DL' };
    
    onLogin(mockUser, isAdmin ? 'Admin' : 'General');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Círculos de gradiente decorativos */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 bg-slate-900/80 dark:bg-slate-900/80 border-slate-800 dark:border-slate-800 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in">
        
        {/* Encabezado Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-4 animate-pulse">
            <Award className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Lean Green Belt Academy
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-1 tracking-wider">
            Plataforma de Entrenamiento y Certificación | B29
          </p>
        </div>

        {/* Alerta de datos no cargados */}
        {!hcLoaded && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Base de Datos Sin Cargar</p>
              <p className="font-normal text-slate-400 mt-0.5">
                Para el primer ingreso, digite &quot;<span className="text-emerald-400 font-mono font-bold">admin</span>&quot; para cargar los archivos de headcount Excel en Configuración.
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
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                id="employeeId"
                className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                placeholder="Ej: 520478 o 'admin'"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                autoComplete="off"
              />
            </div>
            {error && (
              <p className="mt-2 text-xs font-semibold text-red-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-350 active:bg-emerald-500 transition-all cursor-pointer shadow-lg shadow-emerald-400/15"
          >
            <span>Ingresar al Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Acceso Rápido Demo (Testing Buttons) */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-center text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-3.5">
            Acceso Rápido de Pruebas
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTestLogin(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-350 border border-slate-850 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Colaborador DL</span>
            </button>
            <button
              onClick={() => handleTestLogin(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-slate-950 hover:bg-slate-800 text-slate-350 border border-slate-850 hover:border-slate-700 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Administrador BE</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            Lean Enterprise Integration Platform | Site Philo B29
          </p>
        </div>
      </div>
    </div>
  );
}

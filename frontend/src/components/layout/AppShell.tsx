import React from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '../../store/auth.store';
import { storageEngine } from '../../services/storageEngine';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Bird,
  Swords,
  Heart,
  Trophy,
  GitBranch,
  Plus,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Centro de Control', badge: 'Tiempo Real' },
  { to: '/aves',      icon: Bird,            label: 'Inventario de Aves', badge: '12 aves' },
  { to: '/pedigree',  icon: GitBranch,       label: 'Árbol Genealógico & Linajes' },
  { to: '/peleas',    icon: Swords,          label: 'Registro de Combates', badge: '8 combates' },
  { to: '/sgt',       icon: Trophy,          label: 'Puntaje Genético (SGT)' },
  { to: '/salud',     icon: Heart,           label: 'Sanidad & Vacunas', badge: '2 pendientes' },
];

export const AppShell: React.FC = () => {
  const { isAuthenticated, layoutMode, tenant, user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleResetData = () => {
    storageEngine.resetToDefault();
    toast.success('Datos de crianza restablecidos al estado inicial');
    window.location.reload();
  };

  // Modo Vista Teléfono Móvil
  if (layoutMode === 'mobile-preview') {
    return (
      <div className="min-h-screen bg-[#070A10] py-6 px-2 flex justify-center items-start">
        <div className="mobile-frame rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
          <main className="flex-1 overflow-y-auto" style={{ paddingBottom: '80px' }}>
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>
    );
  }

  // Modo Pantalla Completa (Escritorio Ejecutivo + Móvil responsivo)
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col lg:flex-row">
      {/* BARRA LATERAL EJECUTIVA (Pantallas Grandes >= 1024px) */}
      <aside className="hidden lg:flex flex-col w-72 bg-dark-card/95 backdrop-blur-xl border-r border-dark-border/80 sticky top-0 h-screen z-40 select-none">
        {/* Cabecera con Escudo y Marca */}
        <div className="p-5 border-b border-dark-border/70 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950 border border-primary-500/50 flex items-center justify-center shadow-glow-red flex-shrink-0">
            <span className="text-2xl">🐓</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white font-display tracking-tight">GALLERO</span>
              <span className="font-black text-lg bg-gradient-to-r from-gold-400 to-amber-500 bg-clip-text text-transparent font-display">PRO</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">Crianza de Alta Casta</p>
          </div>
        </div>

        {/* Ficha de Criadero Activo */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-dark-surface to-dark-bg border border-dark-border/80 shadow-inner">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Criadero Activo</span>
            <span className="inline-flex items-center gap-1 bg-gold-950/80 border border-gold-600/50 text-gold-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              <Award size={10} className="text-gold-400" />
              PLAN MAESTRO
            </span>
          </div>
          <h4 className="font-bold text-sm text-slate-100 truncate">
            {tenant?.nombre || 'Criadero Los Gavilanes'}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{user?.nombre || 'Don Gonzalo Valderrama'}</p>
        </div>

        {/* Botón de Acción Rápida */}
        <div className="px-4 mb-2">
          <button
            onClick={() => navigate('/aves/nueva')}
            className="w-full btn-primary text-xs py-2.5 shadow-glow-red flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Registrar Nueva Ave</span>
          </button>
        </div>

        {/* Navegación Principal en Español */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 group',
                  isActive
                    ? 'bg-gradient-to-r from-primary-950/90 to-primary-900/60 border border-primary-500/40 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-dark-surface/80',
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-primary-400 group-hover:text-primary-300" />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="text-[10px] bg-dark-surface border border-dark-border text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Pie de la Barra Lateral */}
        <div className="p-4 border-t border-dark-border/70 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Modo Local Conectado
            </span>
            <button
              onClick={handleResetData}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline cursor-pointer"
              title="Restaurar datos de prueba al estado inicial"
            >
              <RefreshCw size={11} />
              Restablecer
            </button>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-dark-surface/50 hover:bg-red-950/40 border border-dark-border/50 hover:border-red-800/40 text-slate-400 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <main className="flex-1 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* NAVEGACIÓN MÓVIL (Pantallas < 1024px) */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  showBack = false,
  showNotifications = false,
  rightAction,
}) => {
  const navigate = useNavigate();
  const { tenant, layoutMode, toggleLayoutMode, isDemoMode } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border/80 px-4 h-16 flex items-center justify-between transition-all">
      {/* Izquierda */}
      <div className="flex items-center gap-3 min-w-0">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-1 rounded-xl bg-dark-surface/80 hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Regresar a la pantalla anterior"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950 border border-primary-500/50 flex items-center justify-center shadow-glow-red flex-shrink-0">
              <span className="text-lg">🐓</span>
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-slate-100 text-base md:text-lg tracking-tight truncate">
              {title}
            </h1>
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-gold-950/80 border border-gold-600/50 text-gold-300 px-2 py-0.5 rounded-full">
                <ShieldCheck size={11} className="text-gold-400" />
                Criadero Activo
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 truncate hidden md:block">
            {tenant?.nombre || 'Criadero Los Gavilanes'} &bull; Plan Criadero Maestro
          </p>
        </div>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-2">
        {/* Selector de Vista: Pantalla Completa vs Teléfono Móvil */}
        <button
          onClick={toggleLayoutMode}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
          title="Alternar entre vista de computadora y vista de teléfono móvil"
        >
          {layoutMode === 'responsive' ? (
            <>
              <Smartphone size={14} className="text-primary-400" />
              <span>Vista Teléfono Móvil</span>
            </>
          ) : (
            <>
              <Monitor size={14} className="text-emerald-400" />
              <span>Vista Pantalla Completa</span>
            </>
          )}
        </button>

        {rightAction}

        {showNotifications && (
          <button
            onClick={() => navigate('/salud')}
            className="p-2 rounded-xl bg-dark-surface hover:bg-dark-hover border border-dark-border text-slate-300 hover:text-white relative active:scale-95 transition-all cursor-pointer"
            title="Avisos Sanitarios y Vacunación"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-dark-bg animate-pulse" />
          </button>
        )}
      </div>
    </header>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bird, Swords, Heart, Trophy, GitBranch } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/aves',      icon: Bird,            label: 'Aves'   },
  { to: '/pedigree',  icon: GitBranch,       label: 'Linajes' },
  { to: '/peleas',    icon: Swords,          label: 'Combates' },
  { to: '/sgt',       icon: Trophy,          label: 'Puntaje SGT' },
  { to: '/salud',     icon: Heart,           label: 'Sanidad'  },
];

export const BottomNav: React.FC = () => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-40 bg-dark-card/95 backdrop-blur-2xl border-t border-dark-border/80 px-2 pt-2 pb-safe shadow-2xl"
    style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
  >
    <div className="max-w-md mx-auto flex items-center justify-around">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all duration-200 relative group',
              isActive
                ? 'text-primary-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 font-medium',
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={clsx(
                  'p-1 rounded-xl transition-all duration-200',
                  isActive ? 'bg-primary-950/80 border border-primary-500/40 shadow-glow-red text-primary-400' : 'group-hover:bg-dark-surface',
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className="text-[11px] leading-none tracking-tight">{label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full shadow-glow-red" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

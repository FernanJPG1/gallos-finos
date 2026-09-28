import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/endpoints/auth';
import { useAuthStore } from '../../store/auth.store';
import { Award, Zap, ShieldCheck, Sparkles } from 'lucide-react';

const schema = z.object({
  tenantSlug: z.string().min(3, 'Ingresa el identificador de tu criadero'),
  email:      z.string().email('Correo electrónico inválido'),
  password:   z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, loginDemo } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantSlug: 'gavilanes-pro',
      email: 'gonzalo@gavilanespro.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await authApi.login(data.email, data.password, data.tenantSlug);
      setAuth(result.user, result.tenant, result.accessToken, true);
      toast.success(`¡Bienvenido de nuevo, ${result.user.nombre}!`);
      navigate('/dashboard');
    } catch {
      loginDemo();
      toast.success('Iniciado en Modo Criadero Local');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    loginDemo();
    toast.success('¡Acceso concedido a Criadero Los Gavilanes (Plan Criadero Maestro)!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Resplandor decorativo de fondo */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md flex flex-col z-10">
        {/* Escudo de Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-950 border border-primary-500/50 items-center justify-center shadow-glow-red mb-4">
            <span className="text-3xl">🐓</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-black text-white font-display tracking-tight">GALLERO</h1>
            <span className="text-3xl font-black bg-gradient-to-r from-gold-400 to-amber-500 bg-clip-text text-transparent font-display">PRO</span>
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">
            Gestión Profesional de Criaderos de Alta Casta
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-dark-card/90 backdrop-blur-xl border border-dark-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-100 font-display">Acceso al Criadero</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ingresa tus credenciales autorizadas</p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-gold-400 bg-gold-950/60 border border-gold-600/40 px-2.5 py-1 rounded-full">
              <Sparkles size={11} />
              Sistema v2.4
            </span>
          </div>

          {/* Botón de Demostración Inmediata */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gold-950/60 via-dark-surface to-primary-950/60 border border-gold-500/40">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap size={16} className="text-gold-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Demostración Inmediata</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Accede al criadero precargado con 12 aves de alta casta, combates y genealogías reales.
                </p>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="mt-3 w-full btn-gold text-xs py-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap size={14} />
                  <span>Entrar como Don Gonzalo (Criadero Los Gavilanes)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border" />
            </div>
            <span className="relative bg-dark-card px-3 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              o con tu cuenta registrada
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Identificador del Criadero"
              placeholder="ej: gavilanes-pro"
              error={errors.tenantSlug?.message}
              {...register('tenantSlug')}
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="criador@ejemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Contraseña de Acceso"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Iniciar Sesión
            </Button>
          </form>

          {/* Planes Disponibles */}
          <div className="mt-8 pt-6 border-t border-dark-border/80">
            <p className="text-[11px] text-center text-slate-400 font-bold uppercase tracking-wider mb-3">
              Planes de Suscripción Oficial
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { plan: 'BÁSICO', desc: 'Hasta 25 aves', price: 'Gratis' },
                { plan: 'PROFESIONAL', desc: 'Hasta 200 aves', price: '$19.90/mes' },
                { plan: 'MAESTRO', desc: 'Aves ilimitadas', price: '$49.90/mes', highlight: true },
              ].map(({ plan, desc, price, highlight }) => (
                <div
                  key={plan}
                  className={`rounded-xl p-2.5 flex flex-col gap-0.5 border ${
                    highlight
                      ? 'bg-primary-950/40 border-primary-600/50'
                      : 'bg-dark-bg/60 border-dark-border/60'
                  }`}
                >
                  <span className={`text-xs font-black ${highlight ? 'text-primary-400' : 'text-slate-300'}`}>
                    {plan}
                  </span>
                  <span className="text-[11px] text-slate-400">{desc}</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5">{price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

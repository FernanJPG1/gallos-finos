import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Lazy loading de páginas
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage    = lazy(() => import('./pages/dashboard/DashboardPage'));
const AvesPage         = lazy(() => import('./pages/aves/AvesPage'));
const FichaAvePage     = lazy(() => import('./pages/aves/FichaAvePage'));
const NuevaAvePage     = lazy(() => import('./pages/aves/NuevaAvePage'));
const PeleasPage       = lazy(() => import('./pages/peleas/PeleasPage'));
const NuevaPeleaPage   = lazy(() => import('./pages/peleas/NuevaPeleaPage'));
const SaludPage        = lazy(() => import('./pages/salud/SaludPage'));
const SgtPage          = lazy(() => import('./pages/sgt/SgtPage'));
const PedigreePage     = lazy(() => import('./pages/pedigree/PedigreePage'));
const CertificadoPage  = lazy(() => import('./pages/certificados/CertificadoPage'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protegidas (dentro del AppShell con BottomNav) */}
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"        element={<DashboardPage />} />
          <Route path="/aves"             element={<AvesPage />} />
          <Route path="/aves/nueva"       element={<NuevaAvePage />} />
          <Route path="/aves/:id"         element={<FichaAvePage />} />
          <Route path="/aves/:id/pedigree" element={<PedigreePage />} />
          <Route path="/peleas"           element={<PeleasPage />} />
          <Route path="/peleas/nueva"     element={<NuevaPeleaPage />} />
          <Route path="/salud"            element={<SaludPage />} />
          <Route path="/sgt"              element={<SgtPage />} />
          <Route path="/aves/:id/cert"    element={<CertificadoPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

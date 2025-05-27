import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import Logo from './components/Logo';
import { useConfigSections } from './hooks/useConfigSections';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Information = lazy(() => import('./pages/Information'));
const Church = lazy(() => import('./pages/Church'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Location = lazy(() => import('./pages/Location'));
const Transport = lazy(() => import('./pages/Transport'));
const Photos = lazy(() => import('./pages/Photos'));
const Tables = lazy(() => import('./pages/Tables'));
const Menu = lazy(() => import('./pages/Menu'));
const ConfirmarAsistencia = lazy(() => import('./pages/ConfirmarAsistencia'));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nature-600"></div>
  </div>
);

function App() {
  const { sections, loading } = useConfigSections();

  // Helper para saber si una sección está activa
  const isActive = (slug: string) => {
    if (slug === '') return true; // Home siempre activa
    return sections[slug]?.activo;
  };

  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info" element={isActive('info') ? <Information /> : <Navigate to="/" replace />} />
            <Route path="/ceremonia" element={isActive('ceremonia') ? <Church /> : <Navigate to="/" replace />} />
            <Route path="/horarios" element={isActive('horarios') ? <Timetable /> : <Navigate to="/" replace />} />
            <Route path="/lugares" element={isActive('lugares') ? <Location /> : <Navigate to="/" replace />} />
            <Route path="/transporte" element={isActive('transporte') ? <Transport /> : <Navigate to="/" replace />} />
            <Route path="/fotos" element={isActive('fotos') ? <Photos /> : <Navigate to="/" replace />} />
            <Route path="/mesas" element={isActive('mesas') ? <Tables /> : <Navigate to="/" replace />} />
            <Route path="/menu" element={isActive('menu') ? <Menu /> : <Navigate to="/" replace />} />
            <Route path="/confirmar-asistencia" element={isActive('confirmar-asistencia') ? <ConfirmarAsistencia /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
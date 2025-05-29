import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useConfigSections } from './hooks/useConfigSections';

// Lazy load componentes específicos
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
// Componente genérico para secciones nuevas
const GenericSection = lazy(() => import('./pages/GenericSection'));

// Mapeo slug -> componente
const sectionComponentMap: Record<string, React.LazyExoticComponent<React.FC<any>>> = {
  '': Home,
  'info': Information,
  'ceremonia': Church,
  'horarios': Timetable,
  'lugares': Location,
  'transporte': Transport,
  'fotos': Photos,
  'mesas': Tables,
  'menu': Menu,
  'confirmar-asistencia': ConfirmarAsistencia,
};

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nature-600"></div>
  </div>
);

function App() {
  const { sections, loading } = useConfigSections();

  if (loading) return <Loading />;

  // Generar rutas dinámicamente según las secciones activas
  const sectionSlugs = Object.keys(sections).filter(slug => sections[slug].activo);

  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Home siempre presente */}
            <Route path="/" element={<Home />} />
            {sectionSlugs.map(slug => {
              // Home ya está en "/"
              if (slug === '') return null;
              const Component = sectionComponentMap[slug] || GenericSection;
              return (
                <Route key={slug} path={`/${slug}`} element={<Component />} />
              );
            })}
            {/* Fallback: redirige a Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
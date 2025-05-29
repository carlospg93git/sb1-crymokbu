import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useConfigSections } from './hooks/useConfigSections';
import { Info, Church as ChurchIcon, Clock, MapPin, Bus, Camera, Users, Utensils } from 'lucide-react';

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

// Mapeo slug -> componente e icono
export const sectionComponentMap: Record<string, { component: React.LazyExoticComponent<React.FC<any>>, icon?: any }> = {
  '': { component: Home, icon: undefined },
  'info': { component: Information, icon: Info },
  'ceremonia': { component: Church, icon: ChurchIcon },
  'horarios': { component: Timetable, icon: Clock },
  'lugares': { component: Location, icon: MapPin },
  'transporte': { component: Transport, icon: Bus },
  'fotos': { component: Photos, icon: Camera },
  'mesas': { component: Tables, icon: Users },
  'menu': { component: Menu, icon: Utensils },
  'confirmar-asistencia': { component: ConfirmarAsistencia, icon: Users },
};

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nature-600"></div>
  </div>
);

function App() {
  const { sections, orderedSections, loading } = useConfigSections();

  if (loading) return <Loading />;

  // Generar rutas dinámicamente según las secciones activas y en orden
  const activeSections = orderedSections.filter(sec => sec.activo);

  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Home siempre presente */}
            <Route path="/" element={<Home />} />
            {activeSections.map(sec => {
              // Home ya está en "/"
              if (sec.url_interna === '') return null;
              const Component = sectionComponentMap[sec.url_interna]?.component || GenericSection;
              return (
                <Route key={sec.url_interna} path={`/${sec.url_interna}`} element={<Component />} />
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
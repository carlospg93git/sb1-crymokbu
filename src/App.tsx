import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useConfigSections } from './hooks/useConfigSections';
import { Info, Church as ChurchIcon, Clock, MapPin, Bus, Camera, Users, Utensils } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

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
const Protocolo = lazy(() => import('./pages/Protocolo'));
const Gallery = lazy(() => import('./pages/Gallery'));
// Componente genérico para secciones nuevas
const GenericSection = lazy(() => import('./pages/GenericSection'));

export function getLucideIconByName(name: string | undefined): any {
  if (!name) return LucideIcons.Menu;
  // Convierte 'map-pin' a 'MapPin', 'user-circle' a 'UserCircle', etc.
  const iconName = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return (LucideIcons as any)[iconName] || LucideIcons.Menu;
}

// Mapeo slug -> componente e icono
export const sectionComponentMap: Record<string, { component: React.LazyExoticComponent<React.FC<any>> }> = {
  '': { component: Home },
  'info': { component: Information },
  'ceremonia': { component: Church },
  'horarios': { component: Timetable },
  'lugares': { component: Location },
  'transporte': { component: Transport },
  'fotos': { component: Photos },
  'galeria': { component: Gallery },
  'mesas': { component: Tables },
  'menu': { component: Menu },
  'confirmar-asistencia': { component: ConfirmarAsistencia },
  'protocolo': { component: Protocolo },
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
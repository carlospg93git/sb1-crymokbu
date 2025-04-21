import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import Logo from './components/Logo';

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

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nature-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info" element={<Information />} />
            <Route path="/ceremonia" element={<Church />} />
            <Route path="/horarios" element={<Timetable />} />
            <Route path="/lugares" element={<Location />} />
            <Route path="/transporte" element={<Transport />} />
            <Route path="/fotos" element={<Photos />} />
            <Route path="/mesas" element={<Tables />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm py-4 text-center text-sm text-gray-600 z-40">
        Made with ❤️ by <a href="https://orsoie.com" target="_blank" rel="noopener noreferrer" className="text-[#D46E35] text-2xl font-orsoie hover:underline">orsoie</a>
      </footer>
      <Navigation />
    </Router>
  );
}

export default App;
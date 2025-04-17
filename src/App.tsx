import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Logo from './components/Logo';
import Home from './pages/Home';
import Information from './pages/Information';
import Church from './pages/Church';
import Timetable from './pages/Timetable';
import Location from './pages/Location';
import Transport from './pages/Transport';
import Photos from './pages/Photos';
import Tables from './pages/Tables';
import Menu from './pages/Menu';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-nature-50 font-body flex flex-col">
        <Logo />
        <div className="flex-1 pt-16 pb-16"> {/* Added padding bottom for footer */}
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
            {/* Catch all route for 404s */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm py-4 text-center text-sm text-gray-600 z-40">
          Made with ❤️ by <a href="https://orsoie.com" target="_blank" rel="noopener noreferrer" className="text-[#D46E35] text-2xl font-orsoie hover:underline">orsoie</a>
        </footer>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
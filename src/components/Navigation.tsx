import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Info, Church, Clock, MapPin, Camera, Users, Utensils, Bus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/info', icon: Info, label: 'Información' },
    { path: '/ceremonia', icon: Church, label: 'Ceremonia' },
    { path: '/horarios', icon: Clock, label: 'Horarios' },
    { path: '/lugares', icon: MapPin, label: 'Lugares' },
    { path: '/transporte', icon: Bus, label: 'Transporte' },
    { path: '/fotos', icon: Camera, label: 'Fotos' },
    { path: '/mesas', icon: Users, label: 'Seating plan' },
    { path: '/menu', icon: Utensils, label: 'Menú' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md"
      >
        <Menu className="text-nature-600 w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl"
            >
              <div className="p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4"
                >
                  <X className="text-nature-600 w-6 h-6" />
                </button>
                <div className="mt-12 space-y-4">
                  {navItems.map(({ path, icon: Icon, label }) => (
                    <button
                      key={path}
                      onClick={() => handleNavigation(path)}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        location.pathname === path
                          ? 'bg-nature-100 text-nature-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
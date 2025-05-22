import React, { useState, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '../config/navigation';
import { useConfigSections } from '../hooks/useConfigSections';

const NavButton = memo(({ path, icon: Icon, label, isActive, onClick }: {
  path: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
      isActive ? 'bg-nature-100 text-nature-600' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon size={20} className="mr-3" />
    <span className="font-medium">{label}</span>
  </button>
));

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { sections, loading } = useConfigSections();

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    setIsOpen(false);
  }, [navigate]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Filtrar navItems: Home siempre visible, el resto según config
  const filteredNavItems = navItems.filter(({ path }) => {
    if (path === '/') return true;
    const slug = path.replace(/^\//, '');
    return sections[slug]?.activo;
  });

  return (
    <>
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md"
        aria-label="Abrir menú"
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
                  aria-label="Cerrar menú"
                >
                  <X className="text-nature-600 w-6 h-6" />
                </button>
                <div className="mt-12 space-y-4">
                  {loading ? (
                    <span className="text-nature-600">Cargando menú...</span>
                  ) : (
                    filteredNavItems.map(({ path, icon, label }) => (
                      <NavButton
                        key={path}
                        path={path}
                        icon={icon}
                        label={label}
                        isActive={location.pathname === path}
                        onClick={() => handleNavigation(path)}
                      />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(Navigation);
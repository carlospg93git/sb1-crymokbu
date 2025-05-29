import React, { useState, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfigSections } from '../hooks/useConfigSections';
import { useBranding } from '../hooks/useBranding';
import { sectionComponentMap, getLucideIconByName } from '../App'; // Importa el mapeo de iconos si lo tienes ahí, si no, define un fallback

const iconFallback = Menu; // Icono por defecto si no hay icono definido

const NavButton = memo(({ path, icon: Icon, label, isActive, onClick, colorMenu, colorPrincipal }: {
  path: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
  colorMenu: string;
  colorPrincipal: string;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 rounded-lg transition-colors`}
    style={isActive ? { backgroundColor: colorMenu, color: colorPrincipal } : {}}
  >
    <Icon size={20} className="mr-3" style={isActive ? { color: colorPrincipal } : {}} />
    <span className="font-medium">{label}</span>
  </button>
));

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { orderedSections, loading } = useConfigSections();
  const { branding } = useBranding();
  const colorMenu = branding?.color_menu || '#b5d6b5';
  const colorPrincipal = branding?.color_principal || '#457945';

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    setIsOpen(false);
  }, [navigate]);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Home siempre visible
  const navSections = [
    { path: '/', label: 'Inicio', icon: getLucideIconByName('home'), isHome: true },
    ...orderedSections.filter(sec => sec.activo && sec.url_interna !== '').map(sec => ({
      path: `/${sec.url_interna}`,
      label: sec.nombre_seccion,
      icon: getLucideIconByName(sec.icon),
      isHome: false
    }))
  ];

  return (
    <>
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6" style={{ color: colorPrincipal }} />
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
                  <X className="w-6 h-6" style={{ color: colorPrincipal }} />
                </button>
                <div className="mt-12 space-y-4">
                  {loading ? (
                    <span style={{ color: colorPrincipal }}>Cargando menú...</span>
                  ) : (
                    navSections.map(({ path, icon, label, isHome }) => (
                      <NavButton
                        key={path}
                        path={path}
                        icon={icon}
                        label={label}
                        isActive={location.pathname === path}
                        onClick={() => handleNavigation(path)}
                        colorMenu={colorMenu}
                        colorPrincipal={colorPrincipal}
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
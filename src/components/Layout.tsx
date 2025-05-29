import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import Navigation from './Navigation';
import { useHomeContent } from '../hooks/useHomeContent';
import { useBranding } from '../hooks/useBranding';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data } = useHomeContent();
  const { branding } = useBranding();

  useEffect(() => {
    if (!branding) return;
    // Aplicar color de fondo
    if (branding.fondo_imagen?.url) {
      document.body.style.backgroundImage = `url(${branding.fondo_imagen.url})`;
      document.body.style.backgroundColor = '';
      document.body.style.backgroundSize = 'auto';
      document.body.style.backgroundRepeat = 'repeat-y';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = branding.fondo_color;
    }
    // Aplicar fuentes y tamaños
    if (branding.fuente_principal) {
      document.body.style.fontFamily = `'${branding.fuente_principal}', serif`;
    }
    if (branding.font_size_principal) {
      document.body.style.fontSize = branding.font_size_principal;
    }
    if (branding.fuente_secundaria) {
      const style = document.createElement('style');
      style.innerHTML = `h1, h2, h3, h4, h5, h6 { font-family: '${branding.fuente_secundaria}', serif;${branding.font_size_secundaria ? ` font-size: ${branding.font_size_secundaria};` : ''} }`;
      document.head.appendChild(style);
    }
    // Cargar Google Fonts dinámicamente
    const fonts = [branding.fuente_principal, branding.fuente_secundaria].filter((f): f is string => !!f);
    fonts.forEach(font => {
      if (font) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css?family=${font.replace(/ /g, '+')}:400,700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    });
    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = '';
      document.body.style.fontSize = '';
    };
  }, [branding]);

  return (
    <div className="min-h-screen flex flex-col">
      <Logo nombre_uno={data?.nombre_uno} nombre_dos={data?.nombre_dos} />
      <motion.div 
        className="flex-1 pt-16 pb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm py-4 text-center text-sm text-gray-600 z-40">
        Made with ❤️ by <a href="https://orsoie.com" target="_blank" rel="noopener noreferrer" className="text-[#D46E35] text-2xl font-orsoie hover:underline">orsoie</a>
      </footer>
      <Navigation />
    </div>
  );
};

export default Layout; 
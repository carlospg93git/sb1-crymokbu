import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import Navigation from './Navigation';
import { useHomeContent } from '../hooks/useHomeContent';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data } = useHomeContent();
  return (
    <div className="min-h-screen bg-nature-50 font-body flex flex-col">
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
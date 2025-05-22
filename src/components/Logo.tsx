import React from 'react';

interface LogoProps {
  nombre_uno?: string;
  nombre_dos?: string;
}

const Logo: React.FC<LogoProps> = ({ nombre_uno = '', nombre_dos = '' }) => {
  const inicial1 = nombre_uno.trim().charAt(0).toUpperCase();
  const inicial2 = nombre_dos.trim().charAt(0).toUpperCase();
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center items-center h-16 bg-white/80 backdrop-blur-sm z-40 px-16">
      <div className="w-12 h-12 rounded-full bg-nature-600 text-white flex items-center justify-center font-logo text-xl select-none">
        {inicial1}&{inicial2}
      </div>
    </div>
  );
};

export default Logo;
import React from 'react';

const Logo = () => {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-center items-center h-16 bg-white/80 backdrop-blur-sm z-40 px-16">
      <div className="w-12 h-12 rounded-full bg-nature-600 text-white flex items-center justify-center font-logo text-xl">
        M&C
      </div>
    </div>
  );
};

export default Logo;
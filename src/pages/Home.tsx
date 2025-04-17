import React from 'react';

const Home = () => {
  return (
    <div className="h-screen flex flex-col items-center p-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-6">
          <img
            src="https://ik.imagekit.io/orsoie/2024-06-01_18-56-02_630%20(1)%20(1).png?updatedAt=1744641972368?auto=format&fit=crop&q=80"
            alt="M&C"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl font-logo mb-2">María & Carlos</h1>
            <p className="text-lg">12 de julio de 2025</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xl text-gray-700">Bienvenidos a la aplicación de nuestra boda.</p>
          <p className="text-gray-600 mt-2">
            Usa el menú arriba a la izquierda para navegar entre las diferentes secciones. Esperamos que paséis un día estupendo y te agradecemos tu presencia en este día tan especial para nosotros.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
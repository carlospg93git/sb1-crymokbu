import React from 'react';
import { Info } from 'lucide-react';

const Information = () => {
  return (
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <Info className="text-nature-600 w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Información general</h1>
      </div>
      
      <div className="space-y-6">
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Sobre esta App</h2>
          <p className="text-gray-600">
            En esta web tendrás toda la información necesaria para disfrutar un día maravilloso junto con nosotros.
            Consulta las secciones en el menú superior de la izquierda y descubre todo lo que tenemos por delante este día.<br></br>
            No te olvides de subir todas tus fotos y vídeos en la sección <a href="https://carlosymaria.es/fotos" target="_blank" rel="noopener noreferrer" className="text-nature-600 hover:underline">Fotos</a>, para poder crear un álbum lleno de recuerdos.
          </p>
        </section>

        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Regalo</h2>
          <p className="text-gray-600">
            Tu presencia en este día es el mejor regalo. Pero si quieres aportar a nuestra aventura te dejamos
            los datos para realizar tu aportación: ES54 1465 0100 9717 3952 8573
          </p>
        </section>
      </div>
    </div>
  );
};

export default Information;
import React from 'react';
import { useHomeContent, formateaFecha } from '../hooks/useHomeContent';

const Home = () => {
  const { data, loading, error } = useHomeContent();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nature-600 mb-4"></div>
        <span className="text-nature-600">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-red-600">{error}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      {data.imagen && (
        <img
          src={data.imagen}
          alt="Imagen principal"
          className="w-48 h-48 object-cover rounded-full shadow-lg mb-6 border-4 border-nature-200"
        />
      )}
      <h1 className="text-4xl font-display font-bold text-nature-700 mb-2">
        {data.nombre_uno} & <span className="text-orsoie">{data.nombre_dos}</span>
      </h1>
      <p className="text-xl text-nature-600 font-semibold mb-4">{formateaFecha(data.fecha)}</p>
    </div>
  );
};

export default Home;
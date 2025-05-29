import React from 'react';
import { useHomeContent, formateaFecha } from '../hooks/useHomeContent';
import { useBranding } from '../hooks/useBranding';

const Home = () => {
  const { data, loading, error } = useHomeContent();
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{ borderColor: colorPrincipal }}></div>
        <span style={{ color: colorPrincipal }}>Cargando...</span>
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
    <div className="flex flex-col items-center p-4 pb-24 min-h-screen">
      <div className="w-full max-w-md">
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden mb-6">
          <img
            src={data.imagen}
            alt={`${data.nombre_uno} & ${data.nombre_dos}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl font-logo mb-2">{data.nombre_uno} & {data.nombre_dos}</h1>
            <p className="text-lg">{formateaFecha(data.fecha)}</p>
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
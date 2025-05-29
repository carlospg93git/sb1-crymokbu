import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useLugarContent } from '../hooks/useLugarContent';
import { asText, asHTML, asImageSrc } from '@prismicio/helpers';
import { useBranding } from '../hooks/useBranding';

const Location = () => {
  const { data, loading, error } = useLugarContent();
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
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <MapPin style={{ color: colorPrincipal }} className="w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Lugares</h1>
      </div>
      <div className="space-y-6">
        {data.bloques.map((lugar, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow overflow-hidden">
            {lugar.imagen && (
              <img
                src={asImageSrc(lugar.imagen) ?? undefined}
                alt={asText(lugar.titulo) ?? undefined}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{asText(lugar.titulo)}</h2>
                  <p className="text-gray-600 text-sm">{asText(lugar.subtitulo)}</p>
                </div>
                {lugar.mapa && lugar.mapa.url && (
                  <a
                    href={lugar.mapa.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.8)' }}
                  >
                    <Navigation size={20} style={{ color: colorPrincipal }} />
                  </a>
                )}
              </div>
              <div className="text-gray-700 mt-2" dangerouslySetInnerHTML={{ __html: (asHTML(lugar.texto) || '').split('<img').join('<img class=\"my-4 rounded-lg\"') }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Location;
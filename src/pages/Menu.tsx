import React from 'react';
import { Utensils } from 'lucide-react';
import { useMenuContent } from '../hooks/useMenuContent';
import { asText, asHTML } from '@prismicio/helpers';
import { useBranding } from '../hooks/useBranding';

const Menu = () => {
  const { data, loading, error } = useMenuContent();
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
        <Utensils style={{ color: colorPrincipal }} className="w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Menú</h1>
      </div>
      <div className="space-y-6">
        {data.bloques.map((bloque: { titulo: any; texto: any }, idx: number) => (
          <section key={idx} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">{asText(bloque.titulo)}</h2>
            <div
              className="text-gray-600"
              dangerouslySetInnerHTML={{ __html: (asHTML(bloque.texto) || '').split('<img').join('<img class=\"my-4 rounded-lg\"') }}
            />
          </section>
        ))}
      </div>
    </div>
  );
};

export default Menu;
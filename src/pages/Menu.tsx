import React from 'react';
import { Utensils } from 'lucide-react';
import { useMenuContent } from '../hooks/useMenuContent';
import { asText, asHTML } from '@prismicio/helpers';
import { useBranding } from '../hooks/useBranding';
import { useLocation } from 'react-router-dom';
import { useConfigSections } from '../hooks/useConfigSections';
import { getLucideIconByName } from '../App';

const Menu = () => {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '') || 'menu';
  const { orderedSections } = useConfigSections();
  const section = (orderedSections.find(sec => sec.url_interna === slug) as any) || {};
  const sectionTitle = section.nombre_seccion || 'Menú';
  const iconName = section.icon || 'utensils';
  const Icon = getLucideIconByName(slug === '' ? 'house' : iconName);
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
        <Icon style={{ color: colorPrincipal }} className="w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">{sectionTitle}</h1>
      </div>
      <div className="space-y-6">
        {data.bloques.map((bloque: { titulo: any; texto: any }, idx: number) => (
          <section key={idx} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">{asText(bloque.titulo)}</h2>
            {Array.isArray(bloque.texto) && bloque.texto.every((t: any) => t.type === 'paragraph') ? (
              <ul className="list-disc pl-8 text-gray-800 space-y-1" style={{fontSize: '1.15rem', color: '#222'}}>
                {bloque.texto.map((t: any, i: number) => (
                  <li key={i} className="leading-relaxed" style={{marginLeft: '0.5em', paddingLeft: '0.25em'}}>{t.text}</li>
                ))}
              </ul>
            ) : (
              <div
                className="text-gray-600"
                dangerouslySetInnerHTML={{ __html: (asHTML(bloque.texto) || '').split('<img').join('<img class=\"my-4 rounded-lg\"') }}
              />
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Menu;
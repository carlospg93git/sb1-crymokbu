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
        {data.bloques.map((bloque: { titulo: any; texto: any }, idx: number) => {
          console.log('bloque.texto', bloque.texto);
          // Nuevo renderizado flexible para mezclar párrafos y listas
          const items = Array.isArray(bloque.texto) ? bloque.texto : [];
          const rendered = [];
          let i = 0;
          let headingCount = 0;
          while (i < items.length) {
            if (items[i].type && items[i].type.startsWith('heading')) {
              const level = items[i].type.replace('heading', '');
              const HeadingTag = `h${level}`;
              headingCount++;
              rendered.push(
                React.createElement(
                  HeadingTag,
                  headingCount === 1
                    ? { key: `h-${i}`, className: 'font-bold mb-1 text-lg', style: { fontFamily: 'Playfair Display, serif' } }
                    : { key: `h-${i}`, className: '!font-normal !text-base !text-gray-700 mb-1', style: { fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '1rem', color: '#374151' } },
                  items[i].text
                )
              );
              i++;
            } else if (items[i].type === 'paragraph') {
              rendered.push(
                <div key={`p-${i}`} className="text-gray-700 mb-1" style={{fontSize: '1.1rem'}}>{items[i].text}</div>
              );
              i++;
            } else if (items[i].type === 'list-item') {
              // Agrupa todos los list-item seguidos en un <ul>
              const liGroup = [];
              while (i < items.length && items[i].type === 'list-item') {
                liGroup.push(
                  <li key={`li-${i}`} className="leading-relaxed" style={{marginLeft: '0.5em', paddingLeft: '0.25em'}}>{items[i].text}</li>
                );
                i++;
              }
              rendered.push(
                <ul key={`ul-${i}`} className="list-disc pl-8 text-gray-800 space-y-1" style={{fontSize: '1.15rem', color: '#222'}}>
                  {liGroup}
                </ul>
              );
            } else {
              i++;
            }
          }
          return (
            <section key={idx} className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">{asText(bloque.titulo)}</h2>
              {rendered.length > 0 ? rendered : (
                <div
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{ __html: (asHTML(bloque.texto) || '').split('<img').join('<img class=\"my-4 rounded-lg\"') }}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
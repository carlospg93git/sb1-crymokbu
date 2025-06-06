import React from 'react';
import { Clock } from 'lucide-react';
import { useHorarioContent } from '../hooks/useHorarioContent';
import { asText, asHTML } from '@prismicio/helpers';
import { useBranding } from '../hooks/useBranding';
import { useLocation } from 'react-router-dom';
import { useConfigSections } from '../hooks/useConfigSections';
import { getLucideIconByName } from '../App';

function formateaHora(fechaISO: string): string {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  // Devuelve en formato HH:mm
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const Timetable = () => {
  const { data, loading, error } = useHorarioContent();
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '') || 'horarios';
  const { orderedSections } = useConfigSections();
  const section = (orderedSections.find(sec => sec.url_interna === slug) as any) || {};
  const sectionTitle = section.nombre_seccion || 'Horarios';
  const iconName = section.icon || 'clock';
  const Icon = getLucideIconByName(slug === '' ? 'house' : iconName);

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
      <div className="space-y-4">
        {data.bloques.map((bloque, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow flex items-start">
            <div className="w-20 flex-shrink-0">
              <p className="font-semibold" style={{ color: colorPrincipal }}>{formateaHora(bloque.fecha_hora)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{asText(bloque.titulo)}</h3>
              <div className="text-gray-600 text-sm" dangerouslySetInnerHTML={{ __html: (asHTML(bloque.texto) || '').split('<img').join('<img class=\"my-4 rounded-lg\"') }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timetable;
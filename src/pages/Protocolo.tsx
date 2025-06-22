import React from 'react';
import { useLocation } from 'react-router-dom';
import { useConfigSections } from '../hooks/useConfigSections';
import { asText, asHTML } from '@prismicio/helpers';
import { useBranding } from '../hooks/useBranding';
import { getLucideIconByName } from '../App';

// Hook genérico para obtener contenido de una sección estándar por slug
function useProtocoloSectionContent(slug: string) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) {
      setLoading(true);
      setError(null);
      return;
    }
    let finished = false;
    // Timeout de seguridad
    const timeout = setTimeout(() => {
      if (!finished) {
        setLoading(false);
        setError('Timeout: la petición a Prismic tarda demasiado.');
        console.error('[ProtocoloSection] Timeout: la petición a Prismic tarda demasiado.');
      }
    }, 10000);
    console.log('[ProtocoloSection] Importando prismicClient...');
    import('../config/prismic').then(({ prismicClient }) => {
      console.log('[ProtocoloSection] prismicClient importado. Llamando a getByUID con slug:', slug);
      prismicClient.getByUID('pagina-estandar', slug)
        .then(doc => {
          finished = true;
          clearTimeout(timeout);
          console.log('[ProtocoloSection] Respuesta de Prismic para slug', slug, ':', doc);
          setData(doc.data);
        })
        .catch((err) => {
          finished = true;
          clearTimeout(timeout);
          console.error('[ProtocoloSection] Error al obtener contenido de Prismic para slug', slug, ':', err);
          setError('No se pudo cargar el contenido.');
        })
        .finally(() => {
          finished = true;
          clearTimeout(timeout);
          setLoading(false);
          console.log('[ProtocoloSection] finally ejecutado para slug', slug);
        });
    }).catch((err) => {
      finished = true;
      clearTimeout(timeout);
      setLoading(false);
      setError('Error importando prismicClient');
      console.error('[ProtocoloSection] Error importando prismicClient:', err);
    });
  }, [slug]);

  return { data, loading, error };
}

const Protocolo: React.FC = () => {
  // El slug será 'protocolo' fijo para esta sección
  const slug = 'protocolo';
  const { sections } = useConfigSections();
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';
  const { data, loading, error } = useProtocoloSectionContent(slug);
  const section = sections[slug] || {};
  // Cargar el icono dinámicamente desde la configuración de la sección
  const iconName = section.icon || 'shirt'; // 'shirt' como fallback
  const Icon = getLucideIconByName(iconName);
  const sectionTitle = section.nombre_seccion || 'Protocolo';

  React.useEffect(() => {
    if (data) {
      console.log('[ProtocoloSection] Datos recibidos para slug', slug, ':', data);
    }
  }, [data, slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{ borderColor: colorPrincipal }}></div>
        <span style={{ color: colorPrincipal }}>Cargando...</span>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-600 mt-8">{error}</div>;
  }
  if (!data) return (
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <Icon style={{ color: colorPrincipal }} className="w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">{sectionTitle}</h1>
      </div>
      <pre className="bg-gray-100 text-xs p-2 rounded overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );

  return (
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <Icon style={{ color: colorPrincipal }} className="w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">{sectionTitle}</h1>
      </div>
      <div className="space-y-6">
        {(data.body?.[0]?.items || []).map((item: any, idx: number) => (
          <section key={idx} className="bg-white p-4 rounded-lg shadow">
            {item.titulo && (
              <h2 className="text-xl font-semibold mb-3">{asText(item.titulo)}</h2>
            )}
            {item.texto && (
              <div
                className="prose text-gray-600 max-w-none [&_p]:leading-normal"
                dangerouslySetInnerHTML={{ __html: asHTML(item.texto) || '' }}
              />
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Protocolo; 
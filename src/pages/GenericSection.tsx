import React from 'react';
import { useParams } from 'react-router-dom';
import { useConfigSections } from '../hooks/useConfigSections';
import { asText, asHTML } from '@prismicio/helpers';
import { useBranding } from '../hooks/useBranding';

// Hook genérico para obtener contenido de una sección estándar por slug
function useGenericSectionContent(slug: string) {
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
        console.error('[GenericSection] Timeout: la petición a Prismic tarda demasiado.');
      }
    }, 10000);
    console.log('[GenericSection] Importando prismicClient...');
    import('../config/prismic').then(({ prismicClient }) => {
      console.log('[GenericSection] prismicClient importado. Llamando a getByUID con slug:', slug);
      prismicClient.getByUID('pagina-estandar', slug)
        .then(doc => {
          finished = true;
          clearTimeout(timeout);
          console.log('[GenericSection] Respuesta de Prismic para slug', slug, ':', doc);
          setData(doc.data);
        })
        .catch((err) => {
          finished = true;
          clearTimeout(timeout);
          console.error('[GenericSection] Error al obtener contenido de Prismic para slug', slug, ':', err);
          setError('No se pudo cargar el contenido.');
        })
        .finally(() => {
          finished = true;
          clearTimeout(timeout);
          setLoading(false);
          console.log('[GenericSection] finally ejecutado para slug', slug);
        });
    }).catch((err) => {
      finished = true;
      clearTimeout(timeout);
      setLoading(false);
      setError('Error importando prismicClient');
      console.error('[GenericSection] Error importando prismicClient:', err);
    });
  }, [slug]);

  return { data, loading, error };
}

const GenericSection: React.FC = () => {
  // Captura el slug exacto de la URL
  const params = useParams();
  // Busca el primer valor no vacío de params (para soportar rutas dinámicas)
  const slug = Object.values(params).find(Boolean) || '';
  console.log('[GenericSection] Slug capturado de la URL:', slug);
  const { sections } = useConfigSections();
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';
  const { data, loading, error } = useGenericSectionContent(slug);

  React.useEffect(() => {
    if (data) {
      console.log('[GenericSection] Datos recibidos para slug', slug, ':', data);
    }
  }, [data, slug]);

  // Si el slug aún no está disponible, muestra loading
  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{ borderColor: colorPrincipal }}></div>
        <span style={{ color: colorPrincipal }}>Cargando slug...</span>
      </div>
    );
  }

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
  if (!data) return null;

  return (
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-bold ml-2">{sections[slug || '']?.nombre_seccion || 'Sección'}</h1>
      </div>
      <div className="space-y-6">
        {(data.body || []).map((bloque: any, idx: number) => (
          <section key={idx} className="bg-white p-4 rounded-lg shadow">
            {bloque.primary?.titulo && (
              <h2 className="text-xl font-semibold mb-3">{asText(bloque.primary.titulo)}</h2>
            )}
            {bloque.primary?.texto && (
              <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: asHTML(bloque.primary.texto) || '' }} />
            )}
            {/* Puedes añadir más campos según la estructura de Prismic */}
          </section>
        ))}
      </div>
    </div>
  );
};

export default GenericSection; 
import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';

export interface ConfigSection {
  nombre_seccion: string;
  url_interna: string;
  activo: boolean;
}

export interface ConfigData {
  wedding_code: string;
  sections: Record<string, ConfigSection>;
  loading: boolean;
  error: string | null;
}

export function useConfigSections(): ConfigData {
  const [sections, setSections] = useState<Record<string, ConfigSection>>({});
  const [weddingCode, setWeddingCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getSingle('config');
        console.log('[CONFIG] Documento completo de Prismic:', doc);
        setWeddingCode(doc.data.wedding_code || '');
        // Slices bajo 'seccion'
        const secciones = (doc.data.seccion || []).map((slice: any) => {
          console.log('[CONFIG] Slice individual:', slice);
          return {
            nombre_seccion: slice.primary?.nombre_seccion || '',
            url_interna: slice.primary?.url_interna || '',
            activo: slice.primary?.activo ?? false,
          };
        });
        console.log('[CONFIG] Array de secciones parseadas:', secciones);
        // Construir un diccionario para lookup rápido por slug
        const sectionMap: Record<string, ConfigSection> = {};
        secciones.forEach((sec: ConfigSection) => {
          if (sec.url_interna) {
            sectionMap[sec.url_interna.replace(/^\//, '')] = sec;
          }
        });
        console.log('[CONFIG] Diccionario final de secciones:', sectionMap);
        setSections(sectionMap);
      } catch (err: any) {
        setError('No se pudo cargar la configuración global.');
        console.error('[CONFIG] Error al cargar config:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return { wedding_code: weddingCode, sections, loading, error };
} 
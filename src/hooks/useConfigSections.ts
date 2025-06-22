import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';

export interface ConfigSection {
  nombre_seccion: string;
  url_interna: string;
  activo: boolean;
  icon?: string;
}

export interface ConfigData {
  event_code: string;
  sections: Record<string, ConfigSection>; // Para lookup rápido
  orderedSections: ConfigSection[];        // Para orden y menú
  loading: boolean;
  error: string | null;
}

export function useConfigSections(): ConfigData {
  const [sections, setSections] = useState<Record<string, ConfigSection>>({});
  const [orderedSections, setOrderedSections] = useState<ConfigSection[]>([]);
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getSingle('config');
        setEventCode(doc.data.event_code || '');
        // Buscar todos los slices de tipo 'seccion' y extraer sus items
        const secciones: ConfigSection[] = [];
        const body = doc.data.body || [];
        body.forEach((slice: any) => {
          if (slice.slice_type === 'seccion' && Array.isArray(slice.items)) {
            slice.items.forEach((item: any) => {
              secciones.push({
                nombre_seccion: item.nombre_seccion || '',
                url_interna: (item.url_interna || '').replace(/^\/+/, ''),
                activo: item.activo ?? false,
                icon: item.icon || undefined,
              });
            });
          }
        });
        // Diccionario para lookup rápido por slug
        const sectionMap: Record<string, ConfigSection> = {};
        secciones.forEach((sec: ConfigSection) => {
          if (sec.url_interna) {
            sectionMap[sec.url_interna] = sec;
          }
        });
        setSections(sectionMap);
        setOrderedSections(secciones);
      } catch (err: any) {
        setError('No se pudo cargar la configuración global.');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return { event_code: eventCode, sections, orderedSections, loading, error };
}

// Ejemplo de sección para Prismic:
// {
//   nombre_seccion: 'Protocolo',
//   url_interna: 'protocolo',
//   activo: true,
//   icon: 'shirt' // Usa el nombre del icono de lucide-react
// } 
import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';
import { asText, asHTML } from '@prismicio/helpers';

interface CeremonyBlock {
  titulo: any;
  texto: any;
}

interface CeremonyContent {
  url: string;
  bloques: CeremonyBlock[];
}

function safeText(field: any): string {
  if (Array.isArray(field) && field.length && typeof field[0] === 'object' && 'text' in field[0]) {
    return asText(field as any) || '';
  }
  if (typeof field === 'string') return field;
  if (typeof field === 'number') return String(field);
  if (Array.isArray(field) && field.length === 1 && (typeof field[0] === 'string' || typeof field[0] === 'number')) {
    return String(field[0]);
  }
  return '';
}

export function useCeremonyContent() {
  const [data, setData] = useState<CeremonyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCeremony() {
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getByUID('pagina-estandar', 'ceremonia');
        setData({
          url: doc.data.url,
          bloques: (doc.data.body || []).flatMap((bloque: any) => {
            return (bloque.items || []).map((item: any) => ({
              titulo: item.titulo,
              texto: item.texto,
            }));
          }),
        });
      } catch (err) {
        setError('No se pudo cargar el contenido de Ceremonia.');
      } finally {
        setLoading(false);
      }
    }
    fetchCeremony();
  }, []);

  return { data, loading, error };
} 
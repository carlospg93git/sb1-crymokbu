import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';
import { asText, asHTML } from '@prismicio/helpers';

interface HorarioBlock {
  fecha_hora: any;
  titulo: any;
  texto: any;
}

interface HorarioContent {
  url: string;
  bloques: HorarioBlock[];
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

export function useHorarioContent() {
  const [data, setData] = useState<HorarioContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHorario() {
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getByUID('pagina-estandar', 'horarios');
        setData({
          url: doc.data.url,
          bloques: (doc.data.body || []).flatMap((bloque: any) => {
            if (bloque.slice_type !== 'horario') return [];
            return (bloque.items || []).map((item: any) => ({
              fecha_hora: item.fecha_hora,
              titulo: item.titulo,
              texto: item.texto,
            }));
          }),
        });
      } catch (err) {
        setError('No se pudo cargar el contenido de Horarios.');
      } finally {
        setLoading(false);
      }
    }
    fetchHorario();
  }, []);

  return { data, loading, error };
} 
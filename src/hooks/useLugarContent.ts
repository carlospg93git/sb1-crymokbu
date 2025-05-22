import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';
import { asText, asHTML, asImageSrc } from '@prismicio/helpers';

interface LugarBlock {
  titulo: any;
  subtitulo: any;
  texto: any;
  mapa: any;
  imagen: any;
}

interface LugarContent {
  url: string;
  bloques: LugarBlock[];
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

export function useLugarContent() {
  const [data, setData] = useState<LugarContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLugar() {
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getByUID('pagina-estandar', 'lugares');
        setData({
          url: doc.data.url,
          bloques: (doc.data.body || []).flatMap((bloque: any) => {
            if (bloque.slice_type !== 'lugar') return [];
            return (bloque.items || []).map((item: any) => ({
              titulo: item.titulo,
              subtitulo: item.subtitulo,
              texto: item.texto,
              mapa: item.mapa,
              imagen: item.imagen,
            }));
          }),
        });
      } catch (err) {
        setError('No se pudo cargar el contenido de Lugares.');
      } finally {
        setLoading(false);
      }
    }
    fetchLugar();
  }, []);

  return { data, loading, error };
} 
import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';
import { asText, asHTML } from '@prismicio/helpers';

interface InfoBlock {
  titulo: any;
  texto: any;
}

interface InfoContent {
  url: string;
  bloques: InfoBlock[];
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

export function useInfoContent() {
  const [data, setData] = useState<InfoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      console.log('[Prismic][Info] Ejecutando fetchInfo para pagina-estandar');
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getSingle('pagina-estandar');
        console.log('[Prismic][Info] Documento recibido:', doc);
        console.log('[Prismic][Info] doc.data:', doc.data);
        console.log('[Prismic][Info] doc.data.bloque:', doc.data.bloque);
        const bloquesMap = (doc.data.bloque || []).map((bloque: any, idx: number) => {
          console.log(`[Prismic][Info] bloque[${idx}]:`, bloque);
          return {
            titulo: bloque.titulo,
            texto: bloque.texto,
          };
        });
        console.log('[Prismic][Info] bloques mapeados:', bloquesMap);
        setData({
          url: doc.data.url,
          bloques: bloquesMap,
        });
      } catch (err) {
        setError('No se pudo cargar el contenido de Información.');
      } finally {
        setLoading(false);
      }
    }
    fetchInfo();
  }, []);

  return { data, loading, error };
} 
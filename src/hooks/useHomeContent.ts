import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';
import { asText, asImageSrc } from '@prismicio/helpers';

interface HomeContent {
  imagen: string;
  nombre_uno: string;
  nombre_dos: string;
  fecha: string;
}

export function formateaFecha(fechaISO: string): string {
  if (!fechaISO) return '';
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const fecha = new Date(fechaISO);
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();
  return `${dia} de ${mes} de ${anio}`;
}

function safeText(field: any): string {
  // Si es un array de objetos (RichText), usa asText solo si el primer elemento tiene 'text'
  if (Array.isArray(field) && field.length && typeof field[0] === 'object' && 'text' in field[0]) {
    return asText(field as any) || '';
  }
  // Si es string, devuélvelo
  if (typeof field === 'string') return field;
  // Si es número, conviértelo a string
  if (typeof field === 'number') return String(field);
  // Si es array de un solo string/number
  if (Array.isArray(field) && field.length === 1 && (typeof field[0] === 'string' || typeof field[0] === 'number')) {
    return String(field[0]);
  }
  return '';
}

export function useHomeContent() {
  const [data, setData] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHome() {
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getSingle('home');
        console.log('[Prismic] Documento recibido:', doc);
        setData({
          imagen: asImageSrc(doc.data.imagen) || '',
          nombre_uno: safeText(doc.data.nombre_uno),
          nombre_dos: safeText(doc.data.nombre_dos),
          fecha: safeText(doc.data.fecha),
        });
      } catch (err) {
        console.error('[Prismic] Error al obtener Home:', err);
        setError('No se pudo cargar el contenido de la Home.');
      } finally {
        setLoading(false);
      }
    }
    fetchHome();
  }, []);

  return { data, loading, error };
} 
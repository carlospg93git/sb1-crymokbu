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
        setData({
          imagen: asImageSrc(doc.data.imagen) || '',
          nombre_uno: asText(doc.data.nombre_uno) || '',
          nombre_dos: asText(doc.data.nombre_dos) || '',
          fecha: asText(doc.data.fecha) || '',
        });
      } catch (err) {
        setError('No se pudo cargar el contenido de la Home.');
      } finally {
        setLoading(false);
      }
    }
    fetchHome();
  }, []);

  return { data, loading, error };
} 
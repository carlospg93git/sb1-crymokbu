import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';

export interface Branding {
  color_principal: string;
  color_menu: string;
  fuente_principal: string;
  fuente_secundaria?: string;
  fondo_color: string;
  fondo_imagen?: { url: string };
}

export function useBranding() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBranding() {
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getSingle('branding');
        setBranding({
          color_principal: doc.data.color_principal || '#457945',
          color_menu: doc.data.color_menu || '#b5d6b5',
          fuente_principal: doc.data.fuente_principal || 'Cormorant',
          fuente_secundaria: doc.data.fuente_secundaria || '',
          fondo_color: doc.data.fondo_color || '#edf5ed',
          fondo_imagen: doc.data.fondo_imagen || undefined,
        });
      } catch (err) {
        setError('No se pudo cargar el branding.');
      } finally {
        setLoading(false);
      }
    }
    fetchBranding();
  }, []);

  return { branding, loading, error };
} 
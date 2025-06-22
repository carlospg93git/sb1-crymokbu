import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';

export interface Branding {
  color_principal: string;
  color_menu: string;
  fuente_principal: string;
  font_size_principal?: string;
  fuente_secundaria?: string;
  font_size_secundaria?: string;
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
          color_principal: doc.data.color_principal || '#1e40af',
          color_menu: doc.data.color_menu || '#bfdbfe',
          fuente_principal: doc.data.fuente_principal || 'Cormorant',
          font_size_principal: doc.data.font_size_principal || '18px',
          fuente_secundaria: doc.data.fuente_secundaria || '',
          font_size_secundaria: doc.data.font_size_secundaria || '24px',
          fondo_color: doc.data.fondo_color || '#eff6ff',
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
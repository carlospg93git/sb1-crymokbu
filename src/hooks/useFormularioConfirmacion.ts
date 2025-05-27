import { useEffect, useState } from 'react';
import { prismicClient } from '../config/prismic';

export interface CampoFormulario {
  nombre_interno: string;
  mostrar_campo: boolean;
  obligatorio: boolean;
  etiqueta: string;
  placeholder?: string;
  tipo_de_campo: string;
  orden: number;
  opciones?: string[];
}

export function useFormularioConfirmacion() {
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFormulario() {
      setLoading(true);
      setError(null);
      try {
        const doc = await prismicClient.getSingle('formulario_confirmacion');
        const slices = doc.data.body || [];
        const campos: CampoFormulario[] = [];
        slices.forEach((slice: any) => {
          if (slice.slice_type === 'campo_formulario' && Array.isArray(slice.items)) {
            slice.items.forEach((item: any) => {
              if (!item.mostrar_campo) return;
              campos.push({
                nombre_interno: item.nombre_interno || '',
                mostrar_campo: item.mostrar_campo ?? true,
                obligatorio: item.obligatorio ?? false,
                etiqueta: item.etiqueta || '',
                placeholder: item.placeholder || '',
                tipo_de_campo: item.tipo_de_campo || 'Texto corto (input)',
                orden: typeof item.orden === 'number' ? item.orden : 0,
                opciones: item.opciones ? item.opciones.split(',').map((o: string) => o.trim()) : undefined,
              });
            });
          }
        });
        setCampos(campos.sort((a, b) => a.orden - b.orden));
      } catch (err) {
        setError('No se pudo cargar la configuración del formulario.');
      } finally {
        setLoading(false);
      }
    }
    fetchFormulario();
  }, []);

  return { campos, loading, error };
} 
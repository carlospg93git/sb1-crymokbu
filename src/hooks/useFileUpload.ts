import { useState } from 'react';
import { cloudflareConfig } from '../config/cloudflare';

interface UseFileUploadProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  prefix: string; // Nuevo: prefijo dinámico para la carpeta de subida
}

const useFileUpload = ({ fileInputRef, prefix }: UseFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFiles = async (files: File[]) => {
    if (!files.length) {
      setError('No se han seleccionado archivos.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      for (const file of files) {
        if (file.size > 500 * 1024 * 1024) { // 500MB limit
          throw new Error(`El archivo ${file.name} excede el límite de 500MB`);
        }

        const key = `${prefix}/${Date.now()}-${file.name}`;
        setUploadProgress(prev => ({ ...prev, [key]: 0 }));

        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', key);

        const response = await fetch(cloudflareConfig.workerUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error al subir ${file.name}: ${response.statusText}`);
        }

        setUploadProgress(prev => ({ ...prev, [key]: 100 }));
      }

      setSuccess(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadProgress({});
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ha ocurrido un error desconocido');
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadProgress,
    error,
    success,
    handleFiles,
    setError,
    setSuccess
  };
};

export default useFileUpload; 
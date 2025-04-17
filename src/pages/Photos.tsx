import React, { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const Photos = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('bg-nature-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('bg-nature-50');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('bg-nature-50');
    }
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const s3Client = new S3Client({
        region: import.meta.env.VITE_AWS_REGION,
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        },
      });

      for (const file of files) {
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
          throw new Error(`File ${file.name} exceeds 100MB limit`);
        }

        const key = `wedding-photos/${Date.now()}-${file.name}`;
        setUploadProgress(prev => ({ ...prev, [key]: 0 }));
        
        const { url, fields } = await createPresignedPost(s3Client, {
          Bucket: import.meta.env.VITE_AWS_BUCKET_NAME,
          Key: key,
          Conditions: [
            ['content-length-range', 0, 100 * 1024 * 1024], // up to 100MB
            ['starts-with', '$key', 'wedding-photos/'],
            ['eq', '$Content-Type', file.type], // Restrict content type
          ],
          Fields: {
            'Content-Type': file.type,
          },
          Expires: 300, // 5 minutes
        });

        const formData = new FormData();
        Object.entries(fields).forEach(([fieldKey, value]) => {
          formData.append(fieldKey, value);
        });
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(prev => ({ ...prev, [key]: percentComplete }));
          }
        });

        await new Promise((resolve, reject) => {
          xhr.open('POST', url);
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(null);
            } else {
              reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
            }
          };
          xhr.onerror = () => reject(new Error('Upload failed'));
          xhr.send(formData);
        });
      }

      setSuccess(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadProgress({});
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Camera className="text-nature-600 w-8 h-8" />
        <h1 className="text-2xl font-display font-bold ml-2">Fotos y vídeos</h1>
      </div>

      <div className="space-y-6">
        <div 
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="bg-white p-8 rounded-lg shadow-lg text-center transition-colors duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            className="hidden"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full min-h-[200px] border-2 border-dashed border-nature-300 rounded-lg p-8 flex flex-col items-center justify-center space-y-4 hover:border-nature-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={48} className="text-nature-600" />
            <div className="text-center">
              <p className="text-lg font-semibold text-nature-600 mb-2">
                {uploading ? 'Subiendo archivos...' : 'Arrastra tus fotos y vídeos aquí'}
              </p>
              <p className="text-sm text-gray-500">
                o haz clic para seleccionar archivos
              </p>
            </div>
          </button>

          {Object.entries(uploadProgress).map(([key, progress]) => (
            <div key={key} className="mt-4">
              <div className="text-sm text-gray-600 mb-1">{key.split('/').pop()}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-nature-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}

          {error && (
            <p className="text-red-600 mt-4 text-sm">
              {error}
            </p>
          )}

          {success && (
            <div className="mt-6 p-4 bg-nature-50 rounded-lg">
              <p className="text-nature-600 font-semibold">¡Gracias por compartir tus recuerdos con nosotros!</p>
              <p className="text-sm text-gray-600 mt-2">Puedes seguir subiendo más fotos y vídeos cuando quieras.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Photos;
import React, { useRef } from 'react';
import { Camera } from 'lucide-react';
import DropZone from '../components/DropZone';
import UploadProgressList from '../components/UploadProgressList';
import UploadSuccessMessage from '../components/UploadSuccessMessage';
import useFileUpload from '../hooks/useFileUpload';

const Photos = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const {
    uploading,
    uploadProgress,
    error,
    success,
    handleFiles,
    setError,
    setSuccess
  } = useFileUpload({ fileInputRef });

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Camera className="text-nature-600 w-8 h-8" />
        <h1 className="text-2xl font-display font-bold ml-2">Fotos y vídeos</h1>
      </div>
      <div className="space-y-6">
        <DropZone
          fileInputRef={fileInputRef}
          dropZoneRef={dropZoneRef}
          uploading={uploading}
          handleFiles={handleFiles}
          setError={setError}
          setSuccess={setSuccess}
        />
        <UploadProgressList uploadProgress={uploadProgress} />
        {error && (
          <p className="text-red-600 mt-4 text-sm">{error}</p>
        )}
        {success && <UploadSuccessMessage />}
      </div>
    </div>
  );
};

export default Photos;
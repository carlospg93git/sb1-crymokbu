import React from 'react';
import { Upload } from 'lucide-react';

type DropZoneProps = {
  fileInputRef: React.RefObject<HTMLInputElement>;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  uploading: boolean;
  handleFiles: (files: File[]) => void;
  setError: (msg: string | null) => void;
  setSuccess: (val: boolean) => void;
};

const DropZone: React.FC<DropZoneProps> = ({
  fileInputRef,
  dropZoneRef,
  uploading,
  handleFiles,
  setError,
  setSuccess
}) => {
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

  return (
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
    </div>
  );
};

export default DropZone; 
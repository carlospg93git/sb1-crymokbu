import React from 'react';

type UploadProgressListProps = {
  uploadProgress: { [key: string]: number };
};

const UploadProgressList: React.FC<UploadProgressListProps> = ({ uploadProgress }) => {
  if (!uploadProgress || Object.keys(uploadProgress).length === 0) return null;
  return (
    <div>
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
    </div>
  );
};

export default UploadProgressList; 
import React from 'react';
import { useBranding } from '../hooks/useBranding';

interface UploadProgressListProps {
  files: { name: string; progress: number }[];
}

const UploadProgressList: React.FC<UploadProgressListProps> = ({ files }) => {
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';
  return (
    <div className="mt-4 space-y-2">
      {files.map((file, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-sm text-gray-700 truncate w-32">{file.name}</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${file.progress}%`, background: colorPrincipal }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 w-8 text-right">{file.progress}%</span>
        </div>
      ))}
    </div>
  );
};

export default UploadProgressList; 
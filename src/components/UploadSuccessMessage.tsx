import React from 'react';
import { useBranding } from '../hooks/useBranding';

const UploadSuccessMessage: React.FC = () => {
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';
  return (
    <div className="mt-6 p-4 bg-nature-50 rounded-lg">
      <p className="font-semibold" style={{ color: colorPrincipal }}>¡Gracias por compartir tus recuerdos con nosotros!</p>
      <p className="text-sm text-gray-600 mt-2">Puedes seguir subiendo más fotos y vídeos cuando quieras.</p>
    </div>
  );
};

export default UploadSuccessMessage; 
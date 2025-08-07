import React from 'react';
import { TrendingDown, Download, Image, Video, HardDrive } from 'lucide-react';

interface GalleryItem {
  key: string;
  name: string;
  size: number;
  type: string;
  fecha: string;
  thumbnailUrl: string;
  originalUrl: string;
  isImage: boolean;
  isVideo: boolean;
  thumbnailSize: number;
}

interface GalleryStatsProps {
  items: GalleryItem[];
}

const GalleryStats: React.FC<GalleryStatsProps> = ({ items }) => {
  if (items.length === 0) return null;

  // Calcular estadísticas
  const totalOriginalSize = items.reduce((sum, item) => sum + item.size, 0);
  const totalThumbnailSize = items.reduce((sum, item) => sum + item.thumbnailSize, 0);
  const savings = totalOriginalSize - totalThumbnailSize;
  const savingsPercentage = ((savings / totalOriginalSize) * 100).toFixed(1);
  
  const imageCount = items.filter(item => item.isImage).length;
  const videoCount = items.filter(item => item.isVideo).length;
  
  const avgOriginalSize = Math.round(totalOriginalSize / items.length);
  const avgThumbnailSize = Math.round(totalThumbnailSize / items.length);

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-800 flex items-center">
          <TrendingDown size={20} className="mr-2" />
          Optimización de Datos
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{savingsPercentage}%</div>
          <div className="text-sm text-green-700">ahorro</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ahorro total */}
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ahorro total</p>
              <p className="text-xl font-bold text-green-600">{formatFileSize(savings)}</p>
            </div>
            <TrendingDown size={24} className="text-green-500" />
          </div>
        </div>

        {/* Archivos */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total archivos</p>
              <p className="text-xl font-bold text-blue-600">{items.length}</p>
            </div>
            <HardDrive size={24} className="text-blue-500" />
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Imágenes</p>
              <p className="text-xl font-bold text-purple-600">{imageCount}</p>
            </div>
            <Image size={24} className="text-purple-500" />
          </div>
        </div>

        {/* Vídeos */}
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vídeos</p>
              <p className="text-xl font-bold text-red-600">{videoCount}</p>
            </div>
            <Video size={24} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Detalles de optimización */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Tamaños promedio</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Original:</span>
              <span className="text-sm font-medium">{formatFileSize(avgOriginalSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Thumbnail:</span>
              <span className="text-sm font-medium">{formatFileSize(avgThumbnailSize)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-green-600">Reducción:</span>
              <span className="text-sm font-medium text-green-600">
                {((avgOriginalSize - avgThumbnailSize) / avgOriginalSize * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Beneficios</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Carga más rápida de la galería</li>
            <li>• Menor consumo de datos móviles</li>
            <li>• Mejor experiencia de usuario</li>
            <li>• Archivos originales solo al descargar</li>
          </ul>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>¿Cómo funciona?</strong> Las imágenes se muestran en versión reducida para preview. 
          Los archivos originales solo se descargan cuando los solicitas explícitamente, 
          ahorrando ancho de banda y mejorando la velocidad de carga.
        </p>
      </div>
    </div>
  );
};

export default GalleryStats;

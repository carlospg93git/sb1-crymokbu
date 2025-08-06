import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Video, Download, Upload, ChevronUp, Filter, X, Check } from 'lucide-react';
import { useBranding } from '../hooks/useBranding';
import { useLocation } from 'react-router-dom';
import { useConfigSections } from '../hooks/useConfigSections';
import { getLucideIconByName } from '../App';

interface GalleryItem {
  key: string;
  name: string;
  size: number;
  type: string;
  fecha: string;
  url: string;
}

interface GalleryFilters {
  showPhotos: boolean;
  showVideos: boolean;
}

const Gallery = () => {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '') || 'galeria';
  const { orderedSections, event_code } = useConfigSections();
  const section = (orderedSections.find(sec => sec.url_interna === slug) as any) || {};
  const sectionTitle = section.nombre_seccion || 'Galería';
  const iconName = section.icon || 'image';
  const Icon = getLucideIconByName(slug === '' ? 'house' : iconName);
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';

  // Estados
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<GalleryFilters>({ showPhotos: true, showVideos: true });
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState<GalleryItem | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Refs
  const scrollTopRef = useRef<HTMLButtonElement>(null);

  // Worker URL
  const workerUrl = 'https://gallery.carlospg93.workers.dev';

  // Cargar archivos de la galería
  const loadGallery = useCallback(async () => {
    if (!event_code) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${workerUrl}/api/gallery?event_code=${event_code}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar la galería');
      }
      
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [event_code]);

  // Cargar galería al montar y cuando cambie event_code
  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // Detectar scroll para mostrar/ocultar botón de volver arriba
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtrar items según los filtros activos
  const filteredItems = items.filter(item => {
    const isImage = item.type.startsWith('image/');
    const isVideo = item.type.startsWith('video/');
    
    if (filters.showPhotos && filters.showVideos) return true;
    if (filters.showPhotos && isImage) return true;
    if (filters.showVideos && isVideo) return true;
    return false;
  });

  // Manejar selección de items
  const toggleItemSelection = (key: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  // Seleccionar todos los items visibles
  const selectAllVisible = () => {
    const visibleKeys = new Set(filteredItems.map(item => item.key));
    setSelectedItems(visibleKeys);
  };

  // Deseleccionar todos
  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  // Descargar items seleccionados
  const downloadSelected = async () => {
    if (selectedItems.size === 0) return;
    
    if (selectedItems.size === 1) {
      // Descarga individual
      const item = items.find(item => item.key === Array.from(selectedItems)[0]);
      if (item) {
        const link = document.createElement('a');
        link.href = `${workerUrl}${item.url}`;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      // Descarga múltiple en ZIP
      const selectedKeys = Array.from(selectedItems);
      const url = `${workerUrl}/api/download-zip?event_code=${event_code}&${selectedKeys.map(key => `files=${encodeURIComponent(key)}`).join('&')}`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'galeria.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Abrir modal para visualización ampliada
  const openModal = (item: GalleryItem) => {
    setModalItem(item);
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setModalItem(null);
  };

  // Volver arriba
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ir a la página de subida
  const goToUpload = () => {
    window.location.href = '/fotos';
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{ borderColor: colorPrincipal }}></div>
        <span style={{ color: colorPrincipal }}>Cargando galería...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <span className="text-red-600 text-center mb-4">{error}</span>
        <button 
          onClick={loadGallery}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <Icon style={{ color: colorPrincipal }} className="w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">{sectionTitle}</h1>
      </div>

      {/* Filtros y controles */}
      <div className="mb-6 space-y-4">
        {/* Botón de filtros */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Filter size={16} className="mr-2" />
            Filtros
          </button>
          
          {selectedItems.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedItems.size} seleccionado{selectedItems.size !== 1 ? 's' : ''}
              </span>
              <button
                onClick={deselectAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Deseleccionar
              </button>
            </div>
          )}
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showPhotos}
                  onChange={(e) => setFilters(prev => ({ ...prev, showPhotos: e.target.checked }))}
                  className="mr-2"
                />
                <Image size={16} className="mr-1" />
                Fotos
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showVideos}
                  onChange={(e) => setFilters(prev => ({ ...prev, showVideos: e.target.checked }))}
                  className="mr-2"
                />
                <Video size={16} className="mr-1" />
                Vídeos
              </label>
            </div>
          </div>
        )}

        {/* Controles de selección */}
        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAllVisible}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Seleccionar todos
              </button>
              {selectedItems.size > 0 && (
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Deseleccionar todos
                </button>
              )}
            </div>
            
            {selectedItems.size > 0 && (
              <button
                onClick={downloadSelected}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Download size={16} className="mr-2" />
                Descargar {selectedItems.size > 1 ? 'ZIP' : 'archivo'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid de archivos */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Image size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No hay archivos en la galería</p>
          <button
            onClick={goToUpload}
            className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Upload size={16} className="mr-2" />
            Subir archivos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isImage = item.type.startsWith('image/');
            const isVideo = item.type.startsWith('video/');
            const isSelected = selectedItems.has(item.key);
            
            return (
              <div
                key={item.key}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleItemSelection(item.key)}
              >
                {/* Checkbox de selección */}
                <div className="absolute top-2 left-2 z-10">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </div>

                {/* Preview del archivo */}
                <div className="aspect-square bg-gray-100 relative">
                  {isImage ? (
                    <img
                      src={`${workerUrl}${item.url}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : isVideo ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Video size={48} className="text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Image size={48} className="text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay con información */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(item);
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-opacity"
                    >
                      Ver
                    </button>
                  </div>
                </div>

                {/* Información del archivo */}
                <div className="p-3 bg-white">
                  <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.size)} • {formatDate(item.fecha)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para visualización ampliada */}
      {showModal && modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <X size={24} />
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              {modalItem.type.startsWith('image/') ? (
                <img
                  src={`${workerUrl}${modalItem.url}`}
                  alt={modalItem.name}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              ) : modalItem.type.startsWith('video/') ? (
                <video
                  src={`${workerUrl}${modalItem.url}`}
                  controls
                  className="max-w-full max-h-[80vh]"
                />
              ) : null}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold">{modalItem.name}</h3>
                <p className="text-sm text-gray-600">
                  {formatFileSize(modalItem.size)} • {formatDate(modalItem.fecha)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante para volver arriba */}
      {showScrollTop && (
        <button
          ref={scrollTopRef}
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 shadow-lg z-40"
        >
          <ChevronUp size={24} />
        </button>
      )}

      {/* Botón flotante para subir archivos */}
      <button
        onClick={goToUpload}
        className="fixed bottom-20 left-4 bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 shadow-lg z-40"
      >
        <Upload size={24} />
      </button>
    </div>
  );
};

export default Gallery; 
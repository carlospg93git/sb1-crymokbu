import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Video, Download, Upload, ChevronUp, Filter, X, Check } from 'lucide-react';
import { useBranding } from '../hooks/useBranding';
import { useLocation } from 'react-router-dom';
import { useConfigSections } from '../hooks/useConfigSections';
import { getLucideIconByName } from '../App';
// import GalleryStats from '../components/GalleryStats'; // Eliminado

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
  const [modalIndex, setModalIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Refs
  const scrollTopRef = useRef<HTMLButtonElement>(null);

  // Worker URL
  const workerUrl = 'https://gallery-optimized.carlospg93.workers.dev';

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
    if (filters.showPhotos && filters.showVideos) return true;
    if (filters.showPhotos && item.isImage) return true;
    if (filters.showVideos && item.isVideo) return true;
    return false;
  });

  // Navegación con teclado en el modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showModal) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (modalIndex > 0) prevImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (modalIndex < filteredItems.length - 1) nextImage();
          break;
        case 'Escape':
          e.preventDefault();
          closeModal();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, modalIndex, filteredItems.length]);

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
      // Descarga individual usando URL original
      const item = items.find(item => item.key === Array.from(selectedItems)[0]);
      if (item) {
        const link = document.createElement('a');
        link.href = `${workerUrl}${item.originalUrl}`;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      // Descarga múltiple en ZIP
      const selectedKeys = Array.from(selectedItems);
      
      // Verificar límite de archivos
      if (selectedKeys.length > 20) {
        alert('Máximo 20 archivos permitidos para descarga ZIP. Por favor, selecciona menos archivos.');
        return;
      }
      
      try {
        // Usar POST para evitar URLs muy largas
        const response = await fetch(`${workerUrl}/api/download-zip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_code,
            files: selectedKeys
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error en la descarga');
        }
        
        // Crear blob y descargar
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'galeria.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Error descargando ZIP:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        alert(`Error al descargar: ${errorMessage}`);
      }
    }
  };

  // Abrir modal para visualización ampliada
  const openModal = (item: GalleryItem) => {
    const index = filteredItems.findIndex(i => i.key === item.key);
    setModalIndex(index);
    setModalItem(item);
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setModalItem(null);
    setModalIndex(0);
  };

  // Navegar al siguiente archivo en el modal
  const nextImage = () => {
    if (modalIndex < filteredItems.length - 1) {
      const nextItem = filteredItems[modalIndex + 1];
      setModalIndex(modalIndex + 1);
      setModalItem(nextItem);
    }
  };

  // Navegar al archivo anterior en el modal
  const prevImage = () => {
    if (modalIndex > 0) {
      const prevItem = filteredItems[modalIndex - 1];
      setModalIndex(modalIndex - 1);
      setModalItem(prevItem);
    }
  };

  // Volver arriba
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ir a la página de subida
  const goToUpload = () => {
    window.location.href = '/fotos';
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
            const isSelected = selectedItems.has(item.key);
            
            return (
              <div
                key={item.key}
                className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Checkbox de selección - solo clic aquí selecciona */}
                <div 
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItemSelection(item.key);
                  }}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                </div>

                {/* Preview del archivo - clic aquí abre el modal */}
                <div 
                  className="aspect-square bg-gray-100 relative"
                  onClick={() => openModal(item)}
                >
                  {item.isImage ? (
                    <img
                      src={`${workerUrl}${item.thumbnailUrl}`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onLoad={() => setLoadedImages(prev => new Set(prev).add(item.key))}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : item.isVideo ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Video size={48} className="text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Image size={48} className="text-gray-400" />
                    </div>
                  )}
                  {/* Eliminado: Indicador de tamaño */}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para visualización ampliada */}
      {showModal && modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl max-h-full w-full">
            {/* Botón cerrar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <X size={24} />
            </button>
            
            {/* Botón anterior */}
            {modalIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
              >
                <ChevronUp size={24} className="-rotate-90" />
              </button>
            )}
            
            {/* Botón siguiente */}
            {modalIndex < filteredItems.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
              >
                <ChevronUp size={24} className="rotate-90" />
              </button>
            )}
            
            {/* Contenido del modal - usar URL original para mejor calidad */}
            {modalItem.isImage ? (
              <img
                src={`${workerUrl}${modalItem.originalUrl}`}
                alt={modalItem.name}
                className="max-w-full max-h-full object-contain mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : modalItem.isVideo ? (
              <video
                src={`${workerUrl}${modalItem.originalUrl}`}
                controls
                className="max-w-full max-h-full mx-auto"
              />
            ) : null}
            
            {/* Eliminado: Información del archivo en el modal */}
            {/* Solo botón de descarga */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded-lg">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `${workerUrl}${modalItem.originalUrl}`;
                  link.download = modalItem.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Download size={16} className="mr-2" />
                Descargar
              </button>
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
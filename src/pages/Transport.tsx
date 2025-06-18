import React, { useState } from 'react';
import { Bus, Car, Train } from 'lucide-react';
import { useBranding } from '../hooks/useBranding';
import { useLocation } from 'react-router-dom';
import { useConfigSections } from '../hooks/useConfigSections';
import { getLucideIconByName } from '../App';

const Transport = () => {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '') || 'transporte';
  const { orderedSections } = useConfigSections();
  const section = (orderedSections.find(sec => sec.url_interna === slug) as any) || {};
  const sectionTitle = section.nombre_seccion || 'Transporte';
  const iconName = section.icon || 'bus';
  const Icon = getLucideIconByName(slug === '' ? 'house' : iconName);
  const [activeTab, setActiveTab] = useState<'bus' | 'car' | 'ticket'>('bus');
  const { branding } = useBranding();
  const colorPrincipal = branding?.color_principal || '#457945';

  return (
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <Icon style={{ color: colorPrincipal }} className="w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">{sectionTitle}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
              activeTab === 'bus'
                ? ''
                : 'text-gray-600'
            }`}
            style={activeTab === 'bus' ? { color: colorPrincipal, borderBottom: `2px solid ${colorPrincipal}`, background: 'rgba(255,255,255,0.8)' } : {}}
            onClick={() => setActiveTab('bus')}
          >
            <Bus size={20} style={activeTab === 'bus' ? { color: colorPrincipal } : {}} />
            <span>Autocares</span>
          </button>
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
              activeTab === 'car'
                ? ''
                : 'text-gray-600'
            }`}
            style={activeTab === 'car' ? { color: colorPrincipal, borderBottom: `2px solid ${colorPrincipal}`, background: 'rgba(255,255,255,0.8)' } : {}}
            onClick={() => setActiveTab('car')}
          >
            <Car size={20} style={activeTab === 'car' ? { color: colorPrincipal } : {}} />
            <span>Coche</span>
          </button>
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 ${
              activeTab === 'public'
                ? ''
                : 'text-gray-600'
            }`}
            style={activeTab === 'public' ? { color: colorPrincipal, borderBottom: `2px solid ${colorPrincipal}`, background: 'rgba(255,255,255,0.8)' } : {}}
            onClick={() => setActiveTab('public')}
          >
            <Train size={20} style={activeTab === 'public' ? { color: colorPrincipal } : {}} />
            <span>Transporte público</span>
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'bus' && (
            <div className="space-y-4">
              <section>
                <h2 className="text-xl font-semibold mb-3">Autocar Privado - Ruiz Muñoz</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2" style={{ color: colorPrincipal }}>A la Ceremonia</h3>
                    <p className="text-gray-700 mb-2">Horarios de salida:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>11:00 - Desde la estación de metro Mar de Cristal</li>
                      <li>11:15 - Desde Plaza Castilla</li>
                      <li>12:15 - Desde Rascafría (La Petite Brasserie)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2" style={{ color: colorPrincipal }}>A la Finca el Robledo</h3>
                    <p className="text-gray-700 mb-2">Una vez finalice la ceremonia</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>14:30 - Salida desde el Parking del Monasterio/li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2" style={{ color: colorPrincipal }}>Servicio de Vuelta</h3>
                    <p className="text-gray-700 mb-2">Horarios de salida de la Finca:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>23:00 - Hacia Los Grifos (el autocar volverá a la Finca de nuevo para salir hacia Madrid)</li>
                      <li>23:15 - Hacia Madrid </li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'car' && (
            <div className="space-y-4">
              <section>
                <h2 className="text-xl font-semibold mb-3">Direcciones en Google Maps</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2" style={{ color: colorPrincipal }}>A la Iglesia</h3>
                    <p className="text-gray-600 mb-3">
                      Monasterio del Paular. Habrá Parking Reservado. Enseña esta página en tu móvil a la persona de la entrada. ¡Tenlo preparado para evitar atascos!
                    </p>
                    <a
                      href="https://maps.app.goo.gl/UP5j355tbtzkZr399"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ background: colorPrincipal }}
                    >
                      Abrir en Google Maps
                    </a>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2" style={{ color: colorPrincipal }}>A la Finca</h3>
                    <p className="text-gray-600 mb-3">
                      Finca el Robledo. El tramo fina es de tierra. Hay parking reservado en la Finca.
                    </p>
                    <a
                      href="https://maps.app.goo.gl/md5GwtTu9n4c5ozC8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-white px-4 py-2 rounded-lg transition-colors"
                      style={{ background: colorPrincipal }}
                    >
                      Abrir en Google Maps
                    </a>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'public' && (
            <div className="space-y-4">
              <section>
                <h2 className="text-xl font-semibold mb-3">Entrada Parking</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2" style={{ color: colorPrincipal }}>By Train</h3>
                    <p className="text-gray-600 mb-2">Nearest stations:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Central Station (15 min walk to church)</li>
                      <li>West Station (10 min walk to venue)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2" style={{ color: colorPrincipal }}>By Bus</h3>
                    <p className="text-gray-600 mb-2">Regular services:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Bus 101 - Stops directly outside church</li>
                      <li>Bus 202 - 5 min walk to venue</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transport;
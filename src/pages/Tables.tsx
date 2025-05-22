import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';

// La URL de la API se debe definir en el archivo .env como VITE_INVITADOS_API_URL

// Si usas TypeScript, asegúrate de tener instalado: npm i --save-dev @types/node
const API_URL = import.meta.env.VITE_INVITADOS_API_URL;

type Invitado = {
  nombre: string;
  apellidos: string;
  mesa: number;
  email: string;
  telefono: string;
  confirmada_asistencia: boolean;
};

const Tables = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitados = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("[Mesas] Iniciando fetch de invitados. API_URL:", API_URL);
        if (!API_URL) throw new Error('No se ha definido la URL de la API de invitados');
        const res = await fetch(API_URL);
        console.log("[Mesas] Respuesta fetch:", res);
        const text = await res.text();
        console.log("[Mesas] Texto bruto recibido:", text);
        let data;
        try {
          data = JSON.parse(text);
          console.log("[Mesas] JSON parseado:", data);
        } catch (parseErr) {
          console.error("[Mesas] Error al parsear JSON:", parseErr);
          throw new Error("Respuesta de la API no es JSON válido");
        }
        // Normaliza confirmada_asistencia a booleano
        const normalizados = data.map((inv: any) => ({
          ...inv,
          confirmada_asistencia: !!inv.confirmada_asistencia,
        }));
        console.log("[Mesas] Invitados normalizados:", normalizados);
        setInvitados(normalizados);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
        console.error("[Mesas] Error en fetch:", err);
      } finally {
        setLoading(false);
        console.log("[Mesas] Finaliza fetch de invitados");
      }
    };
    fetchInvitados();
  }, []);

  const normalizeString = (str: string) => {
    return str.normalize('NFD').replace(/\u0300-\u036f/g, '').toLowerCase();
  };

  // Agrupa invitados por mesa
  const mesas: { [mesa: number]: Invitado[] } = {};
  invitados.forEach((inv) => {
    if (!mesas[inv.mesa]) mesas[inv.mesa] = [];
    mesas[inv.mesa].push(inv);
  });

  // Filtra invitados por búsqueda
  const filteredGuests = invitados.filter((inv) =>
    `${inv.nombre} ${inv.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Users className="text-nature-600 w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Seating Plan</h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-center ${
              activeTab === 'list'
                ? 'text-nature-600 border-b-2 border-nature-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('list')}
          >
            Invitados y mesas
          </button>
          <button
            className={`flex-1 py-3 text-center ${
              activeTab === 'map'
                ? 'text-nature-600 border-b-2 border-nature-600'
                : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('map')}
          >
            Mapa de mesas
          </button>
        </div>

        {activeTab === 'list' ? (
          <div className="p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Busca tu nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-nature-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>

            {loading ? (
              <div className="text-center text-nature-600">Cargando...</div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : searchTerm === '' ? (
              Object.entries(mesas).map(([mesa, invitados]) => (
                <div key={mesa} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h2 className="text-xl font-semibold mb-3">Mesa {mesa}</h2>
                  <ul className="space-y-2">
                    {invitados.map((inv, idx) => (
                      <li key={idx} className="text-gray-700 p-2 bg-white rounded">
                        {inv.nombre} {inv.apellidos}
                        {inv.confirmada_asistencia && (
                          <span className="ml-2 text-green-600 text-xs">(Confirmado)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="space-y-2">
                {filteredGuests.length === 0 ? (
                  <div className="text-center text-gray-500">No se encontraron invitados.</div>
                ) : (
                  filteredGuests.map((inv, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded-lg flex justify-between">
                      <span>{inv.nombre} {inv.apellidos}</span>
                      <span className="text-nature-600">Mesa {inv.mesa}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <img
              src="https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&q=80"
              alt="Table Layout"
              className="w-full rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Tables;
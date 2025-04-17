import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';

const Tables = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const tables = [
    { number: 1, guests: ["María Ramírez", "Carlos Pérez", "Christophe Ramírez", "María José Mateo", "Pedro Pérez", "Lourdes González"] },
    { number: 2, guests: ["Uncle John", "Aunt Mary", "Cousin Sarah"] },
    { number: 3, guests: ["Friend Alice", "Friend Bob", "Friend Charlie"] },
  ];

  const normalizeString = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredGuests = tables.flatMap(table => 
    table.guests
      .filter(guest => 
        normalizeString(guest).includes(normalizeString(searchTerm))
      )
      .map(guest => ({ tableNumber: table.number, guest }))
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

            <div className="space-y-4">
              {searchTerm === '' ? (
                tables.map((table) => (
                  <div key={table.number} className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3">Mesa {table.number}</h2>
                    <ul className="space-y-2">
                      {table.guests.map((guest, index) => (
                        <li key={index} className="text-gray-700 p-2 bg-white rounded">
                          {guest}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {filteredGuests.map(({ tableNumber, guest }, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded-lg flex justify-between">
                      <span>{guest}</span>
                      <span className="text-nature-600">Mesa {tableNumber}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
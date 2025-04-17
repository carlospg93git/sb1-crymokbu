import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const Location = () => {
  const venues = [
    {
      name: "Monasterio del Paular",
      address: "Rascafría",
      type: "Ceremonia",
      mapUrl: "https://maps.app.goo.gl/UP5j355tbtzkZr399",
      image: "https://ik.imagekit.io/orsoie/monasterio.webp?updatedAt=1744643342266?auto=format&fit=crop&q=80"
    },
    {
      name: "Finca El Robledo",
      address: "Rascafría",
      type: "Banquete",
      mapUrl: "https://maps.app.goo.gl/md5GwtTu9n4c5ozC8",
      image: "https://ik.imagekit.io/orsoie/finca%20robledo.webp?updatedAt=1744643342266?auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <MapPin className="text-nature-600 w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Lugares</h1>
      </div>

      <div className="space-y-6">
        {venues.map((venue, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
            <img
              src={venue.image}
              alt={venue.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{venue.name}</h2>
                  <p className="text-gray-600 text-sm">{venue.type}</p>
                </div>
                <a
                  href={venue.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-nature-600 text-white p-2 rounded-full"
                >
                  <Navigation size={20} />
                </a>
              </div>
              <p className="text-gray-700 mt-2">{venue.address}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Location;
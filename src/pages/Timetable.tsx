import React from 'react';
import { Clock } from 'lucide-react';

const Timetable = () => {
  const schedule = [
    { time: "12:30", event: "Llegada de invitados", details: "Recepción en el Monasterio del Paular" },
    { time: "13:15", event: "Comienzo de la ceremonia", details: "Capilla principal del Monasterio del Paular" },
    { time: "14:30", event: "Traslado a la Finca el Robledo", details: "Una vez finalizada la ceremonia nos trasladaremos a la Finca el Robledo" },
    { time: "15:00", event: "Cocktail", details: "Canapés y bebidas" },
    { time: "17:00", event: "Comida", details: "Plato principal en mesas sentados" },
    { time: "19:00", event: "Baile nupcial", details: "Seguido de la fiesta con DJ" },
    { time: "21:00", event: "Recena", details: "Aperitivos para continuar con la fiesta" },
    { time: "23:00", event: "Fin de fiesta", details: "Última canción de la noche y fin del evento" },
    { time: "23:15", event: "Salida del autocar", details: "No pierdas tu plaza para volver a casa" },
  ];

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Clock className="text-nature-600 w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Horarios</h1>
      </div>

      <div className="space-y-4">
        {schedule.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow flex items-start">
            <div className="w-20 flex-shrink-0">
              <p className="text-nature-600 font-semibold">{item.time}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{item.event}</h3>
              <p className="text-gray-600 text-sm">{item.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timetable
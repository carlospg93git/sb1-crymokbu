import React from 'react';
import { Church as ChurchIcon } from 'lucide-react';

const Church = () => {
  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <ChurchIcon className="text-nature-600 w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Ceremonia religiosa</h1>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Monasterio del Paular</h2>
          <img
            src="https://ik.imagekit.io/orsoie/ChatGPT%20Image%2013%20abr%202025,%2020_46_11.png?updatedAt=1744642506779?auto=format&fit=crop&q=80"
            alt="Monasterio"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <p className="text-gray-600">
            La ceremonia tendrá lugar en el Real Monasterio de Santa María del Paular,
            declarado Bien de Interés Cultural y que data del siglo XIV.<br></br>
            En <a href="https://es.wikipedia.org/wiki/Monasterio_de_Santa_Mar%C3%ADa_de_El_Paular" target="_blank" rel="noopener noreferrer" className="text-nature-600 hover:underline">este link</a> puedes consultar más detalles sobre su historia.
          </p>
        </section>

        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Lecturas de la ceremonia</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800">Primera lectura</h3>
              <p className="text-gray-600 italic">
                "Love is patient, love is kind. It does not envy, it does not boast..."
                - 1 Corinthians 13:4-8
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Segunda lectura</h3>
              <p className="text-gray-600 italic">
                "Set me as a seal upon your heart, as a seal upon your arm..."
                - Song of Solomon 8:6-7
              </p>
            </div>
             <div>
              <h3 className="font-medium text-gray-800">Salmo responsorial</h3>
              <p className="text-gray-600 italic">
                "Set me as a seal upon your heart, as a seal upon your arm..."
                - Song of Solomon 8:6-7
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Church;
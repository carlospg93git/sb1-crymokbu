import React from 'react';
import { Utensils } from 'lucide-react';

const Menu = () => {
  const menu = {
    cocktailHour: [
      "Tosta de foie",
      "Caprese Skewers",
      "Mushroom Arancini",
      "Smoked Salmon Blini"
    ],
    corners: [
      "Buffet de Quesos",
      "Cortador de Jamón",
      "Vermouth y aperitivos"
    ],
    mainCourse: [
      {
        name: "Solomillo al horno",
        description: "Con salsa de colmenillas y patatas baby"
      },
      {
        name: "Vegetarian Wellington",
        description: "Seasonal vegetables in puff pastry with mushroom sauce"
      }
    ],
    dessert: [
      "Wedding Cake",
      "Assorted Petit Fours",
      "Fresh Fruit Display"
    ],
    recena: [
      "Hamburguesas",
      "Perritos calientes",
      "Córner de chuches"
    ]
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-16">
      <div className="flex items-center justify-center mb-6">
        <Utensils className="text-nature-600 w-8 h-8" />
        <h1 className="text-2xl font-bold ml-2">Menú</h1>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Cocktail</h2>
          <ul className="space-y-2">
            {menu.cocktailHour.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Corners</h2>
          <ul className="space-y-2">
            {menu.corners.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Plato principal</h2>
          <div className="space-y-4">
            {menu.mainCourse.map((item, index) => (
              <div key={index}>
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Postre</h2>
          <ul className="space-y-2">
            {menu.dessert.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Recena</h2>
          <ul className="space-y-2">
            {menu.recena.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Menu;
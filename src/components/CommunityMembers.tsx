"use client";

const members = [
  {
    name: 'María',
    role: 'Donadora',
    emoji: '🙎🏻‍♀️',
    type: 'Donador',
  },
  {
    name: 'Carlos',
    role: 'Refugio Patitas',
    emoji: '👨🏻‍🦰',
    type: 'Refugio',
  },
  {
    name: 'Ana',
    role: 'Veterinaria Vida Animal',
    emoji: '👨🏽‍💼',
    type: 'Veterinaria',
  },
  {
    name: 'Luis',
    role: 'Tienda PetShop',
    emoji: '🙎🏾‍♂️',
    type: 'Tienda',
  },
  {
    name: 'Viri',
    role: 'Refugio amor por ellos',
    emoji: '🧑🏻‍🦰',
    type: 'Refugio',
  },
  {
    name: 'Regina',
    role: 'Donadora',
    emoji: '🧑🏻',
    type: 'Donador',
  },
];

const typeColors: Record<string, string> = {
  Donador: 'bg-orange-100 text-orange-700',
  Refugio: 'bg-green-100 text-green-700',
  Veterinaria: 'bg-blue-100 text-blue-700',
  Tienda: 'bg-brown-100 text-brown-700',
};

export default function CommunityMembers() {
  return (
    <div className="w-full bg-orange-50 py-12">
      <div className="flex flex-col gap-6 items-center mb-12">
        <h2 className="text-orange-500 font-extrabold text-[28px] text-center">
          Comunidad KADESH
        </h2>
        <p className="text-brown-700 text-lg text-center max-w-[600px] px-4">
          Aquí aparecerán las personas y aliados que forman parte de la comunidad KADESH: donadores, refugios, veterinarias y tiendas.
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 px-6 mt-12 sm:mt-36">
        {members.map((m, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center bg-white rounded-2xl p-2 w-full min-w-[90px] h-[150px] min-h-[150px] mx-auto relative shadow-md"
          >
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-1.5 text-base">
              {m.emoji}
            </div>
            <p className="font-bold text-xs text-orange-500 mb-1 text-center">{m.name}</p>
            <p className="text-[11px] text-brown-700 mb-1 text-center">{m.role}</p>
            <span className={`${typeColors[m.type]} text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5`}>
              {m.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

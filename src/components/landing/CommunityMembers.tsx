"use client";

const members = [
  {
    name: 'María López',
    role: 'Donadora frecuente',
    emoji: '🙎🏻‍♀️',
    type: 'Donador',
  },
  {
    name: 'Carlos Martínez',
    role: 'Refugio Patitas Felices',
    emoji: '👨🏻‍🦰',
    type: 'Refugio',
  },
  {
    name: 'Ana Torres',
    role: 'Vet. Vida Animal',
    emoji: '👩🏻‍⚕️',
    type: 'Veterinaria',
  },
  {
    name: 'Luis Hernández',
    role: 'Tienda PetShop MX',
    emoji: '🙎🏾‍♂️',
    type: 'Tienda',
  },
  {
    name: 'Viridiana Pérez',
    role: 'Refugio Amor por Ellos',
    emoji: '🧑🏻‍🦰',
    type: 'Refugio',
  },
  {
    name: 'Regina Gómez',
    role: 'Donadora mensual',
    emoji: '👩🏻',
    type: 'Donador',
  },
  {
    name: 'Dr. Raúl Beltrán',
    role: 'Vet. Mi Mascota Sana',
    emoji: '👨🏻‍⚕️',
    type: 'Veterinaria',
  },
  {
    name: 'Patricia Navarro',
    role: 'Tienda Huellitas',
    emoji: '👩🏼‍🚀',
    type: 'Tienda',
  },
];

const typeColors: Record<string, string> = {
  Donador: 'bg-[#f5f5f5] dark:bg-[#3a3a3a] text-[#f7945e] dark:text-[#f8a274]',
  Refugio: 'bg-[#f5f5f5] dark:bg-[#3a3a3a] text-[#4caf50] dark:text-[#81c784]',
  Veterinaria: 'bg-[#f5f5f5] dark:bg-[#3a3a3a] text-[#2196f3] dark:text-[#64b5f6]',
  Tienda: 'bg-[#f5f5f5] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]',
};

export default function CommunityMembers() {
  return (
    <div className="w-full bg-[#f5f5f5] dark:bg-[#121212] py-12">
      <div className="flex flex-col gap-6 items-center mb-12">
        <h2 className="text-[#f7945e] font-extrabold text-[28px] text-center">
          Comunidad KADESH
        </h2>
        <p className="text-[#212121] dark:text-[#b0b0b0] text-lg text-center max-w-[600px] px-4">
          Aquí aparecerán las personas y aliados que forman parte de la comunidad KADESH: donadores, refugios, veterinarias y tiendas.
        </p>
      </div>
      <div className="flex justify-center px-6 mt-12 sm:mt-36">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 justify-items-center max-w-7xl w-full">
          {members.map((m, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl p-2 w-full min-w-[90px] max-w-[120px] h-[150px] min-h-[150px] relative shadow-md"
            >
            <div className="w-10 h-10 rounded-full bg-[#f5f5f5] dark:bg-[#3a3a3a] text-[#f7945e] flex items-center justify-center mb-1.5 text-base">
              {m.emoji}
            </div>
            <p className="font-bold text-xs text-[#f7945e] mb-1 text-center">{m.name}</p>
            <p className="text-[11px] text-[#212121] dark:text-[#b0b0b0] mb-1 text-center">{m.role}</p>
            <span className={`${typeColors[m.type]} text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 text-center`}>
              {m.type}
            </span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

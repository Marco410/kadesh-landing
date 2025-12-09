"use client";

import { motion } from 'framer-motion';

const products = [
  {
    name: 'Rescate de animales',
    desc: 'Visualiza en el mapa la última ubicación reportada de animales en situación de calle o extraviados. Cualquier usuario puede añadir un caso y la comunidad podrá colaborar en tiempo real.'
  },
  {
    name: 'Directorio',
    desc: 'Encuentra fácilmente veterinarias, refugios, hospitales y animales cercanos a tu ubicación. Así, cualquier rescate o ayuda será más rápido y efectivo.'
  },
  {
    name: 'Estatus de rescates',
    desc: 'Sigue el avance de cada rescate en tiempo real: actualizaciones, comentarios, fotos y logros para que todos puedan apoyar y celebrar juntos.'
  },
  {
    name: 'Anuncios',
    desc: 'Encuentra fácilmente veterinarias, refugios, hospitales y otros servicios cercanos que pueden ayudarte a ti y a tu mascota.'
  },
  {
    name: 'Recompensas',
    desc: 'Participa en nuestro programa de recompensas: ayuda en rescates y recibe reconocimientos y beneficios exclusivos por tu labor solidaria.'
  },
  {
    name: 'Tienda en línea',
    desc: 'Adquiere medicamentos, alimento y accesorios para animales en situación vulnerable. Todo lo recaudado apoya directamente a los casos más urgentes.'
  },
  {
    name: 'Calendario',
    desc: 'Consulta eventos importantes de la comunidad: campañas de vacunación, esterilización, adopciones y actividades solidarias.'
  },
  {
    name: 'Perfil de mascota',
    desc: 'Crea un perfil personalizado para cada una de tus mascotas y lleva un control de su salud, vacunas y actividades.'
  },
  {
    name: 'Historias',
    desc: 'Descubre y comparte historias inspiradoras de animales rescatados. Motívate y motiva a otros a seguir ayudando.'
  },
];

export default function WorkingOn() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8" id='progreso'>
      <div className="flex flex-col gap-10 items-center">
        <h2 className="text-4xl font-bold text-[#212121] dark:text-[#ffffff] p-6 text-center">
          ¡Nuevas funciones en camino!
        </h2>
        <p className="text-lg text-[#212121] dark:text-[#b0b0b0] max-w-[600px] text-center p-4">
          Estamos desarrollando nuevas herramientas y mejoras para que tu experiencia con KADESH sea cada vez más completa. ¡Muy pronto podrás disfrutar de más formas de ayudar, conectar y transformar vidas!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((product, idx) => (
            <div
              key={product.name}
              className={`shadow-sm rounded-2xl p-7 min-w-[220px] max-w-[340px] border-none relative flex flex-col h-full justify-center mx-auto ${
                idx % 2 === 0 ? 'bg-[#ffffff] dark:bg-[#1e1e1e]' : 'bg-[#f5f5f5] dark:bg-[#1e1e1e]'
              }`}
            >
              <h4 className="text-[#f7945e] text-xl mb-2 text-left font-semibold">{product.name}</h4>
              <p className="text-[#212121] dark:text-[#b0b0b0] text-base text-left mb-2.5">{product.desc}</p>
              <span className="absolute bottom-4 right-4 z-[2] font-semibold text-xs tracking-wide text-[#4caf50] dark:text-[#81c784] bg-[#f5f5f5] dark:bg-[#3a3a3a] px-2 py-1 rounded">
                En desarrollo
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from 'framer-motion';

const ROADMAP_ITEMS = [
  {
    id: 1,
    title: "Diseño y prototipado",
    status: "completed",
    description: "Diseño de UI/UX y prototipos funcionales"
  },
  {
    id: 2,
    title: "Desarrollo del backend",
    status: "completed",
    description: "API y base de datos en desarrollo"
  },
  {
    id: 3,
    title: "Directorio",
    status: "completed",
    description: "Encuentra fácilmente veterinarias, refugios, hospitales y animales cercanos a tu ubicación."
  },
  {
    id: 4,
    title: "Rescate de animales",
    status: "completed",
    description: "Visualiza en el mapa la última ubicación reportada de animales en situación de calle o extraviados."
  },
  {
    id: 5,
    title: "Sistema de adopciones",
    status: "in-progress",
    description: "Plataforma de adopción y matching"
  },
  {
    id: 6,
    title: "App móvil iOS y Android",
    status: "pending",
    description: "Aplicaciones nativas en desarrollo"
  },
  {
    id: 7,
    title: "Sistema de donaciones",
    status: "in-progress",
    description: "Integración de pagos y transparencia"
  },
  {
    id: 8,
    title: "Comunidad y blog",
    status: "completed",
    description: "Espacio para historias y noticias"
  },
  {
    id: 9,
    title: "Anuncios",
    status: "in-progress",
    description: "Publica anuncios de animales en adopción, rescates, etc."
  },
  {
    id: 10,
    title: "Recompensas",
    status: "pending",
    description: "Programa de recompensas para los usuarios que ayudan a la comunidad"
  },
  {
    id: 11,
    title: "Tienda en línea",
    status: "pending",
    description: "Compra y vende productos para animales"
  },
  {
    id: 12,
    title: "Calendario",
    status: "pending",
    description: "Consulta eventos importantes de la comunidad: campañas de vacunación, esterilización, adopciones y actividades solidarias."
  },
  {
    id: 13,
    title: "Perfil de mascota",
    status: "pending",
    description: "Crea un perfil personalizado para cada una de tus mascotas y lleva un control de su salud, vacunas y actividades."
  },
  {
    id: 14,
    title: "Historias",
    status: "pending",
    description: "Descubre y comparte historias inspiradoras de animales rescatados. Motívate y motiva a otros a seguir ayudando."
  },
  {
    id: 15,
    title: "Contacto",
    status: "completed",
    description: "Contacta con el equipo de KADESH"
  },
  {
    id: 16,
    title: "Estatus de rescates",
    status: "completed",
    description: "Sigue el avance de cada rescate en tiempo real: actualizaciones, comentarios, fotos y logros para que todos puedan apoyar y celebrar juntos."
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-orange-500";
    default:
      return "bg-gray-300 dark:bg-gray-700";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "Completado";
    case "in-progress":
      return "En progreso";
    default:
      return "Pendiente";
  }
};

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="w-full py-20 bg-gray-50 dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Roadmap público
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Avances del desarrollo - Transparencia total
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROADMAP_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)} flex-shrink-0 mt-1.5`}></div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  item.status === "completed" 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : item.status === "in-progress"
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}>
                  {getStatusText(item.status)}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Quieres estar al día con nuestros avances?
          </p>
          <a
            href="/comunidad"
            className="text-orange-500 dark:text-orange-400 font-semibold hover:underline"
          >
            Únete a la comunidad →
          </a>
        </motion.div>
      </div>
    </section>
  );
}


'use client';

const ROADMAP_ITEMS = [
  {
    id: 1,
    title: 'Diseño y prototipado',
    status: 'completed',
    description: 'Diseño de UI/UX y prototipos funcionales',
  },
  {
    id: 2,
    title: 'Desarrollo del backend',
    status: 'completed',
    description: 'API y base de datos en desarrollo',
  },
  {
    id: 3,
    title: 'Directorio',
    status: 'completed',
    description:
      'Encuentra fácilmente veterinarias, refugios, hospitales y animales cercanos a tu ubicación.',
  },
  {
    id: 4,
    title: 'Rescate de animales',
    status: 'completed',
    description:
      'Visualiza en el mapa la última ubicación reportada de animales en situación de calle o extraviados.',
  },
  {
    id: 5,
    title: 'Sistema de adopciones',
    status: 'in-progress',
    description: 'Plataforma de adopción y matching',
  },
  {
    id: 6,
    title: 'App móvil iOS y Android',
    status: 'pending',
    description: 'Aplicaciones nativas en desarrollo',
  },
  {
    id: 7,
    title: 'Sistema de donaciones',
    status: 'in-progress',
    description: 'Integración de pagos y transparencia',
  },
  {
    id: 8,
    title: 'Comunidad y blog',
    status: 'completed',
    description: 'Espacio para historias y noticias',
  },
  {
    id: 9,
    title: 'Anuncios',
    status: 'in-progress',
    description: 'Publica anuncios de animales en adopción, rescates, etc.',
  },
  {
    id: 10,
    title: 'Recompensas',
    status: 'pending',
    description:
      'Programa de recompensas para los usuarios que ayudan a la comunidad',
  },
  {
    id: 11,
    title: 'Tienda en línea',
    status: 'pending',
    description: 'Compra y vende productos para animales',
  },
  {
    id: 12,
    title: 'Calendario',
    status: 'pending',
    description:
      'Consulta eventos importantes de la comunidad: campañas de vacunación, esterilización, adopciones y actividades solidarias.',
  },
  {
    id: 13,
    title: 'Perfil de mascota',
    status: 'pending',
    description:
      'Crea un perfil personalizado para cada una de tus mascotas y lleva un control de su salud, vacunas y actividades.',
  },
  {
    id: 14,
    title: 'Historias',
    status: 'pending',
    description:
      'Descubre y comparte historias inspiradoras de animales rescatados. Motívate y motiva a otros a seguir ayudando.',
  },
  {
    id: 15,
    title: 'Contacto',
    status: 'completed',
    description: 'Contacta con el equipo de KADESH',
  },
  {
    id: 16,
    title: 'Estatus de rescates',
    status: 'completed',
    description:
      'Sigue el avance de cada rescate en tiempo real: actualizaciones, comentarios, fotos y logros para que todos puedan apoyar y celebrar juntos.',
  },
] as const;

const COLUMNS = [
  { status: 'completed', label: 'Completado', tone: 'bg-green-500' },
  { status: 'in-progress', label: 'En progreso', tone: 'bg-kadesh' },
  { status: 'pending', label: 'Pendiente', tone: 'bg-gray-300 dark:bg-gray-600' },
] as const;

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="w-full bg-[#f7f8fa] py-24 dark:bg-[#1a1a1a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
            Roadmap público
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
            Lo que ya opera, lo que estamos construyendo y lo que sigue. Sin
            métricas inventadas: solo el estado que el equipo publica aquí.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.status}>
              <div className="mb-5 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${column.tone}`} />
                <h3 className="text-sm font-semibold tracking-wide text-[#121212] uppercase dark:text-white">
                  {column.label}
                </h3>
              </div>
              <ul className="space-y-3">
                {ROADMAP_ITEMS.filter((item) => item.status === column.status).map(
                  (item) => (
                    <li
                      key={item.id}
                      className="rounded-2xl border border-[#ececec] bg-white p-5 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]"
                    >
                      <h4 className="mb-1 font-bold text-[#121212] dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                        {item.description}
                      </p>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-[#5a5a5a] dark:text-[#b0b0b0]">
          ¿Quieres estar al día con nuestros avances?{' '}
          <a href="/comunidad" className="font-semibold text-kadesh hover:underline">
            Únete a la comunidad →
          </a>
        </p>
      </div>
    </section>
  );
}

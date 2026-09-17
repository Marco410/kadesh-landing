import Link from "next/link";
import { Routes } from "kadesh/core/routes";

const ROADMAP_ITEMS = [
  {
    id: 1,
    title: "Directorio",
    status: "completed",
    description:
      "Encuentra veterinarias, refugios y hospitales cercanos. Distancia, horario y ficha con contacto.",
  },
  {
    id: 2,
    title: "Rescate de animales",
    status: "completed",
    description:
      "Publica y ve en el mapa la última ubicación de animales perdidos, encontrados o en situación de calle.",
  },
  {
    id: 3,
    title: "Adopciones",
    status: "completed",
    description:
      "Publica un animal en adopción o filtra el listado para adoptar. La ficha lleva foto, ubicación y contacto.",
  },
  {
    id: 4,
    title: "Citas en veterinarias",
    status: "completed",
    description:
      "Reserva una cita o una estancia desde la ficha del negocio. El estado se sigue en Mis citas.",
  },
  {
    id: 5,
    title: "Bitácora de rescates",
    status: "completed",
    description:
      "Sigue el avance de cada reporte: actualizaciones, comentarios y fotos en la ficha del animal.",
  },
  {
    id: 6,
    title: "Blog",
    status: "completed",
    description:
      "Historias, consejos y notas de la comunidad animal en México.",
  },
  {
    id: 7,
    title: "Contacto",
    status: "completed",
    description: "Escribe al equipo de KADESH desde la página de contacto.",
  },
  {
    id: 8,
    title: "Reclamar ficha de clínica",
    status: "completed",
    description:
      "Si es tu veterinaria, pide completar horarios, WhatsApp y el resto de la ficha pública.",
  },
  {
    id: 9,
    title: "Donaciones",
    status: "in-progress",
    description:
      "Ya puedes apoyar el proyecto. Falta un recuento claro de a qué se destina cada aportación.",
  },
  {
    id: 10,
    title: "Anuncios",
    status: "in-progress",
    description:
      "Publicar avisos de adopción, rescate y servicios más allá del reporte de un animal.",
  },
  {
    id: 11,
    title: "App móvil iOS y Android",
    status: "pending",
    description:
      "Aplicaciones nativas para reportar y buscar sin abrir el navegador.",
  },
  {
    id: 12,
    title: "Recompensas",
    status: "pending",
    description:
      "Reconocimientos para quienes ayudan a la comunidad con reportes y rescates.",
  },
  {
    id: 13,
    title: "Tienda en línea",
    status: "pending",
    description:
      "Comprar productos para animales; lo recaudado apoya casos urgentes.",
  },
  {
    id: 14,
    title: "Calendario",
    status: "pending",
    description:
      "Campañas de vacunación, esterilización, adopciones y actividades solidarias.",
  },
  {
    id: 15,
    title: "Perfil de mascota",
    status: "pending",
    description:
      "Un perfil por mascota con salud, vacunas y actividades. Hoy el alta vive en el reporte y en la cita.",
  },
] as const;

const COLUMNS = [
  { status: "completed", label: "Completado", tone: "bg-green-500" },
  { status: "in-progress", label: "En progreso", tone: "bg-kadesh" },
  {
    status: "pending",
    label: "Pendiente",
    tone: "bg-gray-300 dark:bg-gray-600",
  },
] as const;

export default function RoadmapSection() {
  return (
    <section
      id="roadmap"
      className="w-full bg-[#f7f8fa] py-24 dark:bg-night-raised"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl">
            Roadmap público
          </h2>
          <p className="text-lg text-[#5a5a5a] dark:text-[#b0b0b0]">
            Lo que ya opera, lo que estamos construyendo y lo que sigue. Sin
            métricas inventadas: solo el estado que el equipo publica aquí. El
            detalle de cada versión está en Novedades.
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
                {ROADMAP_ITEMS.filter(
                  (item) => item.status === column.status,
                ).map((item) => (
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
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-[#5a5a5a] dark:text-[#b0b0b0]">
          ¿Quieres el historial de versiones ya publicadas?{" "}
          <Link
            href={Routes.novedades}
            className="font-semibold text-kadesh hover:underline"
          >
            Ver novedades →
          </Link>
        </p>
      </div>
    </section>
  );
}

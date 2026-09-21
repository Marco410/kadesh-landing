import { DEFAULT_RADIUS_VETERINARIES } from 'kadesh/constants/constans';

export { SITE_URL } from 'kadesh/core/site';

export const HOME_DEFINITION =
  'KADESH es una plataforma digital de bienestar animal en México que conecta a personas que buscan adoptar, rescatar o reunirse con mascotas perdidas, con rescatistas, veterinarias y refugios de su zona. Reúne reportes, directorio veterinario, historias y donaciones en un solo santuario digital.';

export const HOME_FAQS = [
  {
    question: '¿Qué es KADESH?',
    answer: HOME_DEFINITION,
  },
  {
    question: '¿Cómo reporto un animal perdido en KADESH?',
    answer:
      'Entra a Animales, pulsa Reportar animal y elige si está perdido, encontrado, rescatado o en adopción. Describe tipo, ubicación y una foto. El reporte queda visible para la comunidad y para rescatistas de la zona, de modo que la búsqueda, el cuidado o la adopción puedan empezar de inmediato.',
  },
  {
    question: '¿Cómo encuentro veterinarias cercanas?',
    answer: `Abre el directorio de veterinarias y permite la ubicación. KADESH muestra establecimientos en un radio de ${DEFAULT_RADIUS_VETERINARIES} km para que puedas ver datos de contacto y llegar con quien pueda atender al animal.`,
  },
  {
    question: '¿Hay que pagar para reportar o buscar animales?',
    answer:
      'Reportar animales, consultar el directorio y leer el blog forman parte de la plataforma pública. Las donaciones y los planes para negocios son opcionales y no bloquean el uso comunitario de KADESH.',
  },
  {
    question: '¿A qué se destina una donación a KADESH?',
    answer:
      'Las donaciones cubren los gastos del proyecto: personas que lo operan, servidores, dominios y herramientas. También van a difusión y a apoyo de casos urgentes. El recuento está en Donaciones. Donar es opcional.',
  },
  {
    question: '¿Quién creó KADESH?',
    answer:
      'KADESH fue fundada en México por el ingeniero Marco Castañeda. La misión es unir tecnología y comunidad para el bienestar animal real: encontrar, atender y reubicar, no solo visibilidad en redes.',
  },
] as const;

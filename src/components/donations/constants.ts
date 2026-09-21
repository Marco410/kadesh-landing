export const STRIPE_DONATE_URL =
  'https://donate.stripe.com/6oU7sL6467dtdrY9FZgUM00';

export const DONATIONS_UPDATED_LABEL = 'Actualizado en septiembre de 2026.';

export const DONATIONS_LEAD =
  'Las donaciones cubren los gastos de este proyecto: personas que lo operan, servidores, dominios y las herramientas para que reportes y el directorio funcionen. También van a difusión, para que más gente vea un animal perdido, y a apoyo de casos urgentes. Donar es opcional y no es requisito para usar KADESH.';

export const DONATION_DESTINATIONS = [
  {
    title: 'Personas que operan KADESH',
    body: 'Quienes mantienen la plataforma, responden, moderan reportes y sostienen el día a día. Sin ese trabajo, el santuario digital no se actualiza ni atiende a quien busca un animal o una veterinaria.',
  },
  {
    title: 'Servidores, dominios y herramientas',
    body: 'Hosting, dominio, correo, mapas y el resto de la infraestructura para que KADESH esté en línea. Cada donación ayuda a pagar esas cuentas, no a un albergue ajeno al proyecto.',
  },
  {
    title: 'Difusión',
    body: 'Para que un reporte perdido, una adopción o el directorio lleguen a más personas en México. La difusión es parte de la misión: una ficha que nadie ve no reúne a nadie.',
  },
  {
    title: 'Apoyo a casos urgentes',
    body: 'Cuando un rescate necesita ayuda ya —alimento, consulta o traslado— una parte de lo recaudado puede destinarse a ese caso. No prometemos un monto fijo por donación; sí que ese apoyo existe como destino.',
  },
] as const;

export const DONATIONS_FAQS = [
  {
    question: '¿A qué se destina una donación a KADESH?',
    answer: DONATIONS_LEAD,
  },
  {
    question: '¿Las donaciones van a un albergue o a un animal en concreto?',
    answer:
      'Van a KADESH como proyecto: operación, difusión y, cuando aplica, apoyo a un caso urgente. No son un pago a un refugio nombrado ni un padrón de un animal, salvo que en un caso puntual lo indiquemos así. El recuento de destinos está en esta página.',
  },
  {
    question: '¿Hay que donar para reportar o buscar animales?',
    answer:
      'No. Reportar, consultar el directorio y leer el blog forman parte de la plataforma pública. La donación es voluntaria y no desbloquea funciones comunitarias.',
  },
  {
    question: '¿Puedo apoyar sin donar dinero?',
    answer:
      'Sí. Marcas y tiendas de mascotas pueden aportar en especie: alimento, consulta, espacio o difusión. Quien quiera acompañar a largo plazo puede sumarse como fundador. En ambos casos, escríbenos desde Contacto con el asunto Patrocinio o Fundador.',
  },
  {
    question: '¿Cuándo veré un recuento en pesos?',
    answer:
      'Hoy publicamos a qué se destina cada aportación, no un estado financiero. No inventamos cifras. Cuando cerremos un periodo con números verificables, los pondremos en esta misma página.',
  },
] as const;

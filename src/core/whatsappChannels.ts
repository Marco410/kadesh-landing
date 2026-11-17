/**
 * Canales de WhatsApp de Kadesh Pet. La API oficial no publica en Canales: un admin copia el post
 * desde Operaciones («Copiar para el canal») y lo pega en el canal.
 *
 * Hoy hay un solo canal para todo el país. Cuando un estado tenga movimiento propio, se abre su
 * canal y se agrega aquí con la clave del estado (`slug` de `kadesh-back/utils/geo/mexicoStates.ts`,
 * p. ej. `michoacan`): `/canal?estado=michoacan` y los carteles de ese estado apuntarán a él; el
 * resto sigue en el general. No hace falta tocar nada más.
 *
 * Fuera de este archivo, usa siempre `/canal` (`Routes.channel`) y no el enlace de WhatsApp, para
 * poder cambiar o separar canales sin reimprimir carteles ni reenviar correos.
 */
export const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb97b8OKgsO1eJlyua1Q';

export const WHATSAPP_CHANNELS_BY_STATE: Record<string, string> = {};

/** «Michoacán de Ocampo» → «michoacan-de-ocampo»: misma forma que los `slug` del back. */
export function stateSlug(state: string | null | undefined): string {
  return (state ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Canal que le toca a un estado (por nombre o slug), o el general. */
export function whatsappChannelFor(state?: string | null): string {
  const slug = stateSlug(state);
  return (slug && WHATSAPP_CHANNELS_BY_STATE[slug]) || WHATSAPP_CHANNEL_URL;
}

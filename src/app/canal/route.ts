import { NextResponse, type NextRequest } from 'next/server';
import { whatsappChannelFor } from 'kadesh/core/whatsappChannels';

/**
 * `pet.kadesh.com.mx/canal`: redirige al canal de WhatsApp de Kadesh Pet. Lo usan el cartel, el
 * correo de «Tu reporte ya está publicado», la portada y Operaciones. `?estado=michoacan` lleva al
 * canal de ese estado si existe (ver `whatsappChannels.ts`); si no, al general.
 *
 * 302 y no 308: a dónde lleva puede cambiar (un canal nuevo por estado).
 */
export function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get('estado');
  return NextResponse.redirect(whatsappChannelFor(state), 302);
}

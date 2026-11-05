import { NextResponse } from 'next/server';
import { Routes } from 'kadesh/core/routes';
import { SITE_URL } from 'kadesh/core/site';
import { eventPlaceText, toCalendarStamp, upcomingSessions } from 'kadesh/components/events/format';
import { fetchPublicEventBySlug } from 'kadesh/components/events/server';

/** Texto para iCalendar: escapa comas, punto y coma, diagonales y saltos de línea. */
function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Líneas de máximo 75 octetos (RFC 5545), continuando con un espacio. */
function fold(line: string): string {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    chunks.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  chunks.push(rest);
  return chunks.join('\r\n');
}

/**
 * `/eventos/<slug>/calendario`: archivo .ics con las próximas fechas del evento, para Apple
 * Calendar, Outlook o cualquier calendario. Las horas van en UTC.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchPublicEventBySlug(slug);
  if (!event) {
    return NextResponse.redirect(`${SITE_URL}${Routes.events.index}`, { status: 302 });
  }

  const url = `${SITE_URL}${Routes.events.detail(slug)}`;
  const sessions = upcomingSessions(event.sessions ?? []);
  const location = [eventPlaceText(event), event.address, event.city, event.state].filter(Boolean).join(', ');
  const stamp = toCalendarStamp(new Date().toISOString());
  const description = `${event.description.slice(0, 800)}\n\n${url}`;
  const status = event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KADESH//Kadesh Pet//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...sessions.flatMap((session) => [
      'BEGIN:VEVENT',
      `UID:${session.id}@pet.kadesh.com.mx`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toCalendarStamp(session.startsAt)}`,
      `DTEND:${toCalendarStamp(session.endsAt)}`,
      `SUMMARY:${icsText(event.title)}`,
      `DESCRIPTION:${icsText(description)}`,
      `LOCATION:${icsText(location)}`,
      `GEO:${event.lat};${event.lng}`,
      `URL:${url}`,
      `STATUS:${status}`,
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ];

  return new NextResponse(lines.map(fold).join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}

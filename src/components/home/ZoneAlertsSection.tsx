import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  Location01Icon,
  Notification03Icon,
  VolumeOffIcon,
} from '@hugeicons/core-free-icons';
import { ZONE_ALERTS_ANSWER, ZONE_ALERTS_FACTS } from 'kadesh/components/home/constants';
import ZoneAlertsCta from 'kadesh/components/home/ZoneAlertsCta';
import ZoneAlertsFeed from 'kadesh/components/home/ZoneAlertsFeed';
import type { ZoneAlert } from 'kadesh/components/home/zoneAlerts';

const FACT_ICONS = {
  zone: Location01Icon,
  now: Clock01Icon,
  quiet: VolumeOffIcon,
} as const;

/**
 * «Alertas de zona» en la portada. Componente de servidor: el texto y las alertas iniciales llegan
 * en el HTML (SEO y GEO); solo la lista y el botón se hidratan.
 */
export default function ZoneAlertsSection({ alerts }: { alerts: ZoneAlert[] }) {
  return (
    <section
      id="alertas"
      aria-labelledby="alertas-heading"
      className="w-full scroll-mt-20 bg-kadesh-50 py-24 dark:bg-kadesh/10"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16 lg:px-8">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-kadesh-700 dark:bg-white/10 dark:text-kadesh-300">
            <HugeiconsIcon icon={Notification03Icon} size={16} strokeWidth={1.8} aria-hidden="true" />
            Alertas de zona
          </p>
          <h2
            id="alertas-heading"
            className="mb-5 text-4xl font-black tracking-[-0.03em] text-[#121212] dark:text-white sm:text-5xl"
          >
            Entérate si se pierde o aparece una mascota cerca de ti
          </h2>
          <p className="text-lg leading-relaxed text-[#3a3a3a] dark:text-[#d0d0d0] sm:text-xl">
            {ZONE_ALERTS_ANSWER}
          </p>

          <ul className="mt-8 space-y-5">
            {ZONE_ALERTS_FACTS.map((fact) => (
              <li key={fact.id} className="flex items-start gap-4">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-kadesh dark:bg-white/10 dark:text-kadesh-300">
                  <HugeiconsIcon icon={FACT_ICONS[fact.id]} size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <p className="text-[#3a3a3a] dark:text-[#d0d0d0]">
                  <strong className="block font-bold text-[#121212] dark:text-white">{fact.title}</strong>
                  {fact.text}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ZoneAlertsCta />
          </div>
          <p className="mt-4 max-w-xl text-sm text-[#5a5a5a] dark:text-[#b0b0b0]">
            ¿Se perdió la tuya? Actívalas también: si alguien reporta un animal encontrado en tu zona,
            te enteras al momento.
          </p>
        </div>

        <ZoneAlertsFeed initialAlerts={alerts} />
      </div>
    </section>
  );
}

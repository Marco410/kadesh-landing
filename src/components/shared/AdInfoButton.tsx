"use client";

import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  HelpCircleIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { kadeshWhatsAppUrl } from "kadesh/utils/kadeshWhatsApp";

const PRIVACY_URL = "https://kadesh.com.mx/privacidad";
const GOOGLE_ADS_SETTINGS_URL = "https://adssettings.google.com";

function advertiseMessage() {
  const page = typeof window !== "undefined" ? window.location.href : "";
  return `Hola, me gustaría que mi negocio aparezca como publicidad en KADESH Pet. ¿Me pueden dar información?${page ? `\nLo vi en: ${page}` : ""}`;
}

const linkClass = "font-semibold text-kadesh underline-offset-2 hover:underline";

/** Botón "?" junto a la etiqueta Publicidad: explica por qué hay anuncios y cómo anunciarse. */
export default function AdInfoButton() {
  // <dialog> nativo con showModal(): Esc, foco, fondo inerte y backdrop los da el navegador.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="¿Por qué ves publicidad?"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#9aa3b2] transition-colors hover:bg-[#f3f5f8] hover:text-kadesh focus-visible:outline focus-visible:outline-2 focus-visible:outline-kadesh dark:hover:bg-white/10"
      >
        <HugeiconsIcon icon={HelpCircleIcon} size={14} strokeWidth={2} />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="ad-info-title"
        // Clic fuera del panel (sobre el backdrop) cierra.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-[#ececec] bg-white p-0 text-left shadow-2xl backdrop:bg-black/50 dark:border-white/10 dark:bg-night-raised"
      >
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2
              id="ad-info-title"
              className="text-xl font-black tracking-[-0.02em] text-[#121212] dark:text-white"
            >
              ¿Por qué ves publicidad?
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="-mr-2 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#5a5a5a] transition-colors hover:bg-[#f3f5f8] dark:text-[#9aa3b2] dark:hover:bg-white/10"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-[#3a3a3a] dark:text-[#c5ccd8]">
            <p>
              KADESH Pet es gratis: reportar un animal perdido, buscar
              veterinarias cercanas y ayudar a que una mascota regrese a casa no
              te cuesta nada.
            </p>
            <p>
              Mantener la plataforma sí tiene costos: servidores, base de datos,
              mapas, almacenamiento de fotos y los avisos que enviamos. Mostramos
              publicidad para ayudar a cubrir una parte de ese mantenimiento y de
              la infraestructura, y así seguir siendo gratis para todos.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Son pocos anuncios, siempre marcados como &quot;Publicidad&quot; y
                separados de la información del animal o la veterinaria.
              </li>
            </ul>

            <div className="mt-1 rounded-xl bg-[#f7f8fa] p-4 dark:bg-night">
              <p className="font-bold text-[#121212] dark:text-white">
                ¿Te gustaría que tu negocio aparezca aquí?
              </p>
              <p className="mt-1">
                Si tienes una veterinaria, una tienda de mascotas u otro negocio,
                podemos mostrarlo en este espacio.
              </p>
              <a
                href={kadeshWhatsAppUrl(advertiseMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#1ebe5a]"
              >
                <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.75} />
                Envíanos un mensaje
              </a>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import {
  KADESH_HELP_PROMPTS,
  kadeshWhatsAppUrl,
} from "kadesh/utils/kadeshWhatsApp";

export default function KadeshHelpWhatsApp() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openMessage = (body: string) => {
    window.open(kadeshWhatsAppUrl(body), "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const pageUrl = typeof window === "undefined" ? "" : window.location.href;

  return (
    <div
      ref={rootRef}
      className="fixed right-4 bottom-4 z-40 flex flex-col items-end sm:right-6 sm:bottom-6"
    >
      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          className="mb-3 w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-[#ececec] bg-white p-4 shadow-[0_16px_40px_rgba(15,35,80,0.16)] dark:border-white/10 dark:bg-night-raised"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id={titleId}
                className="text-sm font-bold text-[#121212] dark:text-white"
              >
                Ayuda de KADESH
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#5a5a5a] dark:text-[#b0b0b0]">
                Dudas, errores o cómo usar la plataforma. Elige un mensaje y lo
                abrimos en WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#5a5a5a] hover:bg-[#f3f5f8] dark:text-[#b0b0b0] dark:hover:bg-white/10"
              aria-label="Cerrar ayuda"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={1.5} />
            </button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {KADESH_HELP_PROMPTS.map((prompt) => (
              <li key={prompt.id}>
                <button
                  type="button"
                  onClick={() => openMessage(prompt.body(pageUrl))}
                  className="flex min-h-11 w-full items-center rounded-xl bg-[#f3f5f8] px-3 text-left text-sm font-medium text-[#121212] hover:bg-kadesh-50 dark:bg-night dark:text-white dark:hover:bg-kadesh/20"
                >
                  {prompt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-kadesh text-white shadow-[0_10px_28px_rgba(15,35,80,0.28)] transition-transform hover:bg-kadesh-600 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
        aria-label={
          open ? "Cerrar ayuda de KADESH" : "Ayuda de KADESH por WhatsApp"
        }
      >
        <HugeiconsIcon icon={WhatsappIcon} size={26} strokeWidth={1.5} />
      </button>
    </div>
  );
}

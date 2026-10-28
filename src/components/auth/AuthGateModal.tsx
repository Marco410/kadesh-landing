"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  EyeIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { useUiMotion } from "kadesh/components/shared/motion";
import { useLogin, useRegister } from "kadesh/components/auth/hooks";
import GoogleAuthSection from "kadesh/components/auth/GoogleAuthSection";

type AuthTab = "register" | "login";

export interface AuthGateCopy {
  title: string;
  /** Por qué pedimos cuenta, en una o dos frases. */
  description: string;
  /** Qué gana la persona con la cuenta (3 renglones cortos). */
  reasons: string[];
  /** Color del punto junto al título (p. ej. el del estado del reporte). */
  accentColor?: string;
}

interface AuthGateModalProps extends AuthGateCopy {
  isOpen: boolean;
  onClose: () => void;
  /** A dónde va después de crear la cuenta o entrar. */
  redirectTo: string;
  initialTab?: AuthTab;
}

const INPUT_CLASS =
  "w-full min-h-11 rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]";
const LABEL_CLASS = "mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]";

/**
 * Pide cuenta sin sacar a la persona de donde está: explica por qué, deja crear la cuenta o
 * entrar ahí mismo y luego la manda a `redirectTo`. Usa los mismos hooks que /auth/login.
 */
export default function AuthGateModal({
  isOpen,
  onClose,
  redirectTo,
  initialTab = "register",
  title,
  description,
  reasons,
  accentColor,
}: AuthGateModalProps) {
  const motionPrefs = useUiMotion();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  const register = useRegister({
    redirectTo,
    onAutoLoginFailed: () => {
      setTab("login");
      setNotice("Cuenta creada. Inicia sesión con tu correo y contraseña.");
    },
  });
  const login = useLogin({ redirectTo });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    setTab(initialTab);
    setShowPassword(false);
    setNotice("");
    register.setError("");
    login.setError("");
    // Solo al abrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const busy = register.loading || login.loading;
  const error = tab === "register" ? register.error : login.error;

  const handleRegister = (event: FormEvent) => {
    register.handleSubmit(event);
  };

  const handleLogin = (event: FormEvent) => {
    login.handleSubmit(event);
  };

  const switchTab = (next: AuthTab) => {
    setTab(next);
    setNotice("");
    setShowPassword(false);
    // El correo que ya escribió pasa a la otra pestaña.
    if (next === "login" && register.email && !login.email) login.setEmail(register.email);
    if (next === "register" && login.email && !register.email) register.setEmail(login.email);
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-[#f3f5f8] dark:text-[#9aa3b2] dark:hover:bg-white/10"
    >
      <HugeiconsIcon icon={showPassword ? ViewOffIcon : EyeIcon} size={18} strokeWidth={1.6} />
    </button>
  );

  // Portal a <body>: los enlaces que lo abren viven dentro de secciones con `transform` (GSAP,
  // pulso del chip) y ahí `position: fixed` se encierra en la sección en vez de cubrir la pantalla.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 text-left sm:items-center sm:p-4"
          onClick={busy ? undefined : onClose}
          variants={motionPrefs.overlay}
          initial={motionPrefs.overlay ? "hidden" : false}
          animate="show"
          exit="exit"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-gate-title"
            className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-[#ececec] bg-white shadow-[0_16px_40px_rgba(15,35,80,0.18)] sm:rounded-2xl dark:border-white/10 dark:bg-night-raised"
            onClick={(event) => event.stopPropagation()}
            variants={motionPrefs.sheet}
            initial={motionPrefs.sheet ? "hidden" : false}
            animate="show"
            exit="exit"
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div className="min-w-0">
                <h2
                  id="auth-gate-title"
                  className="flex items-start gap-2 break-words text-xl font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]"
                >
                  {accentColor ? (
                    <span
                      className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accentColor }}
                      aria-hidden
                    />
                  ) : null}
                  {title}
                </h2>
                <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#5a5a5a] hover:bg-[#f7f8fa] disabled:opacity-50 dark:text-[#9aa3b2] dark:hover:bg-night"
                aria-label="Cerrar"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
              <ul className="space-y-2 rounded-xl bg-kadesh-50 p-3 dark:bg-kadesh/15">
                {reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2 text-sm text-[#121212] dark:text-[#eef1f6]">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={18}
                      strokeWidth={1.8}
                      className="mt-px shrink-0 text-kadesh dark:text-kadesh-300"
                      aria-hidden
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>

              {/* Google primero: un toque crea la cuenta o entra, sin escribir nada. */}
              <div className="mt-5">
                <GoogleAuthSection
                  redirectTo={redirectTo}
                  dividerLabel="o con tu correo"
                  dividerPosition="after"
                  surfaceClassName="bg-white dark:bg-night-raised"
                />
              </div>

              <div
                role="tablist"
                aria-label="Cuenta"
                className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-[#f3f5f8] p-1 dark:bg-night"
              >
                {(
                  [
                    ["register", "Crear cuenta"],
                    ["login", "Ya tengo cuenta"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => switchTab(key)}
                    className={`min-h-11 rounded-lg text-sm font-semibold transition-colors ${
                      tab === key
                        ? "bg-white text-[#121212] shadow-sm dark:bg-night-raised dark:text-[#eef1f6]"
                        : "text-[#5a5a5a] hover:text-[#121212] dark:text-[#9aa3b2] dark:hover:text-[#eef1f6]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {notice ? (
                <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                >
                  {error}
                </p>
              ) : null}

              {tab === "register" ? (
                <form onSubmit={handleRegister} noValidate className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="gate-name" className={LABEL_CLASS}>
                        Nombre
                      </label>
                      <input
                        id="gate-name"
                        value={register.name}
                        onChange={(event) => register.setName(event.target.value)}
                        className={INPUT_CLASS}
                        autoComplete="given-name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="gate-last-name" className={LABEL_CLASS}>
                        Apellido
                      </label>
                      <input
                        id="gate-last-name"
                        value={register.lastName}
                        onChange={(event) => register.setLastName(event.target.value)}
                        className={INPUT_CLASS}
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="gate-email" className={LABEL_CLASS}>
                      Correo
                    </label>
                    <input
                      id="gate-email"
                      type="email"
                      inputMode="email"
                      value={register.email}
                      onChange={(event) => register.setEmail(event.target.value)}
                      className={INPUT_CLASS}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gate-password" className={LABEL_CLASS}>
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="gate-password"
                        type={showPassword ? "text" : "password"}
                        value={register.password}
                        onChange={(event) => {
                          // Un solo campo con "mostrar": la confirmación sigue al mismo valor.
                          register.setPassword(event.target.value);
                          register.setConfirmPassword(event.target.value);
                        }}
                        className={`${INPUT_CLASS} pr-12`}
                        autoComplete="new-password"
                        required
                      />
                      {passwordToggle}
                    </div>
                    <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">Mínimo 8 caracteres.</p>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={busy}
                    whileTap={busy ? undefined : motionPrefs.tap}
                    className="mt-1 min-h-12 w-full rounded-xl bg-kadesh px-4 text-sm font-bold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {register.loading ? "Creando tu cuenta…" : "Crear cuenta y continuar"}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleLogin} noValidate className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="gate-login-email" className={LABEL_CLASS}>
                      Correo
                    </label>
                    <input
                      id="gate-login-email"
                      type="email"
                      inputMode="email"
                      value={login.email}
                      onChange={(event) => login.setEmail(event.target.value)}
                      className={INPUT_CLASS}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gate-login-password" className={LABEL_CLASS}>
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="gate-login-password"
                        type={showPassword ? "text" : "password"}
                        value={login.password}
                        onChange={(event) => login.setPassword(event.target.value)}
                        className={`${INPUT_CLASS} pr-12`}
                        autoComplete="current-password"
                        required
                      />
                      {passwordToggle}
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    disabled={busy}
                    whileTap={busy ? undefined : motionPrefs.tap}
                    className="mt-1 min-h-12 w-full rounded-xl bg-kadesh px-4 text-sm font-bold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {login.loading ? "Entrando…" : "Entrar y continuar"}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

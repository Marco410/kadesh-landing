"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "../shared/Logo";
import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { useLogout } from "kadesh/components/auth/hooks";
// Directo (no el barrel): el barrel de notificaciones importa el layout y haría un ciclo.
import NotificationBell from "kadesh/components/notifications/NotificationBell";
import { STORE_NAV_ENABLED } from "kadesh/components/store/constants";
import CartLink from "kadesh/components/store/cart/CartLink";
import { useUnreadNotifications } from "kadesh/components/notifications/hooks";
import FontSizeSlider from "./FontSizeSlider";
// By file, not the donations barrel: that barrel re-exports DonationsPage, which renders this header.
import DonateTrigger from "kadesh/components/donations/DonateTrigger";
import { DONATION_CTA_LABEL } from "kadesh/components/donations/constants";
import DonationIcon from "kadesh/components/shared/icons/DonationIcon";
import ThemeToggle from "./ThemeToggle";
import { useBodyScrollLock } from "kadesh/utils/useBodyScrollLock";

const PRIMARY_NAV = [
  { label: "Inicio", href: Routes.home },
  { label: "Veterinarias", href: Routes.veterinaries.index },
  { label: "Animales", href: Routes.animals.index },
  { label: "Eventos", href: Routes.events.index },
  // Only once the store is open (NEXT_PUBLIC_STORE_ENABLED); closed, `/tienda` is a 404.
  ...(STORE_NAV_ENABLED ? [{ label: "Tienda", href: Routes.store.index }] : []),
  { label: "Ranking", href: Routes.ranking },
  { label: "Blog", href: Routes.blog.index },
  { label: "Conócenos", href: Routes.conocenos },
  { label: "Contacto", href: Routes.contact },
] as const;

/**
 * `overDarkHero`: la página arranca con un hero oscuro (la home) y la barra va en blanco desde el
 * primer render. Se pasa explícito porque `usePathname()` no es confiable cuando Vercel regenera
 * la home en segundo plano (ISR): el servidor la pintaba como página clara (logo invertido,
 * enlaces grises) y React no corrige esas clases al hidratar.
 */
export default function Navigation({ overDarkHero = false }: { overDarkHero?: boolean } = {}) {
  const [opened, setOpened] = useState(false);
  // The open mobile menu keeps the page behind it still.
  useBodyScrollLock(opened);
  // Focus goes into the menu when it opens (the burger stays under it) and back to the burger when
  // it closes, without scrolling the page to the fixed header.
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const wasOpened = useRef(false);
  useEffect(() => {
    if (opened) {
      wasOpened.current = true;
      const timer = window.setTimeout(() => menuCloseRef.current?.focus({ preventScroll: true }), 50);
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpened(false);
          return;
        }
        // Tab stays inside the open menu: past the last control it goes back to the first.
        if (event.key !== "Tab") return;
        const menu = document.getElementById("menu-movil");
        if (!menu) return;
        const focusable = Array.from(
          menu.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((element) => element.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!active || !menu.contains(active)) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      };
      document.addEventListener("keydown", onKey);
      return () => {
        window.clearTimeout(timer);
        document.removeEventListener("keydown", onKey);
      };
    }
    if (wasOpened.current) {
      wasOpened.current = false;
      burgerRef.current?.focus({ preventScroll: true });
    }
  }, [opened]);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const logout = useLogout();
  const unreadCount = useUnreadNotifications({ skip: !user?.id });
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    // Si estamos en la página principal y hay un anchor en la URL, hacer scroll a esa sección
    if (pathname === Routes.home && window.location.hash) {
      const hash = window.location.hash;
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarDropdownRef.current &&
        !avatarDropdownRef.current.contains(event.target as Node)
      ) {
        setAvatarDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToHomeTop = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href !== Routes.home) return;
    if (pathname !== Routes.home) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", Routes.home);
  };

  const handleLogout = async () => {
    setAvatarDropdownOpen(false);
    await logout();
  };

  const isDark = mounted && resolvedTheme === "dark";
  const isHomePage = overDarkHero || pathname === Routes.home;
  const atTopLight = !scrolled && !isDark && !isHomePage;
  const navLinkClass = atTopLight
    ? "text-gray-800 hover:text-orange-600 transition-colors duration-200"
    : "text-white hover:text-orange-100 transition-colors duration-200";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 w-full px-6 sm:px-10 py-4 flex items-center justify-between z-50 transition-all duration-300 ${
          scrolled
            ? "bg-kadesh/80 dark:bg-night/80 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <Link href={Routes.home} className="flex items-center">
          <Logo size={48} className={atTopLight ? "invert" : ""} />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => goToHomeTop(e, item.href)}
              className={`font-semibold text-sm ${navLinkClass}`}
            >
              {item.label}
            </Link>
          ))}

          {user?.id ? (
            <Link
              href={Routes.profile}
              className={`font-semibold text-sm ${navLinkClass}`}
            >
              Mi perfil
            </Link>
          ) : null}

          {STORE_NAV_ENABLED ? <CartLink className={navLinkClass} /> : null}

          {/* «Dame una patita»: visible but quiet, an outlined pill (never a popup). */}
          <DonateTrigger
            source="header"
            ariaLabel={DONATION_CTA_LABEL}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm font-semibold transition-colors duration-200 xl:px-3 ${
              atTopLight
                ? "border-kadesh/30 text-kadesh hover:bg-kadesh/10"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            <DonationIcon size={16} />
            {/* Between lg and xl the menu is tight: only the paw (the name stays in aria-label). */}
            <span className="hidden xl:inline">{DONATION_CTA_LABEL}</span>
          </DonateTrigger>

          <FontSizeSlider tone={atTopLight ? "onLight" : "onDark"} />

          <ThemeToggle
            className={`p-2 rounded-lg transition-colors duration-200 ${atTopLight ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
          />

          {user?.id ? (
            <NotificationBell
              variant="panel"
              tone={atTopLight ? "onLight" : "onDark"}
              count={unreadCount}
            />
          ) : null}

          {/* User Avatar or Login Button */}
          {user?.id ? (
            <div className="relative" ref={avatarDropdownRef}>
              <button
                onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors overflow-hidden ${atTopLight ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-white/10 hover:bg-white/20 text-white"}`}
              >
                {user.profileImage?.url ? (
                  <Image
                    src={user.profileImage.url}
                    alt={user.name || "Usuario"}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <span
                    className={`font-semibold text-sm ${atTopLight ? "text-gray-800" : "text-white"}`}
                  >
                    {user.name?.charAt(0) || "U"}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {avatarDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-lg py-2 min-w-[180px] z-50"
                  >
                    <Link
                      href={Routes.profile}
                      onClick={() => setAvatarDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#212121] dark:text-[#ffffff] hover:bg-orange-500/10 dark:hover:bg-white/10 transition-colors"
                    >
                      Mi perfil
                    </Link>
                    <Link
                      href={`${Routes.profile}?tab=appointments`}
                      onClick={() => setAvatarDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-[#212121] dark:text-[#ffffff] hover:bg-orange-500/10 dark:hover:bg-white/10 transition-colors"
                    >
                      Mis citas
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[#212121] dark:text-[#ffffff] hover:bg-orange-500/10 dark:hover:bg-white/10 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href={Routes.auth.login}
              className={`px-4 py-2 font-semibold text-sm rounded-lg transition-colors duration-200 ${
                atTopLight
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              Iniciar sesión
            </Link>
          )}
        </div>

        {user?.id || STORE_NAV_ENABLED ? (
          <div className="ml-auto mr-3 flex items-center gap-1 lg:hidden">
            {STORE_NAV_ENABLED ? <CartLink className={navLinkClass} /> : null}
            {user?.id ? (
              <NotificationBell
                variant="link"
                tone={atTopLight ? "onLight" : "onDark"}
                count={unreadCount}
              />
            ) : null}
          </div>
        ) : null}

        {/* Mobile Burger Menu */}
        <button
          ref={burgerRef}
          type="button"
          onClick={() => setOpened(!opened)}
          aria-expanded={opened}
          aria-controls="menu-movil"
          className={`lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 z-50 ${
            atTopLight
              ? "text-gray-800"
              : scrolled
                ? "text-gray-700 dark:text-gray-300"
                : "text-white"
          }`}
          aria-label={opened ? "Cerrar menú" : "Abrir menú"}
        >
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              atTopLight
                ? "bg-gray-800"
                : scrolled
                  ? "bg-gray-700 dark:bg-gray-300"
                  : "bg-white"
            }`}
            animate={opened ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              atTopLight
                ? "bg-gray-800"
                : scrolled
                  ? "bg-gray-700 dark:bg-gray-300"
                  : "bg-white"
            }`}
            animate={opened ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className={`w-6 h-0.5 rounded transition-all ${
              atTopLight
                ? "bg-gray-800"
                : scrolled
                  ? "bg-gray-700 dark:bg-gray-300"
                  : "bg-white"
            }`}
            animate={opened ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {opened && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setOpened(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              id="menu-movil"
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
              className="fixed top-0 right-0 h-full w-90 bg-kadesh dark:bg-night-raised z-50 lg:hidden overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-white dark:text-white text-2xl font-bold">
                    KADESH
                  </h2>
                  <div className="flex items-center gap-4">
                    <FontSizeSlider tone="onDark" />
                    <ThemeToggle
                      className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                      iconClassName="w-6 h-6"
                    />
                    <button
                      ref={menuCloseRef}
                      type="button"
                      onClick={() => setOpened(false)}
                      aria-label="Cerrar menú"
                      className="text-white text-2xl font-bold"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {PRIMARY_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        goToHomeTop(e, item.href);
                        setOpened(false);
                      }}
                      className="text-white font-semibold text-lg no-underline opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {user?.id ? (
                    <Link
                      href={Routes.profile}
                      onClick={() => setOpened(false)}
                      className="text-white font-semibold text-lg no-underline opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                    >
                      Mi perfil
                    </Link>
                  ) : null}

                  <DonateTrigger
                    source="header"
                    onClick={() => setOpened(false)}
                    className="flex items-center gap-2 text-left text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl border border-white/30 hover:bg-white/10 transition-all"
                  >
                    <DonationIcon size={20} />
                    {DONATION_CTA_LABEL}
                  </DonateTrigger>

                  {/* User Avatar or Login Button Mobile */}
                  {user?.id ? (
                    <div className="pt-4 border-t border-white/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                          {user.profileImage?.url ? (
                            <Image
                              src={user.profileImage.url}
                              alt={user.name || "Usuario"}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold text-lg">
                              {user.name?.charAt(0) || "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {user.name || "Usuario"}
                          </p>
                          <p className="text-white/70 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <Link
                        href={Routes.profile}
                        onClick={() => setOpened(false)}
                        className="block text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all mb-2"
                      >
                        Mi perfil
                      </Link>
                      <Link
                        href={`${Routes.profile}?tab=appointments`}
                        onClick={() => setOpened(false)}
                        className="block text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all mb-2"
                      >
                        Mis citas
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setOpened(false);
                        }}
                        className="w-full text-left text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={Routes.auth.login}
                      onClick={() => setOpened(false)}
                      className="text-white font-semibold text-lg opacity-92 hover:opacity-100 py-4 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-center"
                    >
                      Iniciar sesión
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

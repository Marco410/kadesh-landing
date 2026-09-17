"use client";

export const PROFILE_TABS = [
  { key: "profile", label: "Datos" },
  { key: "posts", label: "Publicaciones" },
  { key: "animals", label: "Reportes" },
  { key: "appointments", label: "Citas" },
  { key: "clinics", label: "Clínicas" },
] as const;

export type ProfileTabKey = (typeof PROFILE_TABS)[number]["key"];

export function isProfileTabKey(value: string | null): value is ProfileTabKey {
  return PROFILE_TABS.some((tab) => tab.key === value);
}

export default function ProfileTabs({
  value,
  onChange,
}: {
  value: ProfileTabKey;
  onChange: (key: ProfileTabKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Secciones del perfil"
      className="flex flex-wrap gap-2"
      onKeyDown={(event) => {
        const index = PROFILE_TABS.findIndex((tab) => tab.key === value);
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          onChange(PROFILE_TABS[(index + 1) % PROFILE_TABS.length].key);
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          onChange(
            PROFILE_TABS[(index - 1 + PROFILE_TABS.length) % PROFILE_TABS.length]
              .key,
          );
        }
      }}
    >
      {PROFILE_TABS.map((tab) => {
        const selected = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`perfil-tab-${tab.key}`}
            aria-controls={`perfil-panel-${tab.key}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh ${
              selected
                ? "bg-kadesh text-white shadow-[0_8px_18px_rgba(15,35,80,0.18)]"
                : "bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

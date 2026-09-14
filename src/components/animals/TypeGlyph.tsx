import type { ReactNode } from 'react';

const GLYPH_CLASS = 'h-4 w-4 shrink-0';

function Glyph({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || GLYPH_CLASS}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function typeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function TypeGlyph({ type, className }: { type: string; className?: string }) {
  switch (typeKey(type)) {
    case 'dog':
    case 'perro':
      return (
        <Glyph className={className}>
          <path d="M5 14.5c0 3 2.2 5.5 7 5.5s7-2.5 7-5.5c0-2.4-1.5-3.6-3-4.2 1.4-.6 2.8-2.2 3.2-4.3-.8.3-1.8.4-2.7.2-.4-1.4-1.4-2.7-3.5-2.7S10.1 5.3 9.7 6.7c-.9.2-1.9.1-2.7-.2.4 2.1 1.8 3.7 3.2 4.3-1.5.6-3 1.8-3 4.2Z" />
          <path d="M10 16.5h.01M14 16.5h.01" />
        </Glyph>
      );
    case 'cat':
    case 'gato':
      return (
        <Glyph className={className}>
          <path d="M5 10.5 7.5 4l3 4h3l3-4 2.5 6.5c.4 2.2-.6 6.5-6 6.5s-6.4-4.3-6-6.5Z" />
          <path d="M9.5 13.5h.01M14.5 13.5h.01M10.5 16c.8.6 2.2.6 3 0" />
        </Glyph>
      );
    case 'bird':
    case 'ave':
      return (
        <Glyph className={className}>
          <path d="M4 14s2.5-1 5-1c1.2-3.5 4-6 8.5-6.5-1 2-1 4 .2 6.2 2 .4 4.3 1.4 6.3 3.3-2.2.2-4.4-.3-6.2-1.3-1.6 1.8-4 3.3-7.3 3.3-3 0-5.2-1.4-6.5-4Z" />
          <path d="M9.2 12.2h.01" />
        </Glyph>
      );
    case 'fish':
    case 'pez':
      return (
        <Glyph className={className}>
          <path d="M3 12s2.5-6 9-6c5 0 7.5 3 9 6-1.5 3-4 6-9 6-6.5 0-9-6-9-6Z" />
          <path d="M21 12h-3.5M8.5 12h.01" />
        </Glyph>
      );
    case 'reptil':
    case 'reptile':
      return (
        <Glyph className={className}>
          <path d="M3 13.5c2-3 4.2-3.2 6-.4 1.5 2.2 3.2 2.2 4.6 0 1.7-2.6 4-2.5 6.4.2" />
          <path d="M17.5 13.2c1.2.2 2.4 1 3.5 2.6M7.2 13.4 6 16.5M12.2 13.2 12 16.8M4.4 12.4 3.2 9.8" />
        </Glyph>
      );
    case 'mammal':
    case 'mamifero':
      return (
        <Glyph className={className}>
          <path d="M8 18.5c-2.2 0-4-1.7-4-4.2 0-3.4 2.4-5.4 5.6-6.3C10.2 6.2 11.4 5 13 5c1.2 0 2.2.7 2.7 1.7 2.6.6 4.3 2.6 4.3 5.4 0 3.2-2.2 5.4-5.2 5.4H8Z" />
          <path d="M10.2 12.8h.01M14.6 12.8h.01" />
        </Glyph>
      );
    default:
      return (
        <Glyph className={className}>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M12 8.5v4l2.5 1.5" />
        </Glyph>
      );
  }
}

export const DIRECTORY_TYPE_PRIMARY = ['dog', 'perro', 'cat', 'gato'] as const;

export function isPrimaryDirectoryType(name: string): boolean {
  return (DIRECTORY_TYPE_PRIMARY as readonly string[]).includes(typeKey(name));
}

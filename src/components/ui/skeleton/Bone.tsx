import type { CSSProperties } from 'react';
import { cn } from 'kadesh/utils/cn';

export type BoneKind = 'line' | 'title' | 'figure' | 'box' | 'circle';

const TEXT_HEIGHT: Partial<Record<BoneKind, number>> = {
  line: 12,
  title: 20,
  figure: 28,
};

type Size = number | string;

interface BoneProps {
  kind?: BoneKind;
  width?: Size;
  height?: Size;
  /** Radio en px. Por defecto: píldora en texto y círculo, 12 en cajas. */
  radius?: Size;
  /**
   * Alto de la línea de texto que ocupará (p. ej. 20 para `text-sm`). La píldora se centra
   * en ese alto para que nada se mueva cuando llega el texto real.
   */
  slot?: Size;
  className?: string;
  style?: CSSProperties;
}

/** Una pieza del esqueleto: color de hueso y brillo (o latido con reduce-motion). Solo CSS. */
export function Bone({ kind = 'line', width, height, radius, slot, className, style }: BoneProps) {
  const textHeight = TEXT_HEIGHT[kind];
  const isCircle = kind === 'circle';
  const resolvedHeight = height ?? textHeight ?? (isCircle ? width : undefined);
  const resolvedRadius = radius ?? (textHeight || isCircle ? 9999 : 12);

  const bone = (
    <span
      aria-hidden="true"
      className={cn('kadesh-bone shrink-0', slot == null && className)}
      style={{
        width: width ?? '100%',
        height: resolvedHeight,
        borderRadius: resolvedRadius,
        ...(slot == null ? style : undefined),
      }}
    />
  );

  if (slot == null) return bone;

  return (
    <span
      aria-hidden="true"
      className={cn('flex items-center', className)}
      style={{ height: slot, width: width ?? '100%', ...style }}
    >
      {bone}
    </span>
  );
}

/** Anchos de línea que varían de una fila a otra para que el esqueleto no se vea clonado. */
export function boneWidth(widths: readonly string[], index: number): string {
  return widths[index % widths.length];
}

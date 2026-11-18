import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'kadesh/utils/cn';
import { PAW_LEVELS } from './constants';
import { levelColors } from './LevelAvatar';

/**
 * Los seis niveles con su ícono y color y desde cuántas huellitas empiezan. Con `currentLevel`
 * marca el nivel de la persona («Tú» o «Su nivel») y atenúa los que aún no alcanza. Sin hooks:
 * va en `/ranking`, en el perfil público y en Mi cuenta → Huellitas.
 *
 * `surface`: `site` para las páginas públicas, `dash` para el panel (usa sus tokens).
 */
export default function PawLevelsList({
  currentLevel,
  currentLabel = 'Tú',
  surface = 'site',
}: {
  currentLevel?: number | null;
  currentLabel?: string;
  surface?: 'site' | 'dash';
}) {
  const ink = surface === 'dash' ? 'text-dash-ink' : 'text-[#121212] dark:text-white';
  const muted = surface === 'dash' ? 'text-dash-muted' : 'text-[#5a5a5a] dark:text-[#9aa3b2]';
  const highlight = surface === 'dash' ? 'bg-dash-surface-2' : 'bg-[#f1f3f6] dark:bg-white/5';

  return (
    <ul className="space-y-1">
      {PAW_LEVELS.map((step) => {
        const colors = levelColors(step.key);
        const current = currentLevel === step.level;
        const pending = currentLevel != null && step.level > currentLevel;
        return (
          <li
            key={step.key}
            aria-current={current ? 'step' : undefined}
            className={cn('-mx-2 flex items-center gap-3 rounded-2xl px-2 py-1.5 text-sm', current ? highlight : '')}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                colors.solid,
                pending ? 'opacity-40' : '',
              )}
            >
              <HugeiconsIcon icon={step.icon} size={15} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className={cn('flex-1 font-medium', pending ? muted : ink)}>
              {step.level}. {step.label}
              {current ? (
                <span className={cn('ml-2 rounded-full px-2 py-0.5 align-middle text-[11px] font-bold', colors.soft)}>
                  {currentLabel}
                </span>
              ) : null}
            </span>
            <span className={cn('tabular-nums', muted)}>{step.from.toLocaleString('es-MX')}</span>
          </li>
        );
      })}
    </ul>
  );
}

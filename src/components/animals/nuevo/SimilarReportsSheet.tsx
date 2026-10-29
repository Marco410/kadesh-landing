"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { LinkSquare02Icon, Location01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import { Sheet } from 'kadesh/components/shared';
import { useUiMotion } from 'kadesh/components/shared/motion';
import { Routes } from 'kadesh/core/routes';
import { formatDate } from 'kadesh/utils/format-date';
import { useUser } from 'kadesh/utils/UserContext';
import { ClaimReportForm } from 'kadesh/components/animals/claim';
import { getStatusColor, getStatusLabel } from 'kadesh/components/animals/constants';
import {
  CREATE_ANIMAL_COMMENT_MUTATION,
  type AnimalCommentKind,
  type CreateAnimalCommentResponse,
  type CreateAnimalCommentVariables,
  type SimilarReport,
} from 'kadesh/components/animals/queries';
import {
  SIMILAR_REASON_LABELS,
  formatSimilarDistance,
  isLostReport,
  reportedByLabel,
  similarCommentTemplate,
  similarSectionTitle,
  splitSimilarReports,
} from 'kadesh/components/animals/similarReportsCopy';

type View =
  | { mode: 'list' }
  | { mode: 'comment'; report: SimilarReport }
  | { mode: 'claim'; report: SimilarReport };

interface SimilarReportsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  reports: SimilarReport[];
  /** Estatus del reporte que se está llenando. */
  status: string;
  isOwnPet: boolean;
  defaultPhone: string;
  publishing: boolean;
  onPublishAnyway: () => void;
  /** Ya dejó su información en otro reporte (comentario o solicitud): no hace falta publicar. */
  onLeftReport: (report: SimilarReport, anchor?: string) => void;
}

const buttonPrimary =
  'inline-flex min-h-11 items-center justify-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50';
const buttonSecondary =
  'inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh hover:bg-kadesh hover:text-white disabled:opacity-50';
const buttonGhost =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] dark:text-[#d0d0d0] dark:hover:bg-night';

/** Quien busca a su mascota puede pedir un reporte que subió otra persona o uno de «encontrado». */
function canClaim(report: SimilarReport, status: string, isOwnPet: boolean) {
  if (report.isMine || !isOwnPet || !isLostReport(status)) return false;
  return report.kind === 'match' || report.reportedBy === 'volunteer';
}

function ReportCard({
  report,
  status,
  isOwnPet,
  onComment,
  onClaim,
}: {
  report: SimilarReport;
  status: string;
  isOwnPet: boolean;
  onComment: (kind: AnimalCommentKind) => void;
  onClaim: () => void;
}) {
  const motionPrefs = useUiMotion();
  const place = report.placeLabel || report.city;
  const distance = formatSimilarDistance(report.distanceKm);
  const statusKey = report.status || 'register';
  const by = reportedByLabel(report);
  const claimable = canClaim(report, status, isOwnPet);
  const claimFirst = claimable && report.kind === 'duplicate';
  const href = Routes.animals.detail(report.slug || report.id);

  return (
    <motion.li
      variants={motionPrefs.item}
      className="overflow-hidden rounded-2xl border border-[#ececec] bg-white dark:border-white/10 dark:bg-night"
    >
      <div className="flex gap-3 p-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#eef1f6] dark:bg-white/5">
          {report.coverUrl ? (
            <Image src={report.coverUrl} alt={report.name} fill sizes="96px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
              Sin foto
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="min-w-0 break-words font-bold text-[#121212] dark:text-[#eef1f6]">{report.name}</p>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: getStatusColor(statusKey) }}
            >
              {getStatusLabel(statusKey)}
            </span>
            {report.level === 'likely' ? (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                Muy parecido
              </span>
            ) : null}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            <HugeiconsIcon icon={Location01Icon} size={13} strokeWidth={1.6} />
            {[place, distance].filter(Boolean).join(' · ') || 'Sin ubicación'}
          </p>
          <p className="mt-0.5 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            {[report.reportedAt ? formatDate(report.reportedAt) : null, by].filter(Boolean).join(' · ')}
          </p>
          {report.reasons.length ? (
            <ul className="mt-2 flex flex-wrap gap-1" aria-label="Por qué se parece">
              {report.reasons.slice(0, 4).map((reason) => (
                <li
                  key={reason}
                  className="rounded-full bg-[#f3f5f8] px-2 py-0.5 text-[11px] font-semibold text-[#3a3a3a] dark:bg-white/10 dark:text-[#d0d0d0]"
                >
                  {SIMILAR_REASON_LABELS[reason] ?? reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[#ececec] p-3 dark:border-white/10">
        {report.isMine ? (
          <p className="flex-1 self-center text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Ya lo reportaste tú. Puedes actualizar ese reporte en vez de publicar otro.
          </p>
        ) : claimFirst ? (
          <>
            <button type="button" onClick={onClaim} className={`${buttonPrimary} flex-1`}>
              Es mi mascota: pedir el reporte
            </button>
            <button type="button" onClick={() => onComment('duplicate_report')} className={`${buttonSecondary} flex-1`}>
              Dejar comentario
            </button>
          </>
        ) : report.kind === 'duplicate' ? (
          <button type="button" onClick={() => onComment('duplicate_report')} className={`${buttonPrimary} flex-1`}>
            Es el mismo: dejar comentario
          </button>
        ) : (
          <>
            <button type="button" onClick={() => onComment('possible_match')} className={`${buttonPrimary} flex-1`}>
              {isLostReport(status) ? 'Es el mío: avisar' : 'Es este: avisar a su familia'}
            </button>
            {claimable ? (
              <button type="button" onClick={onClaim} className={`${buttonSecondary} flex-1`}>
                Pedir el reporte
              </button>
            ) : null}
          </>
        )}
        <a href={href} target="_blank" rel="noopener noreferrer" className={buttonGhost}>
          <HugeiconsIcon icon={LinkSquare02Icon} size={16} strokeWidth={1.6} />
          {report.isMine ? 'Ver mi reporte' : 'Ver reporte'}
        </a>
      </div>
    </motion.li>
  );
}

/**
 * Reportes parecidos antes de publicar: el mismo animal ya reportado (comentar o pedir el
 * reporte) y, aparte, el otro lado de la historia (perdido ↔ encontrado) para avisar.
 */
export default function SimilarReportsSheet({
  isOpen,
  onClose,
  reports,
  status,
  isOwnPet,
  defaultPhone,
  publishing,
  onPublishAnyway,
  onLeftReport,
}: SimilarReportsSheetProps) {
  const motionPrefs = useUiMotion();
  const { user } = useUser();
  const [view, setView] = useState<View>({ mode: 'list' });
  const [commentKind, setCommentKind] = useState<AnimalCommentKind>('duplicate_report');
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [claimBusy, setClaimBusy] = useState(false);
  const [createComment, { loading: commenting }] = useMutation<
    CreateAnimalCommentResponse,
    CreateAnimalCommentVariables
  >(CREATE_ANIMAL_COMMENT_MUTATION);

  useEffect(() => {
    if (isOpen) setView({ mode: 'list' });
  }, [isOpen]);

  const { duplicates, matches } = splitSimilarReports(reports);
  const busy = commenting || claimBusy || publishing;

  const openComment = (report: SimilarReport, kind: AnimalCommentKind) => {
    setCommentKind(kind);
    setComment(similarCommentTemplate(report, status, isOwnPet));
    setCommentError('');
    setView({ mode: 'comment', report });
  };

  const submitComment = async (report: SimilarReport) => {
    const text = comment.trim();
    if (text.length < 5) {
      setCommentError('Escribe qué sabes: cuándo y dónde lo viste, o cómo contactarte.');
      return;
    }
    try {
      await createComment({
        variables: {
          data: {
            comment: text,
            kind: commentKind,
            animal: { connect: { id: report.id } },
            user: user?.id ? { connect: { id: user.id } } : null,
          },
        },
      });
      sileo.success({
        title: 'Listo, dejaste tu información',
        description: 'Le avisamos a quien lo reportó.',
      });
      onLeftReport(report, 'comentarios');
    } catch (error) {
      console.error('[animal] no se pudo comentar el reporte parecido', error);
      setCommentError('No se pudo publicar el comentario. Inténtalo de nuevo.');
    }
  };

  const title =
    view.mode === 'comment'
      ? 'Agregar información al reporte'
      : view.mode === 'claim'
        ? 'Es mi mascota'
        : 'Antes de publicar';

  const footer =
    view.mode === 'list' ? (
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <motion.button
          type="button"
          onClick={onPublishAnyway}
          disabled={busy}
          whileTap={busy ? undefined : motionPrefs.tap}
          className={`${buttonPrimary} sm:flex-1`}
        >
          {publishing ? 'Publicando…' : duplicates.length ? 'No es ninguno, publicar mi reporte' : 'Publicar mi reporte'}
        </motion.button>
        <button type="button" onClick={onClose} disabled={busy} className={`${buttonGhost} sm:flex-1`}>
          Seguir editando
        </button>
      </div>
    ) : view.mode === 'comment' ? (
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setView({ mode: 'list' })}
          disabled={commenting}
          className={`${buttonGhost} flex-1`}
        >
          Volver
        </button>
        <motion.button
          type="button"
          onClick={() => void submitComment(view.report)}
          disabled={commenting}
          whileTap={commenting ? undefined : motionPrefs.tap}
          className={`${buttonPrimary} flex-1`}
        >
          {commenting ? 'Publicando…' : 'Publicar comentario'}
        </motion.button>
      </div>
    ) : null;

  return (
    <Sheet isOpen={isOpen} title={title} onClose={onClose} busy={busy} footer={footer}>
      {view.mode === 'list' ? (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-[#5a5a5a] dark:text-[#9aa3b2]">
            {duplicates.length
              ? 'Estos reportes se parecen al tuyo. Si es el mismo animal, deja tu información ahí: así todo lo que se sabe queda en un solo lugar y le avisamos a quien lo reportó.'
              : 'Hay reportes del otro lado de la historia que se parecen al tuyo. Si es el mismo animal, avísales: tu reporte se puede publicar igual.'}
          </p>
          {[
            { kind: 'duplicate' as const, items: duplicates },
            { kind: 'match' as const, items: matches },
          ]
            .filter((section) => section.items.length)
            .map((section) => (
              <section key={section.kind} aria-label={similarSectionTitle(section.kind, status)}>
                <h3 className="mb-2 text-sm font-bold text-[#121212] dark:text-[#eef1f6]">
                  {similarSectionTitle(section.kind, status)}
                </h3>
                <motion.ul
                  className="space-y-3"
                  variants={motionPrefs.list}
                  initial={motionPrefs.list ? 'hidden' : false}
                  animate="show"
                >
                  {section.items.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      status={status}
                      isOwnPet={isOwnPet}
                      onComment={(kind) => openComment(report, kind)}
                      onClaim={() => setView({ mode: 'claim', report })}
                    />
                  ))}
                </motion.ul>
              </section>
            ))}
        </div>
      ) : view.mode === 'comment' ? (
        <div className="space-y-3">
          <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Se publica en el reporte de <span className="font-semibold text-[#121212] dark:text-[#eef1f6]">{view.report.name}</span> y
            le avisamos a quien lo reportó. Incluye cómo contactarte si quieres que te llamen.
          </p>
          <label htmlFor="similar-comment" className="sr-only">
            Comentario
          </label>
          <textarea
            id="similar-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            autoFocus
            disabled={commenting}
            className={`w-full resize-none rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2] ${commentError ? 'ring-1 ring-red-500' : ''}`}
            placeholder="Cuándo y dónde lo viste, qué sabes, cómo contactarte."
          />
          {commentError ? <p className="text-xs text-red-600">{commentError}</p> : null}
        </div>
      ) : (
        <ClaimReportForm
          animalId={view.report.id}
          animalName={view.report.name}
          defaultPhone={defaultPhone}
          cancelLabel="Volver"
          onCancel={() => setView({ mode: 'list' })}
          onBusyChange={setClaimBusy}
          onDone={() => onLeftReport(view.report)}
        />
      )}
    </Sheet>
  );
}

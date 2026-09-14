"use client";

import { useState, useEffect } from 'react';
import { formatDate } from 'kadesh/utils/format-date';
import { getStatusLabel, getStatusColor } from '../constants';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Delete02Icon, Location01Icon } from '@hugeicons/core-free-icons';
import LogMap from './LogMap';
import AddLogModal from './AddLogModal';
import ConfirmModal from 'kadesh/components/shared/ConfirmModal';
import { useUser } from 'kadesh/utils/UserContext';
import { AnimalDetail } from './hooks/useAnimalDetail';
import { useDeleteLog } from './hooks/useDeleteLog';

interface Log {
  id: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  createdAt: string;
  date_status?: string;
  last_seen?: string | null;
  lat?: number | null;
  lng?: number | null;
  notes?: string | null;
  status: string;
}

interface LogTimelineProps {
  logs: Log[];
  animal?: AnimalDetail;
  animalName?: string;
  onLogCreated?: (logId?: string) => void | Promise<void>;
}

function hasCoords(log: Log) {
  return (
    log.lat != null &&
    log.lng != null &&
    !Number.isNaN(Number(log.lat)) &&
    !Number.isNaN(Number(log.lng))
  );
}

function isPlaceholderNote(notes?: string | null) {
  const text = notes?.trim() ?? '';
  if (!text) return true;
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  return normalized === 'sin informacion adicional' || normalized === 'sin notas' || normalized === 'sin nota';
}

function placeLabel(log: Log) {
  return [log.address, log.city, log.state, log.country].filter(Boolean).join(', ');
}

function directionsUrl(lat: string | number, lng: string | number) {
  const destination = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

export default function LogTimeline({ logs, animal, animalName, onLogCreated }: LogTimelineProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [addLogModalOpen, setAddLogModalOpen] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingLogId, setPendingLogId] = useState<string | null>(null);
  const [pendingSelectAfterDelete, setPendingSelectAfterDelete] = useState(false);
  const { user } = useUser();

  const { deleteLog, isDeleting } = useDeleteLog({
    onSuccess: () => {
      const deletedLogIndex = logs.findIndex((log) => log.id === deleteLogId);
      const wasMostRecent = deletedLogIndex === 0;

      setShowDeleteModal(false);
      setDeleteLogId(null);

      if (onLogCreated) {
        onLogCreated();
      }

      if (selectedLogId === deleteLogId) {
        if (wasMostRecent && logs.length > 1) {
          setPendingSelectAfterDelete(true);
        } else {
          setSelectedLogId(null);
        }
      }
    },
  });

  useEffect(() => {
    if (logs.length > 0 && selectedLogId === null && !pendingLogId) {
      const firstWithCoords = logs.find(hasCoords) ?? logs[0];
      setSelectedLogId(firstWithCoords.id);
    }
  }, [logs, selectedLogId, pendingLogId]);

  useEffect(() => {
    if (pendingLogId && logs.length > 0) {
      const logExists = logs.find((log) => log.id === pendingLogId);
      if (logExists) {
        setSelectedLogId(pendingLogId);
        setPendingLogId(null);
      }
    }
  }, [logs, pendingLogId]);

  useEffect(() => {
    if (pendingSelectAfterDelete && logs.length > 0) {
      const firstWithCoords = logs.find(hasCoords) ?? logs[0];
      setSelectedLogId(firstWithCoords.id);
      setPendingSelectAfterDelete(false);
    }
  }, [logs, pendingSelectAfterDelete]);

  const selectedLog = logs.find((log) => log.id === selectedLogId);
  const selectedLogWithCoords = selectedLog && hasCoords(selectedLog) ? selectedLog : null;
  const isOwner = user?.id === animal?.user?.id;

  const handleDeleteClick = (logId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteLogId(logId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteLogId) return;
    deleteLog(deleteLogId);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]">
              Historial
            </h2>
            {animal && onLogCreated && isOwner && (
              <button
                type="button"
                onClick={() => setAddLogModalOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={1.5} />
                Agregar registro
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <p className="py-10 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
              Aún no hay actualizaciones. Quien reportó puede agregar la primera.
            </p>
          ) : (
            <ol className="relative ml-3 border-s border-[#ececec] dark:border-white/10">
              {logs.map((log, index) => {
                const isSelected = selectedLogId === log.id;
                const isLatest = index === 0;
                const statusColor = getStatusColor(log.status);
                const statusLabel = getStatusLabel(log.status);
                const note = isPlaceholderNote(log.notes) ? null : log.notes?.trim();
                const place = placeLabel(log);

                return (
                  <li key={log.id} className="mb-4 ml-5 last:mb-0">
                    <span
                      className="absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-night-raised"
                      style={{ backgroundColor: statusColor }}
                    />
                    <div
                      className={`rounded-xl p-3 transition-colors ${
                        isSelected
                          ? 'bg-kadesh-50 dark:bg-kadesh/15'
                          : 'hover:bg-[#f7f8fa] dark:hover:bg-night'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedLogId(log.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                              style={{ backgroundColor: statusColor }}
                            >
                              {statusLabel}
                            </span>
                            {isLatest && (
                              <span className="text-xs font-semibold text-kadesh">Más reciente</span>
                            )}
                            <time className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
                              {formatDate(log.date_status || log.createdAt)}
                            </time>
                          </div>
                          {place ? (
                            <p className="mt-1.5 text-sm text-[#121212] dark:text-[#eef1f6]">{place}</p>
                          ) : null}
                          {note ? (
                            <p className="mt-1 text-sm leading-relaxed text-[#3a3a3a] dark:text-[#c5ccd8]">
                              {note}
                            </p>
                          ) : null}
                          {isLatest && log.last_seen ? (
                            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-kadesh">
                              <HugeiconsIcon icon={Location01Icon} size={14} strokeWidth={1.5} />
                              Última vez visto aquí
                            </p>
                          ) : null}
                        </button>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(log.id, e)}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#5a5a5a] hover:bg-red-50 hover:text-red-600 dark:text-[#9aa3b2] dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            aria-label="Eliminar registro"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="flex min-h-0 flex-col rounded-2xl border border-[#ececec] bg-white p-5 dark:border-white/10 dark:bg-night-raised sm:p-6">
          {selectedLogWithCoords ? (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]">
                    Ubicación
                  </h2>
                  <p className="mt-0.5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                    {getStatusLabel(selectedLogWithCoords.status)} ·{' '}
                    {formatDate(selectedLogWithCoords.date_status || selectedLogWithCoords.createdAt)}
                  </p>
                </div>
                <a
                  href={directionsUrl(
                    selectedLogWithCoords.lat as number,
                    selectedLogWithCoords.lng as number
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-kadesh px-4 text-sm font-semibold text-kadesh transition-colors hover:bg-kadesh hover:text-white"
                >
                  <HugeiconsIcon icon={Location01Icon} size={16} strokeWidth={1.5} />
                  Cómo llegar
                </a>
              </div>
              <div className="h-[280px] min-h-[280px] overflow-hidden rounded-xl sm:h-[360px]">
                <LogMap
                  lat={Number(selectedLogWithCoords.lat)}
                  lng={Number(selectedLogWithCoords.lng)}
                  status={selectedLogWithCoords.status}
                />
              </div>
              {placeLabel(selectedLogWithCoords) ? (
                <p className="mt-3 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                  {placeLabel(selectedLogWithCoords)}
                </p>
              ) : null}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
              <HugeiconsIcon
                icon={Location01Icon}
                size={32}
                className="text-[#9aa3b2]"
                strokeWidth={1.5}
              />
              <p className="text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
                Elige un registro
              </p>
              <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                Toca uno del historial para verlo en el mapa.
              </p>
            </div>
          )}
        </section>
      </div>

      {animal && animalName && onLogCreated && isOwner && (
        <AddLogModal
          isOpen={addLogModalOpen}
          onClose={() => {
            setAddLogModalOpen(false);
            setPendingLogId(null);
          }}
          onSuccess={async (logId) => {
            if (logId) {
              setPendingLogId(logId);
            }
            await onLogCreated(logId);
          }}
          animalId={animal.id}
          animalName={animalName}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteLogId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar registro?"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonColor="red"
        isLoading={isDeleting}
      />
    </>
  );
}

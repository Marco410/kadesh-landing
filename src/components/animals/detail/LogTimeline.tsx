"use client";

import { useState, useEffect } from 'react';
import { formatDate, formatDateWithDay, formatTime } from 'kadesh/utils/format-date';
import { getStatusLabel, getStatusColor } from '../constants';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, ArrowDown01Icon, ArrowUp01Icon, ArrowRightIcon, Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import LogMap from './LogMap';
import MapModal from './MapModal';
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

export default function LogTimeline({ logs, animal, animalName, onLogCreated }: LogTimelineProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapModalLog, setMapModalLog] = useState<Log | null>(null);
  const [addLogModalOpen, setAddLogModalOpen] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingLogId, setPendingLogId] = useState<string | null>(null);
  const [pendingSelectAfterDelete, setPendingSelectAfterDelete] = useState(false);
  const { user } = useUser();

  const { deleteLog, isDeleting } = useDeleteLog({
    onSuccess: () => {
      const deletedLogIndex = logs.findIndex(log => log.id === deleteLogId);
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

  // Auto-select first log on mount
  useEffect(() => {
    if (logs.length > 0 && selectedLogId === null && !pendingLogId) {
      // Select the first log (most recent) if it has valid coordinates
      const firstLog = logs[0];
      if (firstLog.lat != null && firstLog.lng != null && 
          !isNaN(Number(firstLog.lat)) && !isNaN(Number(firstLog.lng))) {
        setSelectedLogId(firstLog.id);
      }
    }
  }, [logs, selectedLogId, pendingLogId]);

  // Select pending log when it appears in the logs array
  useEffect(() => {
    if (pendingLogId && logs.length > 0) {
      const logExists = logs.find(log => log.id === pendingLogId);
      if (logExists) {
        setSelectedLogId(pendingLogId);
        setPendingLogId(null);
      }
    }
  }, [logs, pendingLogId]);

  // Select next log after deleting the most recent one
  useEffect(() => {
    if (pendingSelectAfterDelete && logs.length > 0) {
      // Select the first log (now the most recent after deletion) if it has valid coordinates
      const firstLog = logs[0];
      if (firstLog.lat != null && firstLog.lng != null && 
          !isNaN(Number(firstLog.lat)) && !isNaN(Number(firstLog.lng))) {
        setSelectedLogId(firstLog.id);
      } else {
        // If the first log doesn't have coordinates, try to find the first one that does
        const logWithCoords = logs.find(log => 
          log.lat != null && log.lng != null && 
          !isNaN(Number(log.lat)) && !isNaN(Number(log.lng))
        );
        if (logWithCoords) {
          setSelectedLogId(logWithCoords.id);
        } else {
          // If no log has coordinates, just select the first one
          setSelectedLogId(firstLog.id);
        }
      }
      setPendingSelectAfterDelete(false);
    }
  }, [logs, pendingSelectAfterDelete]);

  const selectedLog = logs.find((log) => log.id === selectedLogId);
  const latestLog = logs[0]; // Most recent log (already sorted)

  const handleLogClick = (logId: string) => {
    setSelectedLogId(selectedLogId === logId ? null : logId);
  };

  const handleOpenMapModal = (log: Log) => {
    setMapModalLog(log);
    setMapModalOpen(true);
  };

  const handleCloseMapModal = () => {
    setMapModalOpen(false);
    setMapModalLog(null);
  };

  const handleDeleteClick = (logId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteLogId(logId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteLogId) return;
    deleteLog(deleteLogId);
  };

  const isOwner = user?.id === animal?.user?.id;

  const selectedLogWithCoords = selectedLog && 
    selectedLog.lat != null && 
    selectedLog.lng != null && 
    !isNaN(Number(selectedLog.lat)) && 
    !isNaN(Number(selectedLog.lng)) 
    ? selectedLog 
    : null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map Section - Only show when a log with coordinates is selected */}
        {selectedLogWithCoords ? (
          <div className="sticky top-8 h-fit order-1 lg:order-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: getStatusColor(selectedLogWithCoords.status) }}
                />
                <div>
                  <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">Ubicación del Registro</h2>
                  <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-1">
                    {getStatusLabel(selectedLogWithCoords.status)} • {formatDate(selectedLogWithCoords.createdAt)}
                  </p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${Number(selectedLogWithCoords.lat)},${Number(selectedLogWithCoords.lng)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors shrink-0"
              >
                <HugeiconsIcon icon={ArrowRightIcon} size={18} strokeWidth={2} />
                Cómo llegar
              </a>
            </div>
            <div 
              className="rounded-lg overflow-hidden border-2 shadow-lg transition-all"
              style={{ 
                borderColor: getStatusColor(selectedLogWithCoords.status),
                boxShadow: `0 4px 12px ${getStatusColor(selectedLogWithCoords.status)}40`
              }}
            >
              <LogMap
                lat={Number(selectedLogWithCoords.lat)}
                lng={Number(selectedLogWithCoords.lng)}
                status={selectedLogWithCoords.status}
                height="500px"
              />
            </div>
            {selectedLogWithCoords.address && (
              <div className="mt-4 p-3 bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a]">
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  <strong className="text-[#212121] dark:text-[#ffffff]">Dirección:</strong> {selectedLogWithCoords.address}
                  {selectedLogWithCoords.city && `, ${selectedLogWithCoords.city}`}
                  {selectedLogWithCoords.state && `, ${selectedLogWithCoords.state}`}
                  {selectedLogWithCoords.country && `, ${selectedLogWithCoords.country}`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] min-h-[500px] order-1 lg:order-2">
            <div className="text-center">
              <svg className="w-16 h-16 text-[#616161] dark:text-[#b0b0b0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-[#616161] dark:text-[#b0b0b0] font-medium">Selecciona un registro</p>
              <p className="text-[#616161] dark:text-[#b0b0b0] text-sm mt-2">para ver su ubicación en el mapa</p>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <div className="order-2 lg:order-1">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">Historial de Registros</h2>
            {animal && onLogCreated && user?.id === animal.user?.id && (
              <button
                type="button"
                onClick={() => setAddLogModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
              >
                <HugeiconsIcon icon={Add01Icon} size={18} className="text-white" strokeWidth={2} />
                Agregar registro
              </button>
            )}
          </div>
          <ol className="relative border-s-2 border-[#e0e0e0] dark:border-[#3a3a3a] ml-4">
            {logs.length === 0 ? (
              <li className="ml-6 mb-8">
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-[#616161] dark:text-[#b0b0b0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#616161] dark:text-[#b0b0b0] font-medium">No hay registros disponibles</p>
                  <p className="text-[#616161] dark:text-[#b0b0b0] text-sm mt-2">Aún no se han registrado actualizaciones para este animal</p>
                </div>
              </li>
            ) : (
            logs.map((log, index) => {
              const isSelected = selectedLogId === log.id;
              const isLatest = index === 0;
              const statusColor = getStatusColor(log.status);
              const statusLabel = getStatusLabel(log.status);

              const hasCoords = log.lat != null && log.lng != null && 
                !isNaN(Number(log.lat)) && !isNaN(Number(log.lng));
              const isSelectedWithMap = isSelected && hasCoords;

              return (
                <li
                  key={log.id}
                  className={`mb-8 ml-6 transition-all group relative ${
                    isSelected 
                      ? 'opacity-100' 
                      : 'opacity-90 hover:opacity-100 hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] rounded-lg p-2 -ml-2'
                  }`}
                >
                  <span
                    className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-[36px] top-0 ring-2 ring-white dark:ring-[#3a3a3a] shadow-md transition-transform group-hover:scale-110 z-10 ${
                      isSelectedWithMap ? 'ring-4 ring-orange-500/50 scale-110' : ''
                    }`}
                    style={{ backgroundColor: statusColor }}
                  >
                    <HugeiconsIcon
                      icon={Calendar02Icon}
                      size={14}
                      className="text-white"
                      strokeWidth={2}
                    />
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleLogClick(log.id)}
                    >
                      <div className="flex flex-wrap items-center mb-2">
                        <time
                          className="flex items-center gap-1 bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-xs font-semibold px-2 py-1 rounded-md"
                          title={new Date(log.date_status || '').toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
                        >
                          {formatDate(log.date_status || '')}
                        </time>
                        <span className="mx-1">·</span>
                        <time
                          className="flex items-center gap-1 text-[#757575] dark:text-[#bdbdbd] text-xs py-1 rounded-md bg-transparent"
                          title="Fecha y hora completa"
                        >
                          <span>
                            {formatDateWithDay(log.date_status || '')}
                          </span>
                          <span className="mx-1">|</span>
                          <span>
                            {formatTime(log.date_status || '')}
                          </span>
                        </time>
                      </div>
                      <h3 className="flex items-center gap-2 mb-2 text-base font-semibold text-[#212121] dark:text-[#ffffff]">
                        {statusLabel}
                        {isLatest && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-sm"
                            style={{ backgroundColor: statusColor }}
                          >
                            Más reciente
                          </span>
                        )}
                        {isSelectedWithMap && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white shadow-sm flex items-center gap-1">
                            <HugeiconsIcon
                              icon={ArrowRightIcon}
                              size={12}
                              className="text-white"
                              strokeWidth={2}
                            />
                            En el mapa
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <button
                          onClick={(e) => handleDeleteClick(log.id, e)}
                          className="group/delete flex-shrink-0 p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-[#3a3a3a] hover:bg-red-500 hover:border-red-500 dark:hover:bg-red-500 transition-all hover:scale-110"
                          aria-label="Eliminar registro"
                          title="Eliminar registro"
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            size={18}
                            className="text-[#212121] dark:text-[#ffffff] group-hover/delete:text-white transition-colors"
                            strokeWidth={2}
                          />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogClick(log.id);
                        }}
                        className="group/btn flex-shrink-0 p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#2a2a2a] border border-[#e0e0e0] dark:border-[#3a3a3a] hover:bg-orange-500 hover:border-orange-500 dark:hover:bg-orange-500 transition-all hover:scale-110"
                        aria-label={isSelected ? 'Cerrar detalles' : 'Ver detalles'}
                      >
                        <HugeiconsIcon
                          icon={isSelected ? ArrowUp01Icon : ArrowDown01Icon}
                          size={20}
                          className="text-[#212121] dark:text-[#ffffff] group-hover/btn:text-white transition-colors"
                          strokeWidth={2}
                        />
                      </button>
                    </div>
                  </div>
                  {isSelected ? (
                    <div 
                      className={`mt-3 bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3 border border-[#e0e0e0] dark:border-[#3a3a3a] ${
                        isSelectedWithMap ? 'border-l-4' : ''
                      }`}
                      style={isSelectedWithMap ? { borderLeftColor: statusColor } : {}}
                    >
                     
                      <p className="text-[#616161] dark:text-[#b0b0b0] text-sm leading-relaxed">{log.notes || 'Sin notas'}</p>
                      {(log.lat != null && log.lng != null && !isNaN(Number(log.lat)) && !isNaN(Number(log.lng))) && (
                        <div className="pt-3 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
                          <div className="text-sm text-[#616161] dark:text-[#b0b0b0] space-y-1">
                            {log.address && (
                              <p>
                                <strong className="text-[#212121] dark:text-[#ffffff]">Dirección:</strong> {log.address}
                              </p>
                            )}
                            {log.city && (
                              <p>
                                <strong className="text-[#212121] dark:text-[#ffffff]">Ciudad:</strong> {log.city}
                                {log.state && `, ${log.state}`}
                                {log.country && `, ${log.country}`}
                              </p>
                            )}
                            <p className="text-xs opacity-70">
                              Coordenadas: {Number(log.lat).toFixed(6)}, {Number(log.lng).toFixed(6)}
                            </p>
                          </div>
                        </div>
                      )}
                       {isLatest && log.last_seen && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <svg className="w-5 h-5 text-orange-500 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                            Última vez visto aquí
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#616161] dark:text-[#b0b0b0] text-sm line-clamp-2">
                      {log.notes || 'Sin notas'}
                    </p>
                  )}
                </li>
              );
            })
            )}
          </ol>
        </div>
      </div>

      {/* Map Modal */}
      {mapModalLog && mapModalLog.lat != null && mapModalLog.lng != null && 
       !isNaN(Number(mapModalLog.lat)) && !isNaN(Number(mapModalLog.lng)) && (
        <MapModal
          isOpen={mapModalOpen}
          onClose={handleCloseMapModal}
          lat={Number(mapModalLog.lat)}
          lng={Number(mapModalLog.lng)}
          status={mapModalLog.status}
        />
      )}

      {/* Add Log Modal */}
      {animal && animalName && onLogCreated && user?.id === animal.user?.id && (
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

      {/* Delete Confirmation Modal */}
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




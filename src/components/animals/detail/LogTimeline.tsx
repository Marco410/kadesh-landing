"use client";

import { useState, useEffect } from 'react';
import { formatDate, formatDateWithDay, formatTime } from 'kadesh/utils/format-date';
import { getStatusLabel, getStatusColor } from '../constants';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, ArrowDown01Icon, ArrowUp01Icon, ArrowRightIcon } from '@hugeicons/core-free-icons';
import LogMap from './LogMap';
import MapModal from './MapModal';

interface Log {
  id: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  createdAt: string;
  last_seen?: string | null;
  lat?: number | null;
  lng?: number | null;
  notes?: string | null;
  status: string;
}

interface LogTimelineProps {
  logs: Log[];
}

export default function LogTimeline({ logs }: LogTimelineProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapModalLog, setMapModalLog] = useState<Log | null>(null);

  // Auto-select first log on mount
  useEffect(() => {
    if (logs.length > 0 && selectedLogId === null) {
      // Select the first log (most recent) if it has valid coordinates
      const firstLog = logs[0];
      if (firstLog.lat != null && firstLog.lng != null && 
          !isNaN(Number(firstLog.lat)) && !isNaN(Number(firstLog.lng))) {
        setSelectedLogId(firstLog.id);
      }
    }
  }, [logs, selectedLogId]);

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

  const displayLog = selectedLog || latestLog;

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-[#616161] dark:text-[#b0b0b0] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[#616161] dark:text-[#b0b0b0] font-medium">No hay registros disponibles</p>
        <p className="text-[#616161] dark:text-[#b0b0b0] text-sm mt-2">Aún no se han registrado actualizaciones para este animal</p>
      </div>
    );
  }

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
        {/* Timeline Section */}
        <div>
          <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff] mb-6">Historial de Registros</h2>
          <ol className="relative border-s-2 border-[#e0e0e0] dark:border-[#3a3a3a] ml-4">
            {logs.map((log, index) => {
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
                          title={new Date(log.createdAt).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
                        >
                          {formatDate(log.createdAt)}
                        </time>
                        <span className="mx-1">·</span>
                        <time
                          className="flex items-center gap-1 text-[#757575] dark:text-[#bdbdbd] text-xs py-1 rounded-md bg-transparent"
                          title="Fecha y hora completa"
                        >
                          <span>
                            {formatDateWithDay(log.createdAt)}
                          </span>
                          <span className="mx-1">|</span>
                          <span>
                            {formatTime(log.createdAt)}
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
            })}
          </ol>
        </div>

        {/* Map Section - Only show when a log with coordinates is selected */}
        {selectedLogWithCoords ? (
          <div className="sticky top-8 h-fit">
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
              {/* <button
                onClick={() => handleOpenMapModal(selectedLogWithCoords)}
                className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M10 3v4a1 1 0 0 1-1 1H5m14-4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"
                  />
                </svg>
                Ver en pantalla completa
              </button> */}
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
          <div className="hidden lg:flex items-center justify-center bg-[#f5f5f5] dark:bg-[#1e1e1e] rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] min-h-[500px]">
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
    </>
  );
}




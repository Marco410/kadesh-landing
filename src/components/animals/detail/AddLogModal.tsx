"use client";

import { useState, useEffect, useCallback } from 'react';
import { ANIMAL_LOGS_OPTIONS, statusIcons } from '../constants';
import LocationPicker from '../nuevo/LocationPicker';
import StatusDatePicker from 'kadesh/components/shared/StatusDatePicker';
import { useCreateLog } from './hooks/useCreateLog';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (logId?: string) => void | Promise<void>;
  animalId: string;
  animalName: string;
}

const formatDateTimeLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
};

export default function AddLogModal({ isOpen, onClose, onSuccess, animalId, animalName }: AddLogModalProps) {
  const [status, setStatus] = useState('lost');
  const [dateStatus, setDateStatus] = useState('');
  const [isToday, setIsToday] = useState(true);
  const [lastSeen, setLastSeen] = useState(false);
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createLog, isCreating: isSubmitting } = useCreateLog({
    onSuccess: async (logId) => {
      await onSuccess(logId);
      resetForm();
      onClose();
    },
    onError: (error) => {
      setErrors({ submit: error?.message || 'Error al guardar el registro' });
    },
  });

  useEffect(() => {
    if (isToday) {
      setDateStatus(formatDateTimeLocal(new Date()));
    }
  }, [isToday]);

  useEffect(() => {
    if (!isToday) return;
    const t = setInterval(() => setDateStatus(formatDateTimeLocal(new Date())), 60000);
    return () => clearInterval(t);
  }, [isToday]);

  const handleLocationChange = useCallback((newLat: string, newLng: string) => {
    setLat(newLat);
    setLng(newLng);
  }, []);

  const handleAddressChange = useCallback((a: string, c: string, s: string, co: string) => {
    setAddress(a);
    setCity(c);
    setState(s);
    setCountry(co);
  }, []);

  const resetForm = () => {
    setStatus('lost');
    setDateStatus(formatDateTimeLocal(new Date()));
    setIsToday(true);
    setLastSeen(false);
    setNotes('');
    setLat('');
    setLng('');
    setAddress('');
    setCity('');
    setState('');
    setCountry('');
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!status) e.status = 'El estado es requerido';
    if (!dateStatus?.trim()) e.dateStatus = 'La fecha del estado es requerida';
    else {
      const chosen = new Date(dateStatus).getTime();
      if (chosen > Date.now()) e.dateStatus = 'La fecha no puede ser posterior a hoy';
    }
    if (!notes?.trim()) e.notes = 'Las notas son requeridas';
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (lat === '' || lng === '' || isNaN(latN) || isNaN(lngN)) {
      e.location = 'Selecciona una ubicación en el mapa o usa "Usar mi ubicación actual"';
    }
    if (!address?.trim()) e.address = 'La dirección es requerida';
    if (!city?.trim()) e.city = 'La ciudad es requerida';
    if (!state?.trim()) e.state = 'El estado/provincia es requerido';
    if (!country?.trim()) e.country = 'El país es requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || isSubmitting) return;

    setErrors({});

    try {
      await createLog({
        animalId,
        status,
        notes,
        lat,
        lng,
        address,
        city,
        state,
        country,
        lastSeen,
        dateStatus,
      });
      // onSuccess, resetForm, and onClose are handled by the hook's onSuccess callback
    } catch (err: any) {
      // Error is handled by useCreateLog hook's onError callback
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div
        className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-[#e0e0e0] dark:border-[#3a3a3a]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
          <h2 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">Agregar registro</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0]"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {errors.submit}
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
                Estado <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ANIMAL_LOGS_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition ${
                      status === opt.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                        : 'border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212]'
                    }`}
                  >
                    <span>{statusIcons[opt.value] || '📋'}</span>
                    <span className="text-sm font-medium text-[#212121] dark:text-[#ffffff]">{opt.label}</span>
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={status === opt.value}
                      onChange={() => setStatus(opt.value)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
              {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
            </div>

            {/* Date Status */}
            <div>
              <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
                Fecha del estado <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  id="isToday"
                  type="checkbox"
                  checked={isToday}
                  onChange={(e) => setIsToday(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <label htmlFor="isToday" className="text-sm font-medium text-[#212121] dark:text-[#ffffff] cursor-pointer">
                  Fue hoy
                </label>
              </div>
              
              <StatusDatePicker
                value={dateStatus}
                onChange={setDateStatus}
                isDisabled={isToday}
                errorMessage={errors.dateStatus}
                popoverScopeClass="add-log-date-picker-popover"
              />
            </div>

            {/* Location */}
            <div>
              {errors.location && <p className="mb-2 text-xs text-red-500">{errors.location}</p>}
              {errors.address && <p className="mb-1 text-xs text-red-500">{errors.address}</p>}
              {errors.city && <p className="mb-1 text-xs text-red-500">{errors.city}</p>}
              {errors.state && <p className="mb-1 text-xs text-red-500">{errors.state}</p>}
              {errors.country && <p className="mb-2 text-xs text-red-500">{errors.country}</p>}
              <LocationPicker
                lat={lat}
                lng={lng}
                address={address}
                city={city}
                state={state}
                country={country}
                isVisible={isOpen}
                onLocationChange={handleLocationChange}
                onAddressChange={handleAddressChange}
              />
            </div>

            {/* Last seen */}
            <div className="flex items-center gap-2">
              <input
                id="lastSeen"
                type="checkbox"
                checked={lastSeen}
                onChange={(e) => setLastSeen(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <label htmlFor="lastSeen" className="text-sm font-medium text-[#212121] dark:text-[#ffffff]">
                Última vez visto en esta ubicación
              </label>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="add-log-notes" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
                Notas <span className="text-red-500">*</span>
              </label>
              <textarea
                id="add-log-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Información adicional sobre este registro..."
              />
              {errors.notes && <p className="mt-1 text-xs text-red-500">{errors.notes}</p>}
            </div>
          </div>

          <div className="flex gap-3 p-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#f5f5f5] dark:bg-[#2a2a2a] hover:bg-[#e5e5e5] dark:hover:bg-[#3a3a3a] text-[#212121] dark:text-[#ffffff] font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

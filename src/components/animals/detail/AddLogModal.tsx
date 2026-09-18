"use client";

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { ANIMAL_LOGS_OPTIONS, getStatusColor } from '../constants';
import LocationPicker from '../nuevo/LocationPicker';
import StatusDatePicker from 'kadesh/components/shared/StatusDatePicker';
import { useCreateLog } from './hooks/useCreateLog';
import { useUiMotion } from 'kadesh/components/shared/motion';

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
  const [contactNumber, setContactNumber] = useState('');
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
    setContactNumber('');
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
    if (!contactNumber?.trim()) e.contactNumber = 'El teléfono de contacto es requerido';
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (lat === '' || lng === '' || isNaN(latN) || isNaN(lngN)) {
      e.location = 'Fija el pin en el mapa o usa «Estoy aquí».';
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
        contactNumber,
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

  const motionPrefs = useUiMotion();

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
          variants={motionPrefs.overlay}
          initial={motionPrefs.overlay ? 'hidden' : false}
          animate="show"
          exit="exit"
        >
          <motion.div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[#ececec] bg-white shadow-[0_16px_40px_rgba(15,35,80,0.18)] dark:border-white/10 dark:bg-night-raised"
            onClick={(e) => e.stopPropagation()}
            variants={motionPrefs.sheet}
            initial={motionPrefs.sheet ? 'hidden' : false}
            animate="show"
            exit="exit"
          >
        <div className="flex items-center justify-between border-b border-[#ececec] p-4 dark:border-white/10">
          <h2 className="text-lg font-black tracking-[-0.03em] text-[#121212] dark:text-[#eef1f6]">
            Registro de {animalName}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#5a5a5a] hover:bg-[#f7f8fa] dark:text-[#9aa3b2] dark:hover:bg-night"
            aria-label="Cerrar"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {errors.submit && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                {errors.submit}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
                Estado <span className="text-red-600">*</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ANIMAL_LOGS_OPTIONS.map((opt) => {
                  const selected = status === opt.value;
                  const color = getStatusColor(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setStatus(opt.value)}
                      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${
                        selected
                          ? 'text-white'
                          : 'bg-[#f3f5f8] text-[#3a3a3a] hover:bg-kadesh-50 dark:bg-night dark:text-[#d0d0d0] dark:hover:bg-kadesh/20'
                      }`}
                      style={selected ? { backgroundColor: color } : undefined}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: selected ? '#ffffff' : color }}
                        aria-hidden
                      />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
                Fecha <span className="text-red-600">*</span>
              </label>
              <div className="mb-2 flex items-center gap-3">
                <input
                  id="isToday"
                  type="checkbox"
                  checked={isToday}
                  onChange={(e) => setIsToday(e.target.checked)}
                  className="h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
                />
                <label htmlFor="isToday" className="cursor-pointer text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
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

            <div>
              <label
                htmlFor="add-log-contactNumber"
                className="mb-2 block text-sm font-medium text-[#121212] dark:text-[#eef1f6]"
              >
                Teléfono <span className="text-red-600">*</span>
              </label>
              <input
                id="add-log-contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full rounded-xl border border-[#d8dee8] bg-[#f7f8fa] px-3 py-2 text-[#121212] placeholder:text-[#5a5a5a] focus:border-kadesh focus:outline-none focus:ring-2 focus:ring-kadesh/30 dark:border-white/12 dark:bg-night dark:text-[#eef1f6]"
                placeholder="55 1234 5678"
              />
              {errors.contactNumber && <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>}
            </div>

            <div>
              {errors.location && <p className="mb-2 text-xs text-red-600">{errors.location}</p>}
              {errors.address && <p className="mb-1 text-xs text-red-600">{errors.address}</p>}
              {errors.city && <p className="mb-1 text-xs text-red-600">{errors.city}</p>}
              {errors.state && <p className="mb-1 text-xs text-red-600">{errors.state}</p>}
              {errors.country && <p className="mb-2 text-xs text-red-600">{errors.country}</p>}
              <LocationPicker
                lat={lat}
                lng={lng}
                address={address}
                city={city}
                state={state}
                country={country}
                isVisible={isOpen}
                compact
                onLocationChange={handleLocationChange}
                onAddressChange={handleAddressChange}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="lastSeen"
                type="checkbox"
                checked={lastSeen}
                onChange={(e) => setLastSeen(e.target.checked)}
                className="h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
              />
              <label htmlFor="lastSeen" className="text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
                Última vez visto en esta ubicación
              </label>
            </div>

            <div>
              <label htmlFor="add-log-notes" className="mb-2 block text-sm font-medium text-[#121212] dark:text-[#eef1f6]">
                Nota <span className="text-red-600">*</span>
              </label>
              <textarea
                id="add-log-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-[#d8dee8] bg-[#f7f8fa] px-3 py-2 text-[#121212] placeholder:text-[#5a5a5a] focus:border-kadesh focus:outline-none focus:ring-2 focus:ring-kadesh/30 dark:border-white/12 dark:bg-night dark:text-[#eef1f6]"
                placeholder="Qué pasó o cómo reconocerlo en este punto"
              />
              {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
            </div>
          </div>

          <div className="flex gap-3 border-t border-[#ececec] p-4 dark:border-white/10">
            <motion.button
              type="button"
              onClick={handleClose}
              whileTap={motionPrefs.tap}
              className="min-h-11 flex-1 rounded-xl bg-[#f3f5f8] px-4 text-sm font-semibold text-[#121212] hover:bg-[#e6e9ef] dark:bg-night dark:text-[#eef1f6] dark:hover:bg-white/10"
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileTap={isSubmitting ? undefined : motionPrefs.tap}
              className="min-h-11 flex-1 rounded-xl bg-kadesh px-4 text-sm font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando…' : 'Guardar'}
            </motion.button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

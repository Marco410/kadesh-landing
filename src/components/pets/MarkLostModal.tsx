"use client";

import { useCallback, useEffect, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { sileo } from 'sileo';
import LocationPicker from 'kadesh/components/animals/nuevo/LocationPicker';
import { INPUT_CLASS, LABEL_CLASS } from 'kadesh/components/profile/clinics/formStyles';
import { useUser } from 'kadesh/utils/UserContext';
import { normalizeMxPhone } from 'kadesh/utils/phone';
import PetSheet from './PetSheet';
import { MARK_PET_AS_LOST_MUTATION, PET_REFETCH, type MarkPetAsLostResponse } from './queries';
import { petErrorMessage, todayYmd } from './utils';

interface MarkLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
  onReported?: (report: MarkPetAsLostResponse['markPetAsLost']) => void;
}

type Errors = Partial<Record<'date' | 'location' | 'phone', string>>;

/**
 * Publica el reporte de perdida con los datos y fotos de la cartilla (`markPetAsLost`). El reporte
 * es público como cualquier otro: lleva el teléfono que se pone aquí y avisa a la zona.
 */
export default function MarkLostModal({ isOpen, onClose, petId, petName, onReported }: MarkLostModalProps) {
  const client = useApolloClient();
  const { user } = useUser();
  const [date, setDate] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [markLost, { loading }] = useMutation<MarkPetAsLostResponse>(MARK_PET_AS_LOST_MUTATION);

  useEffect(() => {
    if (!isOpen) return;
    setDate(todayYmd());
    setLat('');
    setLng('');
    setAddress('');
    setCity('');
    setState('');
    setCountry('');
    setNotes('');
    setPhone(user?.phone ?? '');
    setErrors({});
    setSubmitError('');
    // Solo al abrir: no borrar lo escrito si se refresca el usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const handleSubmit = async () => {
    const next: Errors = {};
    if (!date) next.date = 'Elige cuándo la viste por última vez.';
    else if (date > todayYmd()) next.date = 'La fecha no puede ser posterior a hoy.';
    if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
      next.location = 'Fija el pin en el mapa o usa «Estoy aquí».';
    } else if (isResolvingPlace) {
      next.location = 'Estamos ubicando la zona. Espera un momento.';
    }
    const normalized = normalizeMxPhone(phone);
    if (!normalized.ok) next.phone = normalized.reason;
    setErrors(next);
    if (Object.keys(next).length > 0 || !normalized.ok) return;

    setSubmitError('');
    try {
      const result = await markLost({
        variables: {
          petId,
          lastSeenLocation: { lat, lng, address: address.trim() || [city, state].filter(Boolean).join(', ') },
          lastSeenDate: date,
          notes: notes.trim() || null,
          contactPhone: normalized.digits,
        },
      });
      await client.refetchQueries({ include: PET_REFETCH });
      sileo.success({
        title: `Publicamos el reporte de ${petName}`,
        description: 'Avisamos a quien tiene alertas en esa zona. Compártelo para que más gente lo vea.',
      });
      onClose();
      if (result.data?.markPetAsLost) onReported?.(result.data.markPetAsLost);
    } catch (error) {
      setSubmitError(petErrorMessage(error, 'No se pudo publicar el reporte. Intenta de nuevo.'));
    }
  };

  return (
    <PetSheet
      isOpen={isOpen}
      title={`Reportar a ${petName} como perdida`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Publicar reporte"
      isSubmitting={loading}
      error={submitError}
    >
      <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
        Publicaremos un reporte con su nombre, fotos y señas de la cartilla, y avisaremos a quien tenga alertas
        en esa zona. Cuando regrese, ciérralo con «Ya regresó a casa».
      </p>

      <div>
        <label htmlFor="lost-date" className={LABEL_CLASS}>
          ¿Cuándo la viste por última vez? <span className="text-red-600">*</span>
        </label>
        <input
          id="lost-date"
          type="date"
          value={date}
          max={todayYmd()}
          onChange={(event) => setDate(event.target.value)}
          className={INPUT_CLASS}
          aria-invalid={Boolean(errors.date)}
        />
        {errors.date ? <p className="mt-1 text-xs text-red-600">{errors.date}</p> : null}
      </div>

      <div>
        <p className={LABEL_CLASS}>
          ¿Dónde? <span className="text-red-600">*</span>
        </p>
        {errors.location ? <p className="mb-2 text-xs text-red-600">{errors.location}</p> : null}
        <LocationPicker
          compact
          isVisible={isOpen}
          lat={lat}
          lng={lng}
          address={address}
          city={city}
          state={state}
          country={country}
          onLocationChange={handleLocationChange}
          onAddressChange={handleAddressChange}
          onResolvingChange={setIsResolvingPlace}
        />
      </div>

      <div>
        <label htmlFor="lost-notes" className={LABEL_CLASS}>
          Notas
        </label>
        <textarea
          id="lost-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
          placeholder="Qué pasó, si llevaba collar, si se asusta…"
        />
      </div>

      <div>
        <label htmlFor="lost-phone" className={LABEL_CLASS}>
          Teléfono de contacto <span className="text-red-600">*</span>
        </label>
        <input
          id="lost-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={INPUT_CLASS}
          placeholder="10 dígitos"
          aria-invalid={Boolean(errors.phone)}
        />
        {errors.phone ? (
          <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
        ) : (
          <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Aparece en el reporte público para que te llamen si la ven.
          </p>
        )}
      </div>
    </PetSheet>
  );
}

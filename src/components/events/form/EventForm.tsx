'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import LocationPicker from 'kadesh/components/animals/nuevo/LocationPicker';
import PhotoPicker from 'kadesh/components/animals/nuevo/PhotoPicker';
import { usePhotoQueue } from 'kadesh/components/pets/hooks/usePhotoQueue';
import { Role } from 'kadesh/constants/constans';
import { Routes } from 'kadesh/core/routes';
import { cn } from 'kadesh/utils/cn';
import { useUser } from 'kadesh/utils/UserContext';
import {
  EVENT_ALERTS,
  EVENT_CATEGORIES,
  EVENT_LIMITS,
  EVENT_REACH_KM_OPTIONS,
  EVENT_SCOPES,
  EVENT_SPECIES,
} from '../constants';
import { timeZoneCityLabel } from '../format';
import { EVENT_SOCIAL_LINKS } from '../socialLinks';
import {
  CREATE_EVENT_PHOTOS_MUTATION,
  DELETE_EVENT_PHOTO_MUTATION,
  MY_VERIFIED_PLACES_QUERY,
  SUBMIT_EVENT_MUTATION,
  UPDATE_EVENT_MUTATION,
  type MyVerifiedPlacesResponse,
  type SubmitEventResponse,
  type UpdateEventResponse,
} from '../queries';
import type { EventFormValues, OwnPetEvent } from '../types';
import {
  EMPTY_EVENT_FORM,
  buildEventInput,
  eventToFormValues,
  formTimeZone,
  hasErrors,
  validateEventForm,
  type EventFormErrors,
} from './eventFormModel';
import SessionsEditor from './SessionsEditor';
import { errorClass, fieldClass, labelClass, sectionClass, textareaClass } from './styles';

type Stage = 'idle' | 'saving' | 'photos' | 'opening';

const STAGE_LABEL: Record<Stage, string> = {
  idle: '',
  saving: 'Guardando el evento…',
  photos: 'Subiendo fotos…',
  opening: 'Listo, abriendo…',
};

function apolloMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message.replace(/^.*?:\s*/, '') || 'Intenta de nuevo en un momento.';
  }
  return 'Intenta de nuevo en un momento.';
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={errorClass}>
      {message}
    </p>
  );
}

function SectionTitle({ step, title, hint }: { step: number; title: string; hint?: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-wide text-kadesh-700 dark:text-kadesh-300">Paso {step}</p>
      <h2 className="mt-1 text-xl font-bold text-[#121212] dark:text-white">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">{hint}</p> : null}
    </div>
  );
}

/**
 * Publicar o editar un evento. Un formulario en 5 partes (qué, dónde y a quién, cuándo, costo y
 * registro, quién organiza). Si no es admin, al enviarlo queda «En revisión».
 */
export default function EventForm({ event }: { event?: OwnPetEvent | null }) {
  const router = useRouter();
  const { user } = useUser();
  const isAdmin = Boolean(user?.roles?.some((role) => role.name === Role.ADMIN));
  const editing = Boolean(event);
  const [values, setValues] = useState<EventFormValues>(() => (event ? eventToFormValues(event) : EMPTY_EVENT_FORM));
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [stage, setStage] = useState<Stage>('idle');
  const submittingRef = useRef(false);
  const [petPlaceId, setPetPlaceId] = useState<string>(event?.petPlace?.id ?? '');
  const existingPhotos = useMemo(
    () => (event?.multimedia ?? []).filter((photo) => photo.image?.url),
    [event],
  );
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const keptPhotos = existingPhotos.filter((photo) => !removedPhotoIds.includes(photo.id));
  const photoQueue = usePhotoQueue(Math.max(EVENT_LIMITS.MAX_PHOTOS - keptPhotos.length, 0));

  const { data: placesData } = useQuery<MyVerifiedPlacesResponse>(MY_VERIFIED_PLACES_QUERY, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });
  const places = placesData?.petPlaces ?? [];

  const [submitEvent] = useMutation<SubmitEventResponse>(SUBMIT_EVENT_MUTATION);
  const [updateEvent] = useMutation<UpdateEventResponse>(UPDATE_EVENT_MUTATION);
  const [createPhotos] = useMutation(CREATE_EVENT_PHOTOS_MUTATION);
  const [deletePhoto] = useMutation(DELETE_EVENT_PHOTO_MUTATION);

  const timeZone = formTimeZone(values);
  const originalSessions = useMemo(() => event?.sessions ?? [], [event]);

  // El primer error visible se lleva el foco.
  useEffect(() => {
    if (!hasErrors(errors)) return;
    const first = document.querySelector('[data-event-form] [role="alert"]');
    first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [errors]);

  const update = (patch: Partial<EventFormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key as keyof EventFormErrors];
      if ('lat' in patch || 'lng' in patch) delete next.location;
      return next;
    });
  };

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    if (submittingRef.current) return;
    const found = validateEventForm(values, { originalSessions, isAdmin });
    setErrors(found);
    if (hasErrors(found)) {
      sileo.error({ title: 'Revisa el formulario', description: 'Hay datos que faltan o no cuadran.' });
      return;
    }

    submittingRef.current = true;
    setStage('saving');
    let done = false;
    try {
      const input = buildEventInput(values, petPlaceId || null);
      const result = editing
        ? (await updateEvent({ variables: { id: event!.id, input } })).data?.updateMyPetEvent
        : (await submitEvent({ variables: { input } })).data?.submitPetEvent;
      if (!result?.success || !result.event) {
        sileo.error({ title: 'No se pudo guardar', description: result?.message ?? 'Intenta de nuevo en un momento.' });
        return;
      }
      const eventId = result.event.id;

      if (removedPhotoIds.length > 0 || photoQueue.photos.length > 0) {
        setStage('photos');
        for (const id of removedPhotoIds) await deletePhoto({ variables: { id } });
        if (photoQueue.photos.length > 0) {
          const startOrder = keptPhotos.reduce((max, photo) => Math.max(max, photo.order ?? 0), 0);
          await createPhotos({
            variables: {
              data: photoQueue.photos.map((photo, index) => ({
                event: { connect: { id: eventId } },
                image: { upload: photo.file },
                order: startOrder + index + 1,
              })),
            },
          });
        }
      }

      done = true;
      setStage('opening');
      sileo.success({ title: editing ? 'Cambios guardados' : 'Evento enviado', description: result.message });
      const published = result.event.status === 'approved';
      router.push(published && result.event.slug ? Routes.events.detail(result.event.slug) : Routes.events.mine);
    } catch (error) {
      sileo.error({ title: 'No se pudo guardar', description: apolloMessage(error) });
    } finally {
      // Con éxito el botón sigue ocupado hasta que abre la otra página (no se envía dos veces).
      if (!done) {
        submittingRef.current = false;
        setStage('idle');
      }
    }
  };

  const busy = stage !== 'idle';
  const scopeHint = (() => {
    switch (values.scope) {
      case 'zone':
        return `Avisaremos a quienes tienen su zona de alertas a unos ${values.reachKm} km del lugar.`;
      case 'city':
        return values.city ? `Avisaremos a quienes tienen su zona de alertas en ${values.city}.` : 'Marca el lugar en el mapa para saber el municipio.';
      case 'state':
        return values.state ? `Avisaremos a quienes tienen su zona de alertas en ${values.state}.` : 'Marca el lugar en el mapa para saber el estado.';
      default:
        return 'Avisaremos a todas las personas con zona de alertas.';
    }
  })();

  return (
    <form data-event-form onSubmit={(formEvent) => void handleSubmit(formEvent)} noValidate className="space-y-6">
      <section className={sectionClass}>
        <SectionTitle step={1} title="¿Qué evento es?" />
        <fieldset>
          <legend className={labelClass}>Tipo de evento</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {EVENT_CATEGORIES.map((category) => {
              const active = values.category === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: category.value })}
                  className={cn(
                    'flex min-h-12 items-center gap-2 rounded-xl border px-3 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh',
                    active
                      ? 'border-transparent text-white'
                      : 'border-[#d8dee8] bg-white text-[#3a3a3a] hover:border-kadesh dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]',
                  )}
                  style={active ? { backgroundColor: category.color } : undefined}
                >
                  <HugeiconsIcon icon={category.icon} size={18} aria-hidden />
                  {category.label}
                </button>
              );
            })}
          </div>
          <FieldError id="evento-tipo-error" message={errors.category} />
        </fieldset>

        <label className={cn(labelClass, 'mt-5')}>
          Título
          <input
            className={fieldClass}
            value={values.title}
            maxLength={EVENT_LIMITS.TITLE_MAX}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Campaña de esterilización gratuita para perros y gatos"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'evento-titulo-error' : undefined}
          />
        </label>
        <FieldError id="evento-titulo-error" message={errors.title} />

        <label className={cn(labelClass, 'mt-5')}>
          De qué se trata
          <textarea
            className={textareaClass('min-h-36')}
            value={values.description}
            maxLength={EVENT_LIMITS.DESCRIPTION_MAX}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Qué se va a hacer, a quién va dirigido, cuántos lugares hay, cómo funciona…"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'evento-descripcion-error' : undefined}
          />
        </label>
        <div className="mt-1 flex justify-between gap-2">
          <FieldError id="evento-descripcion-error" message={errors.description} />
          <span className="ml-auto text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            {values.description.length}/{EVENT_LIMITS.DESCRIPTION_MAX}
          </span>
        </div>

        <fieldset className="mt-5">
          <legend className={labelClass}>Para qué animales (opcional)</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {EVENT_SPECIES.map((species) => (
              <label key={species.value} className="inline-flex min-h-11 items-center gap-2 text-sm text-[#3a3a3a] dark:text-[#d0d0d0]">
                <input
                  type="checkbox"
                  className="size-4 accent-kadesh"
                  checked={values.species.includes(species.value)}
                  onChange={(e) =>
                    update({
                      species: e.target.checked
                        ? [...values.species, species.value]
                        : values.species.filter((value) => value !== species.value),
                    })
                  }
                />
                {species.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5">
          <p className={labelClass}>Fotos o cartel (opcional, hasta {EVENT_LIMITS.MAX_PHOTOS})</p>
          <p className="mt-0.5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">La primera es la portada.</p>
          {keptPhotos.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {keptPhotos.map((photo) => (
                <li key={photo.id} className="relative size-24 overflow-hidden rounded-xl bg-[#e8edf3]">
                  <Image src={photo.image?.url as string} alt="" fill className="object-cover" sizes="96px" />
                  <button
                    type="button"
                    onClick={() => setRemovedPhotoIds((ids) => [...ids, photo.id])}
                    aria-label="Quitar foto"
                    className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3">
            <PhotoPicker
              images={photoQueue.photos}
              max={Math.max(EVENT_LIMITS.MAX_PHOTOS - keptPhotos.length, 0)}
              onAdd={(files) => void photoQueue.add(files)}
              onRemove={photoQueue.remove}
              onReorder={photoQueue.reorder}
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle step={2} title="¿Dónde y para quién?" hint="Busca la dirección o toca el mapa para poner el pin." />
        <LocationPicker
          lat={values.lat}
          lng={values.lng}
          address={values.address}
          city={values.city}
          state={values.state}
          onLocationChange={(lat, lng) => update({ lat, lng })}
          onAddressChange={(address, city, state) => update({ address, city, state })}
          onPlaceDetails={({ neighborhood }) => update({ neighborhood })}
        />
        <FieldError id="evento-lugar-error" message={errors.location} />
        {values.city || values.state ? (
          <p className="mt-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            {[values.city, values.state].filter(Boolean).join(', ')}
          </p>
        ) : null}

        <label className={cn(labelClass, 'mt-5')}>
          Nombre del lugar (opcional)
          <input
            className={fieldClass}
            value={values.placeLabel}
            maxLength={EVENT_LIMITS.PLACE_LABEL_MAX}
            onChange={(e) => update({ placeLabel: e.target.value })}
            placeholder="Explanada del Jardín Morelos"
          />
        </label>

        <fieldset className="mt-6">
          <legend className={labelClass}>¿A quién le avisamos?</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EVENT_SCOPES.filter((scope) => !scope.adminOnly || isAdmin).map((scope) => {
              const active = values.scope === scope.value;
              return (
                <label
                  key={scope.value}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                    active
                      ? 'border-kadesh bg-kadesh-50 dark:bg-kadesh/10'
                      : 'border-[#d8dee8] bg-white hover:border-kadesh dark:border-white/15 dark:bg-night',
                  )}
                >
                  <input
                    type="radio"
                    name="event-scope"
                    className="mt-1 size-4 accent-kadesh"
                    checked={active}
                    onChange={() => update({ scope: scope.value })}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#121212] dark:text-white">{scope.label}</span>
                    <span className="mt-0.5 block text-[13px] text-[#5a5a5a] dark:text-[#9aa3b2]">{scope.hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {values.scope === 'zone' ? (
            <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Radio de la zona">
              {EVENT_REACH_KM_OPTIONS.map((km) => (
                <button
                  key={km}
                  type="button"
                  aria-pressed={values.reachKm === km}
                  onClick={() => update({ reachKm: km })}
                  className={cn(
                    'min-h-10 rounded-full border px-4 text-sm font-semibold',
                    values.reachKm === km
                      ? 'border-kadesh bg-kadesh text-white'
                      : 'border-[#d8dee8] bg-white text-[#3a3a3a] dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]',
                  )}
                >
                  {km} km
                </button>
              ))}
            </div>
          ) : null}
          <FieldError id="evento-alcance-error" message={errors.scope} />
          <p className="mt-3 flex items-start gap-2 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            <HugeiconsIcon icon={InformationCircleIcon} size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              {scopeHint} El aviso sale al publicarse (o {EVENT_ALERTS.LEAD_DAYS} días antes, si falta más) y cada
              persona recibe como máximo {EVENT_ALERTS.MAX_PER_DAY} al día.
            </span>
          </p>
        </fieldset>
      </section>

      <section className={sectionClass}>
        <SectionTitle step={3} title="¿Cuándo?" hint="Si se repite o dura varios días, agrega todas las fechas." />
        <SessionsEditor
          sessions={values.sessions}
          onChange={(sessions) => update({ sessions })}
          timeZone={timeZone}
          timeZoneLabel={timeZoneCityLabel(timeZone)}
          rowErrors={errors.sessionRows}
          error={errors.sessions}
        />
      </section>

      <section className={sectionClass}>
        <SectionTitle step={4} title="Costo, cupo y registro" />
        <fieldset>
          <legend className={labelClass}>Costo</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { value: true, label: 'Gratis' },
              { value: false, label: 'Con costo o cuota' },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={values.isFree === option.value}
                onClick={() => update({ isFree: option.value })}
                className={cn(
                  'min-h-11 rounded-full border px-5 text-sm font-semibold',
                  values.isFree === option.value
                    ? 'border-kadesh bg-kadesh text-white'
                    : 'border-[#d8dee8] bg-white text-[#3a3a3a] dark:border-white/15 dark:bg-night dark:text-[#d0d0d0]',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        {!values.isFree ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
            <label className={labelClass}>
              Precio (MXN)
              <input
                className={fieldClass}
                inputMode="numeric"
                value={values.price}
                onChange={(e) => update({ price: e.target.value.replace(/[^\d]/g, '') })}
                placeholder="150"
              />
            </label>
            <label className={labelClass}>
              Nota (opcional)
              <input
                className={fieldClass}
                value={values.priceNote}
                maxLength={EVENT_LIMITS.PRICE_NOTE_MAX}
                onChange={(e) => update({ priceNote: e.target.value })}
                placeholder="Cuota de recuperación por animal"
              />
            </label>
          </div>
        ) : null}
        <FieldError id="evento-precio-error" message={errors.price} />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Cupo (opcional)
            <input
              className={fieldClass}
              inputMode="numeric"
              value={values.capacity}
              onChange={(e) => update({ capacity: e.target.value.replace(/[^\d]/g, '') })}
              placeholder="Sin límite"
            />
            <span className="mt-1 block text-xs font-normal text-[#5a5a5a] dark:text-[#9aa3b2]">
              Al llenarse se cierra «Asistiré».
            </span>
            <FieldError id="evento-cupo-error" message={errors.capacity} />
          </label>
          <div aria-hidden className="hidden sm:block" />
          <label className={labelClass}>
            Link de registro (opcional)
            <input
              className={fieldClass}
              type="url"
              value={values.registrationUrl}
              onChange={(e) => update({ registrationUrl: e.target.value })}
              placeholder="https://forms.gle/…"
            />
            <FieldError id="evento-link-error" message={errors.registrationUrl} />
          </label>
          <label className={labelClass}>
            WhatsApp para registrarse (opcional)
            <input
              className={fieldClass}
              type="tel"
              inputMode="tel"
              value={values.registrationWhatsapp}
              onChange={(e) => update({ registrationWhatsapp: e.target.value })}
              placeholder="443 123 4567"
            />
            <FieldError id="evento-whatsapp-error" message={errors.registrationWhatsapp} />
          </label>
        </div>

        <label className={cn(labelClass, 'mt-5')}>
          Requisitos (opcional)
          <textarea
            className={textareaClass('min-h-24')}
            value={values.requirements}
            maxLength={EVENT_LIMITS.REQUIREMENTS_MAX}
            onChange={(e) => update({ requirements: e.target.value })}
            placeholder="Ayuno de 8 horas, mayores de 4 meses, llevar correa o transportadora…"
          />
        </label>
      </section>

      <section className={sectionClass}>
        <SectionTitle step={5} title="¿Quién lo organiza?" hint="Para que la gente sepa a quién preguntar." />
        {places.length > 0 ? (
          <label className={cn(labelClass, 'mb-4')}>
            Lo organiza mi veterinaria (opcional)
            <select className={fieldClass} value={petPlaceId} onChange={(e) => setPetPlaceId(e.target.value)}>
              <option value="">No, otra organización o persona</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Organiza (opcional)
            <input
              className={fieldClass}
              value={values.organizerName}
              maxLength={EVENT_LIMITS.ORGANIZER_MAX}
              onChange={(e) => update({ organizerName: e.target.value })}
              placeholder="Asociación, municipio, refugio…"
            />
          </label>
          <label className={labelClass}>
            Teléfono de contacto (opcional)
            <input
              className={fieldClass}
              type="tel"
              inputMode="tel"
              value={values.contactPhone}
              onChange={(e) => update({ contactPhone: e.target.value })}
              placeholder="443 123 4567"
            />
            <FieldError id="evento-telefono-error" message={errors.contactPhone} />
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className={labelClass}>Redes sociales del evento (opcional)</legend>
          <p className="mt-0.5 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            Pega el link o escribe el usuario (@tu_cuenta). Se muestran en la ficha para que la gente los siga.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {EVENT_SOCIAL_LINKS.map((social) => {
              const errorId = `evento-${social.field}-error`;
              return (
                <label key={social.field} className={labelClass}>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon icon={social.icon} size={16} aria-hidden />
                    {social.label}
                  </span>
                  <input
                    className={fieldClass}
                    type={social.profileBase ? 'text' : 'url'}
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={values[social.field]}
                    onChange={(e) => update({ [social.field]: e.target.value })}
                    placeholder={social.placeholder}
                    aria-invalid={Boolean(errors[social.field])}
                    aria-describedby={errors[social.field] ? errorId : undefined}
                  />
                  <FieldError id={errorId} message={errors[social.field]} />
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-[#ececec] bg-white/95 px-4 py-4 backdrop-blur dark:border-[#2a2a2a] dark:bg-night/95 sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
            {isAdmin
              ? 'Como admin, se publica en cuanto lo guardes.'
              : editing && event?.status === 'approved'
                ? 'Al guardar, el evento vuelve a revisión antes de publicarse otra vez.'
                : 'El equipo de Kadesh lo revisa antes de publicarlo y te avisamos en cuanto esté listo.'}
          </p>
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-kadesh px-7 font-semibold text-white hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
          >
            {busy ? STAGE_LABEL[stage] : editing ? 'Guardar cambios' : isAdmin ? 'Publicar evento' : 'Enviar a revisión'}
          </button>
        </div>
      </div>
    </form>
  );
}

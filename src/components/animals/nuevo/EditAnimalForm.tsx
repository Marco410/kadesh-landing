"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { sileo } from 'sileo';
import {
  CREATE_ANIMAL_MULTIMEDIA_MUTATION,
  DELETE_ANIMAL_MULTIMEDIAS_MUTATION,
  UPDATE_ANIMAL_LOG_MUTATION,
  UPDATE_ANIMAL_MULTIMEDIAS_MUTATION,
  UPDATE_ANIMAL_MUTATION,
} from 'kadesh/components/animals/queries';
import type { AnimalDetail } from 'kadesh/components/animals/detail';
import LocationPicker from 'kadesh/components/animals/nuevo/LocationPicker';
import AnimalNameInput from 'kadesh/components/animals/nuevo/AnimalNameInput';
import AnimalTypeSelector from 'kadesh/components/animals/nuevo/AnimalTypeSelector';
import AnimalBreedPicker from 'kadesh/components/animals/nuevo/AnimalBreedPicker';
import PhotoPicker from 'kadesh/components/animals/nuevo/PhotoPicker';
import ChoiceChip from 'kadesh/components/animals/nuevo/ChoiceChip';
import StatusChips from 'kadesh/components/animals/StatusChips';
import { Routes } from 'kadesh/core/routes';
import {
  ANIMAL_AGE_OPTIONS,
  ANIMAL_SEX_OPTIONS,
  ANIMAL_SIZE_OPTIONS,
  isAnimalReportStatus,
  type AnimalReportStatus,
} from 'kadesh/components/animals/constants';

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]';
const labelClass = 'mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]';

interface PhotoItem {
  id?: string;
  file?: File;
  preview: string;
}

interface FieldErrors {
  name?: string;
  animalBreedId?: string;
  location?: string;
  contactNumber?: string;
}

function toDateTimeLocal(value?: string | null): string {
  const date = value ? new Date(value) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    const first = (error as { graphQLErrors?: { message?: string }[] }).graphQLErrors?.[0]?.message;
    if (first) return first.split('\n')[0];
  }
  return error instanceof Error && error.message ? error.message : 'Ocurrió un error inesperado.';
}

export default function EditAnimalForm({ animal }: { animal: AnimalDetail }) {
  const router = useRouter();
  const log = animal.logs?.[0];

  const [name, setName] = useState(animal.name ?? '');
  const [animalTypeId, setAnimalTypeId] = useState(animal.animal_breed?.animal_type?.id ?? '');
  const [animalBreedId, setAnimalBreedId] = useState(animal.animal_breed?.id ?? '');
  const [sex, setSex] = useState(animal.sex || 'unknown');
  const [age, setAge] = useState(animal.age ?? '');
  const [size, setSize] = useState(animal.size ?? '');
  const [color, setColor] = useState(animal.color ?? '');
  const [physicalDescription, setPhysicalDescription] = useState(animal.physical_description ?? '');
  const [contactNumber, setContactNumber] = useState(animal.contactNumber ?? '');
  const [status, setStatus] = useState<AnimalReportStatus>(
    isAnimalReportStatus(log?.status) ? log.status : 'lost'
  );
  const [dateStatus, setDateStatus] = useState(toDateTimeLocal(log?.date_status ?? log?.createdAt));
  const [notes, setNotes] = useState(log?.notes ?? '');
  const [lat, setLat] = useState(log?.lat != null ? String(log.lat) : '');
  const [lng, setLng] = useState(log?.lng != null ? String(log.lng) : '');
  const [address, setAddress] = useState(log?.address ?? '');
  const [city, setCity] = useState(log?.city ?? '');
  const [state, setState] = useState(log?.state ?? '');
  const [country, setCountry] = useState(log?.country ?? '');
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    animal.multimedia.map((item) => ({ id: item.id, preview: item.image.url }))
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(
    () => () => {
      photosRef.current.forEach((p) => p.file && URL.revokeObjectURL(p.preview));
    },
    []
  );

  const [updateAnimal] = useMutation(UPDATE_ANIMAL_MUTATION);
  const [updateAnimalLog] = useMutation(UPDATE_ANIMAL_LOG_MUTATION);
  const [updateMultimedias] = useMutation(UPDATE_ANIMAL_MULTIMEDIAS_MUTATION);
  const [deleteMultimedias] = useMutation(DELETE_ANIMAL_MULTIMEDIAS_MUTATION);
  const [createMultimedias] = useMutation(CREATE_ANIMAL_MULTIMEDIA_MUTATION);

  const addImages = (files: File[]) => {
    const room = MAX_IMAGES - photos.length;
    if (room <= 0) {
      sileo.error({ title: 'Ya hay 3 fotos', description: 'Quita una para agregar otra.' });
      return;
    }
    const valid = files.filter(
      (f) => (f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(f.name)) && f.size <= MAX_IMAGE_BYTES
    );
    if (valid.length < files.length) {
      sileo.error({ title: 'Foto no válida', description: 'Usa imágenes de 5 MB o menos.' });
    }
    const take = valid.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    if (take.length) setPhotos((cur) => [...cur, ...take]);
  };

  const removeImage = (index: number) => {
    setPhotos((cur) => {
      const victim = cur[index];
      if (victim?.file) URL.revokeObjectURL(victim.preview);
      return cur.filter((_, i) => i !== index);
    });
  };

  const reorderImages = (from: number, to: number) => {
    if (from === to) return;
    setPhotos((cur) => {
      if (from < 0 || to < 0 || from >= cur.length || to >= cur.length) return cur;
      const next = [...cur];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const validate = () => {
    const next: FieldErrors = {};
    const missing: string[] = [];
    if (!name.trim()) {
      next.name = 'Escribe un nombre o marca que no tiene.';
      missing.push('Nombre');
    }
    if (!animalBreedId) {
      next.animalBreedId = 'Elige una raza o pulsa No sé.';
      missing.push('Raza');
    }
    if (!lat.trim() || !lng.trim()) {
      next.location = 'Fija el pin en el mapa.';
      missing.push('Ubicación');
    }
    if (!contactNumber.trim()) {
      next.contactNumber = 'Un teléfono para que te contacten.';
      missing.push('Teléfono');
    }
    setErrors(next);
    if (missing.length) {
      sileo.error({
        title: 'Faltan campos por completar',
        description: missing.join(', '),
      });
    }
    return missing.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await updateAnimal({
        variables: {
          where: { id: animal.id },
          data: {
            name: name.trim() || 'Sin nombre',
            contactNumber: contactNumber.trim(),
            sex,
            physical_description: physicalDescription.trim(),
            age: age.trim() || null,
            color: color.trim() || null,
            size: size.trim() || null,
            animal_type: { connect: { id: animalTypeId } },
            animal_breed: { connect: { id: animalBreedId } },
          },
        },
      });

      if (log?.id) {
        await updateAnimalLog({
          variables: {
            where: { id: log.id },
            data: {
              status,
              notes: notes.trim() || 'Sin información adicional',
              lat,
              lng,
              address: address.trim() || null,
              city: city.trim() || null,
              state: state.trim() || null,
              country: country.trim() || null,
              last_seen: status !== 'in_adoption',
              date_status: dateStatus ? new Date(dateStatus).toISOString() : null,
            },
          },
        });
      }

      const keptIds = new Set(photos.filter((p) => p.id).map((p) => p.id));
      const removed = animal.multimedia.filter((m) => m.id && !keptIds.has(m.id));
      if (removed.length) {
        await deleteMultimedias({ variables: { where: removed.map((m) => ({ id: m.id })) } });
      }

      const existing = photos
        .map((p, index) => ({ p, order: index + 1 }))
        .filter(({ p }) => p.id);
      if (existing.length) {
        await updateMultimedias({
          variables: {
            data: existing.map(({ p, order }) => ({ where: { id: p.id }, data: { order } })),
          },
        });
      }

      const added = photos
        .map((p, index) => ({ p, order: index + 1 }))
        .filter(({ p }) => p.file);
      if (added.length) {
        await createMultimedias({
          variables: {
            data: added.map(({ p, order }) => ({
              animal: { connect: { id: animal.id } },
              image: { upload: p.file },
              order,
            })),
          },
        });
      }

      sileo.success({ title: 'Cambios guardados' });
      router.push(Routes.animals.detail(data?.updateAnimal?.slug || animal.slug || animal.id));
    } catch (error) {
      sileo.error({ title: 'No se pudo guardar', description: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => router.push(Routes.animals.detail(animal.slug || animal.id));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <header className="shrink-0 border-b border-[#e6e9ef] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="Volver al detalle"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#121212] hover:bg-[#f3f5f8] dark:text-[#eef1f6] dark:hover:bg-night"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={1.5} />
          </button>
          <h1 className="truncate text-lg font-black tracking-tight text-[#121212] dark:text-[#eef1f6] sm:text-xl">
            Editar a {animal.name || 'este animal'}
          </h1>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-5 sm:px-6 sm:py-6">
          <section className="space-y-6">
            <div>
              <p className={labelClass}>Fotos</p>
              <p className="mb-3 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                Arrastra para elegir la portada. Hasta {MAX_IMAGES}.
              </p>
              <PhotoPicker
                images={photos}
                max={MAX_IMAGES}
                onAdd={addImages}
                onRemove={removeImage}
                onReorder={reorderImages}
              />
            </div>
            <AnimalTypeSelector
              alwaysExpanded
              selectedTypeId={animalTypeId}
              onTypeChange={(typeId) => {
                setAnimalTypeId(typeId);
                setAnimalBreedId('');
              }}
            />
            <AnimalNameInput value={name} onChange={setName} required error={errors.name} />
          </section>

          <section className="space-y-6">
            <div>
              <p className={labelClass}>Tamaño</p>
              <div className="flex flex-wrap gap-1.5">
                {ANIMAL_SIZE_OPTIONS.map((o) => (
                  <ChoiceChip key={o.value} label={o.label} selected={size === o.value} onSelect={() => setSize(o.value)} />
                ))}
              </div>
            </div>
            <div>
              <p className={labelClass}>Edad</p>
              <div className="flex flex-wrap gap-1.5">
                {ANIMAL_AGE_OPTIONS.map((o) => (
                  <ChoiceChip key={o.value} label={o.label} selected={age === o.value} onSelect={() => setAge(o.value)} />
                ))}
              </div>
            </div>
            <div>
              <p className={labelClass}>Sexo</p>
              <div className="flex flex-wrap gap-1.5">
                {ANIMAL_SEX_OPTIONS.map((o) => (
                  <ChoiceChip key={o.value} label={o.label} selected={sex === o.value} onSelect={() => setSex(o.value)} />
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="color" className={labelClass}>Color</label>
              <input id="color" type="text" value={color} onChange={(e) => setColor(e.target.value)} className={fieldClass} />
            </div>
            <AnimalBreedPicker
              animalTypeId={animalTypeId}
              value={animalBreedId}
              onChange={setAnimalBreedId}
              required
              error={errors.animalBreedId}
            />
            <div>
              <label htmlFor="physicalDescription" className={labelClass}>Señas particulares</label>
              <textarea
                id="physicalDescription"
                value={physicalDescription}
                onChange={(e) => setPhysicalDescription(e.target.value)}
                rows={3}
                className={`${fieldClass} resize-none`}
              />
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <p id="edit-status-label" className={labelClass}>Estado</p>
              <StatusChips
                value={status}
                labelledBy="edit-status-label"
                allowDeselect={false}
                showAll
                onChange={(next) => {
                  if (isAnimalReportStatus(next)) setStatus(next);
                }}
              />
            </div>
            <div>
              <label htmlFor="dateStatus" className={labelClass}>Fecha</label>
              <input
                id="dateStatus"
                type="datetime-local"
                value={dateStatus}
                onChange={(e) => setDateStatus(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className={errors.location ? 'rounded-xl ring-1 ring-red-500 ring-offset-2 dark:ring-offset-night' : ''}>
              <LocationPicker
                compact
                lat={lat}
                lng={lng}
                address={address}
                city={city}
                state={state}
                country={country}
                onLocationChange={(a, b) => {
                  setLat(a);
                  setLng(b);
                }}
                onAddressChange={(a, c, s, co) => {
                  setAddress(a);
                  setCity(c);
                  setState(s);
                  setCountry(co);
                }}
              />
              {errors.location ? <p className="mt-2 text-xs text-red-600">{errors.location}</p> : null}
            </div>
            <div>
              <label htmlFor="contactNumber" className={labelClass}>Teléfono</label>
              <input
                id="contactNumber"
                type="tel"
                inputMode="tel"
                maxLength={18}
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className={fieldClass}
                autoComplete="tel"
              />
              {errors.contactNumber ? <p className="mt-2 text-xs text-red-600">{errors.contactNumber}</p> : null}
            </div>
            <div>
              <label htmlFor="notes" className={labelClass}>Nota</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`${fieldClass} resize-none`}
              />
            </div>
          </section>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#e6e9ef] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised sm:px-6">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button
            type="button"
            onClick={goBack}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] dark:text-[#d0d0d0] dark:hover:bg-night"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-kadesh px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  );
}

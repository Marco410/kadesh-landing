"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import {
  CREATE_ANIMAL_MUTATION,
  CREATE_ANIMAL_LOG_MUTATION,
  CREATE_ANIMAL_MULTIMEDIA_MUTATION,
} from 'kadesh/components/animals/queries';
import { useUser } from 'kadesh/utils/UserContext';
import LocationPicker from 'kadesh/components/animals/nuevo/LocationPicker';
import AnimalNameInput from 'kadesh/components/animals/nuevo/AnimalNameInput';
import AnimalTypeSelector from 'kadesh/components/animals/nuevo/AnimalTypeSelector';
import AnimalBreedPicker from 'kadesh/components/animals/nuevo/AnimalBreedPicker';
import PhotoPicker from 'kadesh/components/animals/nuevo/PhotoPicker';
import ReportStepper from 'kadesh/components/animals/nuevo/ReportStepper';
import NewAnimalFormSkeleton from 'kadesh/components/animals/nuevo/NewAnimalFormSkeleton';
import StatusChips from 'kadesh/components/animals/StatusChips';
import { sileo } from 'sileo';
import { Routes } from 'kadesh/core/routes';
import { gsap, useGSAP, HOME_EASE } from 'kadesh/components/home/gsap-register';
import ChoiceChip from 'kadesh/components/animals/nuevo/ChoiceChip';
import { AnimatePresence, motion } from 'framer-motion';
import { useUiMotion } from 'kadesh/components/shared/motion';
import {
  ANIMAL_AGE_OPTIONS,
  ANIMAL_SEX_OPTIONS,
  ANIMAL_SIZE_OPTIONS,
  REPORT_COPY,
  UNNAMED_BY_DEFAULT_STATUSES,
  getStatusLabel,
  isAnimalReportStatus,
  type AnimalReportStatus,
} from 'kadesh/components/animals/constants';
import {
  clearAnimalReportDraft,
  dataUrlToFile,
  fileToDataUrl,
  loadAnimalReportDraft,
  saveAnimalReportDraft,
} from 'kadesh/components/animals/nuevo/reportDraft';

const STEPS = ['Foto y tipo', 'Cómo reconocerlo', 'Dónde'] as const;
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const fieldClass =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]';

interface ImagePreview {
  file: File;
  preview: string;
}

interface FieldErrors {
  name?: string;
  animalTypeId?: string;
  animalBreedId?: string;
  status?: string;
  location?: string;
  contactNumber?: string;
  age?: string;
  color?: string;
  size?: string;
  physicalDescription?: string;
}

function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function isValidName(name: string) {
  return name === 'Sin nombre' || name.trim() !== '';
}

function publishErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    const first = (error as { graphQLErrors?: { message?: string }[] })
      .graphQLErrors?.[0]?.message;
    if (first) return first.split('\n')[0];
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error inesperado.';
}

export default function NewAnimalForm({
  initialStatus,
}: {
  initialStatus?: string | null;
}) {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(0);
  const skipStepMotion = useRef(true);
  const skipDraftSave = useRef(true);

  const resolvedStatus: AnimalReportStatus = isAnimalReportStatus(initialStatus)
    ? initialStatus
    : 'lost';

  const [name, setName] = useState(
    UNNAMED_BY_DEFAULT_STATUSES.includes(resolvedStatus) ? 'Sin nombre' : ''
  );
  const [animalTypeId, setAnimalTypeId] = useState('');
  const [animalBreedId, setAnimalBreedId] = useState('');
  const [sex, setSex] = useState('unknown');
  const [status, setStatus] = useState<AnimalReportStatus>(resolvedStatus);
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone ?? '');
  const [dateStatus, setDateStatus] = useState(formatDateTimeLocal(new Date()));
  const [isToday, setIsToday] = useState(true);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const copy = REPORT_COPY[status];
  const unnamedByDefault = UNNAMED_BY_DEFAULT_STATUSES.includes(status);
  const lastSeen = status !== 'in_adoption';
  const motionPrefs = useUiMotion();

  useGSAP(
    () => {
      const el = panelRef.current;
      if (!el || !hydrated) return;

      if (skipStepMotion.current) {
        skipStepMotion.current = false;
        prevStepRef.current = step;
        gsap.set(el, { autoAlpha: 1, x: 0 });
        return;
      }

      const goingForward = step >= prevStepRef.current;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(el, { autoAlpha: 1, x: 0 });
      } else {
        gsap.fromTo(
          el,
          { autoAlpha: 0, x: goingForward ? 22 : -22 },
          { autoAlpha: 1, x: 0, duration: 0.28, ease: HOME_EASE, overwrite: 'auto' }
        );
      }

      prevStepRef.current = step;
    },
    { dependencies: [step, hydrated], scope: panelRef, revertOnUpdate: false }
  );

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    void loadAnimalReportDraft(user.id).then((draft) => {
      if (cancelled) return;
      if (draft) {
        setStep(Math.min(Math.max(draft.step, 0), STEPS.length - 1));
        setShowNotes(draft.showNotes || Boolean(draft.notes));
        setName(draft.name);
        setAnimalTypeId(draft.animalTypeId);
        setAnimalBreedId(draft.animalBreedId);
        setSex(draft.sex || 'unknown');
        if (isAnimalReportStatus(draft.status)) setStatus(draft.status);
        setPhysicalDescription(draft.physicalDescription);
        setAge(draft.age);
        setColor(draft.color);
        setSize(draft.size);
        setLat(draft.lat);
        setLng(draft.lng);
        setAddress(draft.address);
        setCity(draft.city);
        setState(draft.state);
        setCountry(draft.country);
        setNotes(draft.notes);
        if (draft.contactNumber) setContactNumber(draft.contactNumber);
        setDateStatus(draft.dateStatus || formatDateTimeLocal(new Date()));
        setIsToday(draft.isToday);
        const restored = draft.images
          .slice(0, MAX_IMAGES)
          .map((image) => {
            const file = dataUrlToFile(image.dataUrl, image.name, image.type);
            return { file, preview: URL.createObjectURL(file) };
          });
        setImages(restored);
        prevStepRef.current = Math.min(Math.max(draft.step, 0), STEPS.length - 1);
      } else if (user.phone && !contactNumber) {
        setContactNumber(user.phone);
      }
      setHydrated(true);
      skipDraftSave.current = false;
    });

    return () => {
      cancelled = true;
    };
    // Restore once per user session on this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!hydrated || skipDraftSave.current || !user?.id) return;

    const handle = window.setTimeout(() => {
      void (async () => {
        const storedImages = await Promise.all(
          images.map(async (image) => ({
            name: image.file.name,
            type: image.file.type,
            dataUrl: await fileToDataUrl(image.file),
          }))
        );
        await saveAnimalReportDraft(user.id, {
          v: 1,
          step,
          showNotes,
          name,
          animalTypeId,
          animalBreedId,
          sex,
          status,
          physicalDescription,
          age,
          color,
          size,
          lat,
          lng,
          address,
          city,
          state,
          country,
          notes,
          contactNumber,
          dateStatus,
          isToday,
          images: storedImages,
        });
      })();
    }, 400);

    return () => window.clearTimeout(handle);
  }, [
    hydrated,
    user?.id,
    step,
    showNotes,
    name,
    animalTypeId,
    animalBreedId,
    sex,
    status,
    physicalDescription,
    age,
    color,
    size,
    lat,
    lng,
    address,
    city,
    state,
    country,
    notes,
    contactNumber,
    dateStatus,
    isToday,
    images,
  ]);

  useEffect(() => {
    if (!hydrated || !isToday) return;
    setDateStatus(formatDateTimeLocal(new Date()));
    const interval = window.setInterval(() => {
      setDateStatus(formatDateTimeLocal(new Date()));
    }, 60000);
    return () => window.clearInterval(interval);
  }, [hydrated, isToday]);

  const [createAnimal] = useMutation(CREATE_ANIMAL_MUTATION);
  const [createAnimalLog] = useMutation(CREATE_ANIMAL_LOG_MUTATION);
  const [createAnimalMultimedias] = useMutation(CREATE_ANIMAL_MULTIMEDIA_MUTATION);

  const addImages = (files: File[]) => {
    const incoming = Array.from(files);
    if (!incoming.length) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      sileo.error({
        title: 'Ya hay 3 fotos',
        description: 'Quita una para agregar otra.',
      });
      return;
    }

    const accepted: File[] = [];
    let skippedType = 0;
    let skippedSize = 0;
    let skippedCap = 0;

    for (const file of incoming) {
      const isImage =
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(file.name);
      if (!isImage) {
        skippedType += 1;
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        skippedSize += 1;
        continue;
      }
      if (accepted.length >= remaining) {
        skippedCap += 1;
        continue;
      }
      accepted.push(file);
    }

    if (skippedSize) {
      sileo.error({
        title: 'Foto demasiado pesada',
        description: 'Cada imagen debe pesar 5 MB o menos.',
      });
    } else if (skippedType && accepted.length === 0) {
      sileo.error({
        title: 'Solo imágenes',
        description: 'Usa PNG o JPG.',
      });
    } else if (skippedCap) {
      sileo.error({
        title: `Solo caben ${remaining}`,
        description: `Se agregaron las primeras ${accepted.length}.`,
      });
    }

    if (!accepted.length) return;

    const previews = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((current) => {
      const room = MAX_IMAGES - current.length;
      const take = previews.slice(0, room);
      previews.slice(room).forEach((item) => URL.revokeObjectURL(item.preview));
      return take.length ? [...current, ...take] : current;
    });
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const victim = current[index];
      if (victim) URL.revokeObjectURL(victim.preview);
      return current.filter((_, i) => i !== index);
    });
  };

  const reorderImages = (from: number, to: number) => {
    if (from === to) return;
    setImages((current) => {
      if (from < 0 || to < 0 || from >= current.length || to >= current.length) {
        return current;
      }
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const validateStep = (target: number): boolean => {
    const nextErrors: FieldErrors = {};

    if (target >= 0) {
      if (!isValidName(name)) {
        nextErrors.name = 'Escribe un nombre o marca que no tiene.';
      }
      if (!animalTypeId) {
        nextErrors.animalTypeId = 'Elige perro, gato u otro tipo.';
      }
    }

    if (target >= 1) {
      if (!animalBreedId) nextErrors.animalBreedId = 'Elige una raza o pulsa No sé.';
      if (!age.trim()) nextErrors.age = 'Elige una edad aproximada.';
      if (!color.trim()) nextErrors.color = 'El color ayuda a reconocerlo.';
      if (!size.trim()) nextErrors.size = 'Elige un tamaño.';
      if (!physicalDescription.trim()) {
        nextErrors.physicalDescription = 'Describe algo que lo distinga.';
      }
    }

    if (target >= 2) {
      if (!status) nextErrors.status = 'Elige qué estás reportando.';
      if (!lat.trim() || !lng.trim()) {
        nextErrors.location = 'Fija el pin en el mapa o pulsa Estoy aquí.';
      }
      if (!contactNumber.trim()) {
        nextErrors.contactNumber = 'Un teléfono para que te contacten.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    if (step === 0) {
      router.push(Routes.animals.index);
      return;
    }
    setErrors({});
    setStep((current) => current - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2) || !user?.id) {
      if (!user?.id) {
        sileo.error({ title: 'Inicia sesión para publicar' });
      }
      return;
    }

    setLoading(true);

    try {
      const { data: animalData } = await createAnimal({
        variables: {
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
            user: { connect: { id: user.id } },
          },
        },
      });
      const animalId = animalData?.createAnimal?.id;
      if (!animalId) {
        throw new Error('Error al crear el animal');
      }

      const logResult = await createAnimalLog({
        variables: {
          data: {
            animal: { connect: { id: animalId } },
            status,
            notes: notes.trim() || 'Sin información adicional',
            lat,
            lng,
            address: address.trim() || null,
            city: city.trim() || null,
            state: state.trim() || null,
            country: country.trim() || null,
            last_seen: lastSeen,
            date_status: dateStatus ? new Date(dateStatus).toISOString() : null,
          },
        },
      });

      if (images.length > 0) {
        await createAnimalMultimedias({
          variables: {
            data: images.map((img, index) => ({
              animal: { connect: { id: animalId } },
              image: { upload: img.file },
              order: index + 1,
            })),
          },
        });
      }

      await clearAnimalReportDraft(user.id);
      const slug =
        logResult.data?.createAnimalLog?.animal?.slug ||
        animalData?.createAnimal?.slug ||
        animalId;
      router.push(Routes.animals.detail(slug));
    } catch (error: unknown) {
      sileo.error({
        title: 'No se pudo publicar',
        description: publishErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const whenLabel =
    status === 'lost'
      ? '¿Cuándo se perdió?'
      : status === 'found'
        ? '¿Cuándo lo encontraste?'
        : `Fecha de ${getStatusLabel(status).toLowerCase()}`;

  if (!hydrated) {
    return <NewAnimalFormSkeleton />;
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (step < STEPS.length - 1) {
          goNext();
          return;
        }
        void handleSubmit();
      }}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      <header className="shrink-0 border-b border-[#e6e9ef] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#121212] hover:bg-[#f3f5f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh dark:text-[#eef1f6] dark:hover:bg-night"
            aria-label={step === 0 ? 'Volver al directorio' : 'Paso anterior'}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={1.5} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black tracking-tight text-[#121212] dark:text-[#eef1f6] sm:text-xl">
              {copy.title}
            </h1>
          </div>
        </div>
        <div className="mx-auto mt-4 max-w-2xl">
          <ReportStepper
            step={step}
            labels={STEPS}
            onSelect={(index) => {
              if (index <= step) {
                setErrors({});
                setStep(index);
                return;
              }
              if (validateStep(index - 1)) setStep(index);
            }}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div ref={panelRef} className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-6">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
                  Fotos
                </p>
                <p className="mb-3 text-sm text-[#5a5a5a] dark:text-[#9aa3b2]">
                  Una foto nítida es lo que más ayuda a reconocerlo. Arrastra para elegir la portada. Hasta {MAX_IMAGES}.
                </p>
                <PhotoPicker
                  images={images}
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
                error={errors.animalTypeId}
              />

              <AnimalNameInput
                value={name}
                onChange={setName}
                required
                unnamedByDefault={unnamedByDefault}
                error={errors.name}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
                  Tamaño <span className="text-red-600">*</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ANIMAL_SIZE_OPTIONS.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      selected={size === option.value}
                      onSelect={() => setSize(option.value)}
                    />
                  ))}
                </div>
                {errors.size ? <p className="mt-2 text-xs text-red-600">{errors.size}</p> : null}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
                  Edad <span className="text-red-600">*</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ANIMAL_AGE_OPTIONS.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      selected={age === option.value}
                      onSelect={() => setAge(option.value)}
                    />
                  ))}
                </div>
                {errors.age ? <p className="mt-2 text-xs text-red-600">{errors.age}</p> : null}
              </div>

              <div>
                <label
                  htmlFor="color"
                  className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
                >
                  Color <span className="text-red-600">*</span>
                </label>
                <input
                  id="color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={fieldClass}
                  placeholder="Ej. café con mancha blanca en el pecho"
                />
                {errors.color ? <p className="mt-2 text-xs text-red-600">{errors.color}</p> : null}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
                  Sexo
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ANIMAL_SEX_OPTIONS.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      selected={sex === option.value}
                      onSelect={() => setSex(option.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <AnimalBreedPicker
                  animalTypeId={animalTypeId}
                  value={animalBreedId}
                  onChange={setAnimalBreedId}
                  required
                  error={errors.animalBreedId}
                />
              </div>

              <div>
                <label
                  htmlFor="physicalDescription"
                  className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
                >
                  Señas particulares <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="physicalDescription"
                  value={physicalDescription}
                  onChange={(e) => setPhysicalDescription(e.target.value)}
                  rows={3}
                  className={`${fieldClass} resize-none`}
                  placeholder="Collar, oreja doblada, cojera…"
                />
                {errors.physicalDescription ? (
                  <p className="mt-2 text-xs text-red-600">{errors.physicalDescription}</p>
                ) : null}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p
                  id="report-status-label"
                  className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
                >
                  Qué reportas <span className="text-red-600">*</span>
                </p>
                <StatusChips
                  value={status}
                  labelledBy="report-status-label"
                  allowDeselect={false}
                  showAll
                  onChange={(next) => {
                    if (isAnimalReportStatus(next)) setStatus(next);
                  }}
                />
                {errors.status ? <p className="mt-2 text-xs text-red-600">{errors.status}</p> : null}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
                  {whenLabel}
                </p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <ChoiceChip
                    label="Hoy"
                    selected={isToday}
                    onSelect={() => setIsToday(true)}
                  />
                  <ChoiceChip
                    label="Otra fecha"
                    selected={!isToday}
                    onSelect={() => setIsToday(false)}
                  />
                </div>
                {!isToday && (
                  <motion.div
                    variants={motionPrefs.expand}
                    initial={motionPrefs.expand ? 'hidden' : false}
                    animate="show"
                    className="overflow-hidden"
                  >
                  <input
                    id="dateStatus"
                    type="datetime-local"
                    value={dateStatus}
                    onChange={(e) => setDateStatus(e.target.value)}
                    className={fieldClass}
                  />
                  </motion.div>
                )}
              </div>

              <div className={errors.location ? 'rounded-xl ring-1 ring-red-500 ring-offset-2 dark:ring-offset-night' : ''}>
                <LocationPicker
                  compact
                  isVisible={step === 2}
                  lat={lat}
                  lng={lng}
                  address={address}
                  city={city}
                  state={state}
                  country={country}
                  onLocationChange={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                  onAddressChange={(newAddress, newCity, newState, newCountry) => {
                    setAddress(newAddress);
                    setCity(newCity);
                    setState(newState);
                    setCountry(newCountry);
                  }}
                />
                {errors.location ? (
                  <p className="mt-2 text-xs text-red-600">{errors.location}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="contactNumber"
                  className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
                >
                  Teléfono <span className="text-red-600">*</span>
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  inputMode="tel"
                  maxLength={18}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className={fieldClass}
                  placeholder="55 1234 5678"
                  autoComplete="tel"
                />
                {errors.contactNumber ? (
                  <p className="mt-2 text-xs text-red-600">{errors.contactNumber}</p>
                ) : null}
              </div>

              <AnimatePresence initial={false} mode="wait">
              {showNotes ? (
                <motion.div
                  key="notes"
                  variants={motionPrefs.expand}
                  initial={motionPrefs.expand ? 'hidden' : false}
                  animate="show"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
                  >
                    Nota
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className={`${fieldClass} resize-none`}
                    placeholder="Algo extra que convenga saber"
                  />
                </motion.div>
              ) : (
                <motion.button
                  key="add-note"
                  type="button"
                  onClick={() => setShowNotes(true)}
                  whileTap={motionPrefs.tap}
                  variants={motionPrefs.panel}
                  initial={motionPrefs.panel ? 'hidden' : false}
                  animate="show"
                  exit="exit"
                  className="text-sm font-semibold text-kadesh hover:text-kadesh-600"
                >
                  Agregar una nota
                </motion.button>
              )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#e6e9ef] bg-white px-4 py-3 dark:border-white/10 dark:bg-night-raised sm:px-6">
        <div className="mx-auto flex max-w-2xl gap-3">
          <motion.button
            type="button"
            onClick={goBack}
            whileTap={motionPrefs.tap}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-[#3a3a3a] hover:bg-[#f3f5f8] dark:text-[#d0d0d0] dark:hover:bg-night"
          >
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </motion.button>
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={loading ? undefined : motionPrefs.tap}
            className="flex-1 rounded-xl bg-kadesh px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Publicando…'
              : step < STEPS.length - 1
                ? 'Continuar'
                : copy.submit}
          </motion.button>
        </div>
      </div>
    </form>
  );
}

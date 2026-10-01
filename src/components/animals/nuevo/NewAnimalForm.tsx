"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useLazyQuery } from '@apollo/client';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import {
  CREATE_ANIMAL_MUTATION,
  CREATE_ANIMAL_LOG_MUTATION,
  CREATE_ANIMAL_MULTIMEDIA_MUTATION,
  FIND_ANIMAL_REPORT_DUPLICATES,
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
import { MORELIA_CENTER, placeLabelFromAddress } from 'kadesh/components/animals/nuevo/nominatimPlace';
import { useRememberedLocation } from 'kadesh/utils/useRememberedLocation';
import { normalizeMxPhone } from 'kadesh/utils/phone';

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
  contactNumber2?: string;
  date?: string;
  age?: string;
  color?: string;
  size?: string;
  physicalDescription?: string;
}

function isValidName(name: string) {
  return name === 'Sin nombre' || name.trim() !== '';
}

function todayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

type DateMode = 'today' | 'yesterday' | 'other';

function buildLostDate(mode: DateMode, otherDate: string, otherTime: string) {
  const now = new Date();
  if (mode === 'today') return { ok: true as const, iso: now.toISOString() };
  if (mode === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    return { ok: true as const, iso: yesterday.toISOString() };
  }
  if (!otherDate) return { ok: false as const, reason: 'Elige el día.' };
  const [year, month, day] = otherDate.split('-').map(Number);
  let hours = 12;
  let minutes = 0;
  if (otherTime) {
    const [hh, mm] = otherTime.split(':').map(Number);
    if (Number.isNaN(hh) || Number.isNaN(mm)) {
      return { ok: false as const, reason: 'La hora no es válida.' };
    }
    hours = hh;
    minutes = mm;
  } else if (otherDate === todayKey(now)) {
    hours = now.getHours();
    minutes = now.getMinutes();
  }
  const chosen = new Date(year, (month || 1) - 1, day || 1, hours, minutes, 0, 0);
  if (Number.isNaN(chosen.getTime())) {
    return { ok: false as const, reason: 'La fecha no es válida.' };
  }
  if (chosen.getTime() > Date.now()) {
    return { ok: false as const, reason: 'La fecha no puede ser posterior a hoy.' };
  }
  return { ok: true as const, iso: chosen.toISOString() };
}

function publishErrorMessage(error: unknown): { text: string; step: number; field?: keyof FieldErrors } {
  let raw = '';
  if (error && typeof error === 'object' && 'graphQLErrors' in error) {
    raw =
      (error as { graphQLErrors?: { message?: string }[] }).graphQLErrors?.[0]?.message ||
      '';
  } else if (error instanceof Error) {
    raw = error.message;
  }
  const text = raw.split('\n')[0]?.trim() || '';
  if (/10 dígitos|teléfono/i.test(text)) {
    return { text: 'El teléfono debe tener 10 dígitos.', step: 2, field: 'contactNumber' };
  }
  if (/ciudad|ubicación|mapa|invalid data/i.test(text)) {
    return {
      text: 'Elige una ubicación de la lista o toca el mapa.',
      step: 2,
      field: 'location',
    };
  }
  if (/fecha/i.test(text)) {
    return { text: 'La fecha no puede ser posterior a hoy.', step: 2, field: 'date' };
  }
  if (/raza/i.test(text)) {
    return { text: 'Elige una raza o pulsa No sé.', step: 1, field: 'animalBreedId' };
  }
  if (text && !/you provided invalid data/i.test(text)) {
    return { text, step: 2 };
  }
  return { text: 'Revisa los datos marcados e inténtalo de nuevo.', step: 2 };
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
  const { coords: rememberedLocation } = useRememberedLocation();
  const mapCenter = rememberedLocation ?? MORELIA_CENTER;
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressEdited, setAddressEdited] = useState(false);
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const [isOwnPet, setIsOwnPet] = useState(true);
  const [contactNumber, setContactNumber] = useState(user?.phone ?? '');
  const [contactNumber2, setContactNumber2] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [dateMode, setDateMode] = useState<DateMode>('today');
  const [otherDate, setOtherDate] = useState('');
  const [otherTime, setOtherTime] = useState('');
  const [duplicates, setDuplicates] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const skipDuplicateCheck = useRef(false);
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
        setNeighborhood(draft.neighborhood || '');
        setPostalCode(draft.postalCode || '');
        setAddressEdited(Boolean(draft.addressEdited));
        setNotes(draft.notes);
        setIsOwnPet(draft.isOwnPet !== false);
        if (draft.contactNumber) setContactNumber(draft.contactNumber);
        setContactNumber2(draft.contactNumber2 || '');
        setSourceUrl(draft.sourceUrl || '');
        if (draft.dateMode) {
          setDateMode(draft.dateMode);
          setOtherDate(draft.otherDate || '');
          setOtherTime(draft.otherTime || '');
        } else if (draft.isToday) {
          setDateMode('today');
        } else {
          setDateMode('other');
          const [datePart, timePart] = (draft.dateStatus || '').split('T');
          setOtherDate(datePart || '');
          setOtherTime(timePart?.slice(0, 5) || '');
        }
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
          neighborhood,
          postalCode,
          addressEdited,
          notes,
          isOwnPet,
          contactNumber,
          contactNumber2,
          sourceUrl,
          dateStatus: '',
          isToday: dateMode === 'today',
          dateMode,
          otherDate,
          otherTime,
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
    neighborhood,
    postalCode,
    addressEdited,
    notes,
    isOwnPet,
    contactNumber,
    contactNumber2,
    sourceUrl,
    dateMode,
    otherDate,
    otherTime,
    images,
  ]);

  const [createAnimal] = useMutation(CREATE_ANIMAL_MUTATION);
  const [createAnimalLog] = useMutation(CREATE_ANIMAL_LOG_MUTATION);
  const [createAnimalMultimedias] = useMutation(CREATE_ANIMAL_MULTIMEDIA_MUTATION);
  const [findDuplicates] = useLazyQuery<
    { findAnimalReportDuplicates: Array<{ id: string; name: string; url: string }> }
  >(FIND_ANIMAL_REPORT_DUPLICATES, { fetchPolicy: 'network-only' });

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
        nextErrors.location = 'Elige una ubicación de la lista o toca el mapa.';
      } else if (isResolvingPlace) {
        nextErrors.location = 'Estamos ubicando la ciudad. Espera un momento.';
      }
      const lostDate = buildLostDate(dateMode, otherDate, otherTime);
      if (!lostDate.ok) nextErrors.date = lostDate.reason;
      const phone = normalizeMxPhone(contactNumber);
      if (!contactNumber.trim()) {
        nextErrors.contactNumber = isOwnPet
          ? 'Un teléfono para que te contacten.'
          : 'Escribe el teléfono del dueño.';
      } else if (!phone.ok) {
        nextErrors.contactNumber = phone.reason;
      }
      if (contactNumber2.trim()) {
        const second = normalizeMxPhone(contactNumber2);
        if (!second.ok) nextErrors.contactNumber2 = second.reason;
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
      } else if (!isValidName(name) || !animalTypeId) {
        setStep(0);
      } else if (!animalBreedId || !age.trim() || !color.trim() || !size.trim() || !physicalDescription.trim()) {
        setStep(1);
      } else {
        setStep(2);
      }
      return;
    }

    setLoading(true);

    try {
      const lostDate = buildLostDate(dateMode, otherDate, otherTime);
      if (!lostDate.ok) {
        setErrors({ date: lostDate.reason });
        setStep(2);
        return;
      }
      const phone = normalizeMxPhone(contactNumber);
      if (!phone.ok) {
        setErrors({ contactNumber: phone.reason });
        setStep(2);
        return;
      }
      const second = contactNumber2.trim() ? normalizeMxPhone(contactNumber2) : { ok: true as const, digits: '' };
      if (!second.ok) {
        setErrors({ contactNumber2: second.reason });
        setStep(2);
        return;
      }

      if (!skipDuplicateCheck.current) {
        const { data: duplicateData } = await findDuplicates({
          variables: {
            phone: phone.digits,
            animalTypeId,
            name: name.trim() || 'Sin nombre',
            sourceUrl: sourceUrl.trim() || null,
          },
        });
        const matches = duplicateData?.findAnimalReportDuplicates ?? [];
        if (matches.length) {
          setDuplicates(matches);
          setLoading(false);
          return;
        }
      }
      skipDuplicateCheck.current = false;

      const { data: animalData } = await createAnimal({
        variables: {
          data: {
            name: name.trim() || 'Sin nombre',
            contactNumber: phone.digits,
            contactNumber2: second.digits,
            sex,
            physical_description: physicalDescription.trim(),
            age: age.trim() || null,
            color: color.trim() || null,
            size: size.trim() || null,
            sourceUrl: sourceUrl.trim(),
            reportedBy: isOwnPet ? 'owner' : 'volunteer',
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
            city: city.trim(),
            state: state.trim() || null,
            country: country.trim() || null,
            neighborhood: neighborhood.trim(),
            postalCode: postalCode.trim(),
            placeLabel: addressEdited ? placeLabelFromAddress(address) : '',
            last_seen: lastSeen,
            date_status: lostDate.iso,
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
      const parsed = publishErrorMessage(error);
      if (parsed.field) setErrors({ [parsed.field]: parsed.text });
      setStep(parsed.step);
      sileo.error({
        title: 'No se pudo publicar',
        description: parsed.text,
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
                  <ChoiceChip label="Hoy" selected={dateMode === 'today'} onSelect={() => setDateMode('today')} />
                  <ChoiceChip
                    label="Ayer"
                    selected={dateMode === 'yesterday'}
                    onSelect={() => setDateMode('yesterday')}
                  />
                  <ChoiceChip
                    label="Otra fecha"
                    selected={dateMode === 'other'}
                    onSelect={() => setDateMode('other')}
                  />
                </div>
                {dateMode === 'other' && (
                  <motion.div
                    variants={motionPrefs.expand}
                    initial={motionPrefs.expand ? 'hidden' : false}
                    animate="show"
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <div>
                      <label htmlFor="otherDate" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
                        Día
                      </label>
                      <input
                        id="otherDate"
                        type="date"
                        max={todayKey()}
                        value={otherDate}
                        onChange={(e) => setOtherDate(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="otherTime" className="mb-1 block text-xs font-semibold text-[#5a5a5a] dark:text-[#9aa3b2]">
                        Hora, si la sabes
                      </label>
                      <input
                        id="otherTime"
                        type="time"
                        value={otherTime}
                        onChange={(e) => setOtherTime(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  </motion.div>
                )}
                {errors.date ? <p className="mt-2 text-xs text-red-600">{errors.date}</p> : null}
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
                  onPlaceDetails={({ neighborhood: nextNeighborhood, postalCode: nextPostal }) => {
                    setNeighborhood(nextNeighborhood);
                    setPostalCode(nextPostal);
                  }}
                  onAddressEdited={setAddressEdited}
                  onResolvingChange={setIsResolvingPlace}
                  mapCenter={mapCenter}
                />
                {errors.location ? (
                  <p className="mt-2 text-xs text-red-600">{errors.location}</p>
                ) : null}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-[#121212] dark:text-[#eef1f6]">
                  ¿Es tu mascota?
                </p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  <ChoiceChip
                    label="Sí"
                    selected={isOwnPet}
                    onSelect={() => {
                      setIsOwnPet(true);
                      if (!contactNumber.trim() && user?.phone) setContactNumber(user.phone);
                    }}
                  />
                  <ChoiceChip
                    label="No, la reporto por alguien más"
                    selected={!isOwnPet}
                    onSelect={() => {
                      setIsOwnPet(false);
                      setContactNumber('');
                    }}
                  />
                </div>
                <label
                  htmlFor="contactNumber"
                  className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
                >
                  {isOwnPet ? 'Teléfono' : 'Teléfono del dueño'} <span className="text-red-600">*</span>
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  inputMode="tel"
                  maxLength={18}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className={`${fieldClass} ${errors.contactNumber ? 'ring-1 ring-red-500' : ''}`}
                  placeholder="443 521 5638"
                  autoComplete="tel"
                />
                {errors.contactNumber ? (
                  <p className="mt-2 text-xs text-red-600">{errors.contactNumber}</p>
                ) : null}
                <label
                  htmlFor="contactNumber2"
                  className="mb-2 mt-4 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
                >
                  Segundo teléfono
                </label>
                <input
                  id="contactNumber2"
                  type="tel"
                  inputMode="tel"
                  maxLength={18}
                  value={contactNumber2}
                  onChange={(e) => setContactNumber2(e.target.value)}
                  className={`${fieldClass} ${errors.contactNumber2 ? 'ring-1 ring-red-500' : ''}`}
                  placeholder="Opcional"
                  autoComplete="tel"
                />
                {errors.contactNumber2 ? (
                  <p className="mt-2 text-xs text-red-600">{errors.contactNumber2}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="sourceUrl"
                  className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
                >
                  Enlace de la publicación original
                </label>
                <input
                  id="sourceUrl"
                  type="url"
                  inputMode="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className={fieldClass}
                  placeholder="https://www.facebook.com/…"
                />
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
        {duplicates.length > 0 && (
          <div className="mx-auto mb-3 max-w-2xl rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-[#121212] dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-[#eef1f6]">
            <p className="font-semibold">Parece que este reporte ya existe</p>
            <ul className="mt-2 space-y-1">
              {duplicates.map((item) => (
                <li key={item.id}>
                  <a href={item.url} className="font-semibold text-kadesh underline" target="_blank" rel="noopener noreferrer">
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                skipDuplicateCheck.current = true;
                setDuplicates([]);
                void handleSubmit();
              }}
              className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-kadesh px-4 text-sm font-semibold text-white"
            >
              Publicar de todos modos
            </button>
          </div>
        )}
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
            disabled={loading || (step === STEPS.length - 1 && isResolvingPlace)}
            whileTap={loading || isResolvingPlace ? undefined : motionPrefs.tap}
            className="flex-1 rounded-xl bg-kadesh px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Publicando…'
              : step === STEPS.length - 1 && isResolvingPlace
                ? 'Ubicando…'
                : step < STEPS.length - 1
                  ? 'Continuar'
                  : copy.submit}
          </motion.button>
        </div>
      </div>
    </form>
  );
}

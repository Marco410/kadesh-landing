"use client";

import { useEffect, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { sileo } from 'sileo';
import AnimalTypeSelector from 'kadesh/components/animals/nuevo/AnimalTypeSelector';
import AnimalBreedPicker from 'kadesh/components/animals/nuevo/AnimalBreedPicker';
import PhotoPicker from 'kadesh/components/animals/nuevo/PhotoPicker';
import ChoiceChip from 'kadesh/components/animals/nuevo/ChoiceChip';
import { ANIMAL_SEX_OPTIONS } from 'kadesh/components/animals/constants';
import { INPUT_CLASS, LABEL_CLASS } from 'kadesh/components/profile/clinics/formStyles';
import PetSheet from './PetSheet';
import ExistingPhotos from './ExistingPhotos';
import { usePhotoQueue } from './hooks/usePhotoQueue';
import {
  CREATE_PET_MUTATION,
  CREATE_PET_PHOTOS_MUTATION,
  DELETE_PET_PHOTOS_MUTATION,
  PET_REFETCH,
  UPDATE_PET_MUTATION,
} from './queries';
import {
  MAX_PET_PHOTOS,
  PET_MANUAL_STATUS_OPTIONS,
  PET_STATUS,
  PET_STERILIZED_OPTIONS,
} from './constants';
import { petErrorMessage, todayYmd } from './utils';
import type { PetDetail } from './types';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Sin mascota: registrar una nueva. */
  pet?: PetDetail | null;
  onSaved?: (petId: string) => void;
}

type Errors = Partial<Record<'name' | 'animalTypeId' | 'birthday' | 'weightKg', string>>;

export default function PetFormModal({ isOpen, onClose, pet, onSaved }: PetFormModalProps) {
  const client = useApolloClient();
  const isEdit = Boolean(pet);
  const [name, setName] = useState('');
  const [animalTypeId, setAnimalTypeId] = useState('');
  const [animalBreedId, setAnimalBreedId] = useState('');
  const [sex, setSex] = useState('unknown');
  const [knowsBirthday, setKnowsBirthday] = useState(true);
  const [birthday, setBirthday] = useState('');
  const [approximateAge, setApproximateAge] = useState('');
  const [color, setColor] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [sterilized, setSterilized] = useState('unknown');
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [distinctiveMarks, setDistinctiveMarks] = useState('');
  const [status, setStatus] = useState<string>(PET_STATUS.ACTIVE);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingPhotos = pet?.multimedia ?? [];
  const keptPhotos = existingPhotos.filter((photo) => !removedPhotoIds.includes(photo.id));
  const queue = usePhotoQueue(Math.max(0, MAX_PET_PHOTOS - keptPhotos.length));

  const [createPet] = useMutation(CREATE_PET_MUTATION);
  const [updatePet] = useMutation(UPDATE_PET_MUTATION);
  const [createPhotos] = useMutation(CREATE_PET_PHOTOS_MUTATION);
  const [deletePhotos] = useMutation(DELETE_PET_PHOTOS_MUTATION);

  useEffect(() => {
    if (!isOpen) return;
    setName(pet?.name ?? '');
    setAnimalTypeId(pet?.animal_type?.id ?? '');
    setAnimalBreedId(pet?.animal_breed?.id ?? '');
    setSex(pet?.sex || 'unknown');
    setKnowsBirthday(pet ? Boolean(pet.birthday) || !pet.approximateAge : true);
    setBirthday(pet?.birthday ?? '');
    setApproximateAge(pet?.approximateAge ?? '');
    setColor(pet?.color ?? '');
    setWeightKg(pet?.weightKg ? String(Number(pet.weightKg)) : '');
    setSterilized(pet?.sterilized || 'unknown');
    setMicrochipNumber(pet?.microchipNumber ?? '');
    setDistinctiveMarks(pet?.distinctiveMarks ?? '');
    setStatus(pet?.status ?? PET_STATUS.ACTIVE);
    setRemovedPhotoIds([]);
    setErrors({});
    setSubmitError('');
    queue.reset();
    // Solo al abrir: el formulario no debe pisar lo que la persona escribe si se refresca `pet`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const validate = (): boolean => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Escribe su nombre.';
    if (!animalTypeId) next.animalTypeId = 'Elige qué animal es.';
    if (knowsBirthday && birthday && birthday > todayYmd()) {
      next.birthday = 'La fecha no puede ser posterior a hoy.';
    }
    if (weightKg.trim()) {
      const value = Number(weightKg.replace(',', '.'));
      if (!Number.isFinite(value) || value <= 0 || value > 200) next.weightKg = 'Escribe el peso en kg, entre 0.1 y 200.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitError('');

    const weight = weightKg.trim() ? Number(weightKg.replace(',', '.')).toFixed(2) : null;
    const data: Record<string, unknown> = {
      name: name.trim(),
      animal_type: { connect: { id: animalTypeId } },
      sex,
      birthday: knowsBirthday && birthday ? birthday : null,
      approximateAge: knowsBirthday ? '' : approximateAge.trim(),
      color: color.trim(),
      weightKg: weight,
      sterilized,
      microchipNumber: microchipNumber.trim(),
      distinctiveMarks: distinctiveMarks.trim(),
    };
    if (animalBreedId) data.animal_breed = { connect: { id: animalBreedId } };
    else if (pet?.animal_breed) data.animal_breed = { disconnect: true };
    if (isEdit && pet?.status !== PET_STATUS.LOST) data.status = status;

    let petId = pet?.id ?? '';
    try {
      if (pet) {
        await updatePet({ variables: { id: pet.id, data } });
      } else {
        const result = await createPet({ variables: { data } });
        petId = result.data?.createPet?.id ?? '';
      }
    } catch (error) {
      setSubmitError(petErrorMessage(error));
      setIsSubmitting(false);
      return;
    }

    try {
      if (removedPhotoIds.length) {
        await deletePhotos({ variables: { where: removedPhotoIds.map((id) => ({ id })) } });
      }
      if (petId && queue.photos.length) {
        const startOrder = keptPhotos.reduce((max, photo) => Math.max(max, photo.order ?? 0), 0);
        await createPhotos({
          variables: {
            data: queue.photos.map((photo, index) => ({
              pet: { connect: { id: petId } },
              order: startOrder + index + 1,
              image: { upload: photo.file },
            })),
          },
        });
      }
    } catch (error) {
      console.error('[pets] fotos', error);
      sileo.error({
        title: 'No se guardaron las fotos',
        description: 'Los datos sí quedaron. Intenta subir las fotos otra vez.',
      });
    }

    await client.refetchQueries({ include: PET_REFETCH });
    setIsSubmitting(false);
    sileo.success({ title: pet ? 'Cambios guardados' : `${name.trim()} ya está en tu cartilla` });
    onClose();
    if (petId) onSaved?.(petId);
  };

  return (
    <PetSheet
      isOpen={isOpen}
      title={pet ? `Editar a ${pet.name}` : 'Registrar mascota'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={pet ? 'Guardar' : 'Registrar'}
      isSubmitting={isSubmitting}
      error={submitError}
    >
      <div>
        <p className={LABEL_CLASS}>Fotos</p>
        <ExistingPhotos
          photos={existingPhotos}
          removedIds={removedPhotoIds}
          onToggle={(id) =>
            setRemovedPhotoIds((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
            )
          }
        />
        <PhotoPicker
          images={queue.photos}
          max={Math.max(0, MAX_PET_PHOTOS - keptPhotos.length)}
          onAdd={queue.add}
          onRemove={queue.remove}
          onReorder={queue.reorder}
        />
        <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
          Hasta {MAX_PET_PHOTOS}. La primera es la principal y son las que irían en un reporte si se pierde.
        </p>
      </div>

      <div>
        <label htmlFor="pet-name" className={LABEL_CLASS}>
          Nombre <span className="text-red-600">*</span>
        </label>
        <input
          id="pet-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={INPUT_CLASS}
          placeholder="Ej. Firulais"
          autoComplete="off"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>

      <div>
        <p className={LABEL_CLASS}>
          ¿Qué animal es? <span className="text-red-600">*</span>
        </p>
        <AnimalTypeSelector
          alwaysExpanded
          selectedTypeId={animalTypeId}
          onTypeChange={(typeId) => {
            setAnimalTypeId(typeId);
            setAnimalBreedId('');
          }}
          error={errors.animalTypeId}
        />
      </div>

      <AnimalBreedPicker
        id="pet-breed"
        animalTypeId={animalTypeId}
        value={animalBreedId}
        onChange={(breedId) => setAnimalBreedId(breedId)}
      />

      <div>
        <p className={LABEL_CLASS}>Sexo</p>
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
        <p className={LABEL_CLASS}>Edad</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <ChoiceChip label="Sé su fecha de nacimiento" selected={knowsBirthday} onSelect={() => setKnowsBirthday(true)} />
          <ChoiceChip label="No la sé" selected={!knowsBirthday} onSelect={() => setKnowsBirthday(false)} />
        </div>
        {knowsBirthday ? (
          <>
            <label htmlFor="pet-birthday" className="sr-only">
              Fecha de nacimiento
            </label>
            <input
              id="pet-birthday"
              type="date"
              value={birthday}
              max={todayYmd()}
              onChange={(event) => setBirthday(event.target.value)}
              className={INPUT_CLASS}
              aria-invalid={Boolean(errors.birthday)}
            />
            {errors.birthday ? <p className="mt-1 text-xs text-red-600">{errors.birthday}</p> : null}
          </>
        ) : (
          <>
            <label htmlFor="pet-approx-age" className="sr-only">
              Edad aproximada
            </label>
            <input
              id="pet-approx-age"
              value={approximateAge}
              onChange={(event) => setApproximateAge(event.target.value)}
              className={INPUT_CLASS}
              placeholder="Ej. 2 años, cachorro de 4 meses"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pet-color" className={LABEL_CLASS}>
            Color
          </label>
          <input
            id="pet-color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className={INPUT_CLASS}
            placeholder="Ej. Café con blanco"
          />
        </div>
        <div>
          <label htmlFor="pet-weight" className={LABEL_CLASS}>
            Peso (kg)
          </label>
          <input
            id="pet-weight"
            inputMode="decimal"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            className={INPUT_CLASS}
            placeholder="Ej. 12.5"
            aria-invalid={Boolean(errors.weightKg)}
          />
          {errors.weightKg ? <p className="mt-1 text-xs text-red-600">{errors.weightKg}</p> : null}
        </div>
      </div>

      <div>
        <p className={LABEL_CLASS}>¿Está esterilizada?</p>
        <div className="flex flex-wrap gap-1.5">
          {PET_STERILIZED_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={sterilized === option.value}
              onSelect={() => setSterilized(option.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="pet-microchip" className={LABEL_CLASS}>
          Número de microchip
        </label>
        <input
          id="pet-microchip"
          value={microchipNumber}
          onChange={(event) => setMicrochipNumber(event.target.value)}
          className={INPUT_CLASS}
          inputMode="numeric"
          placeholder="Opcional"
        />
      </div>

      <div>
        <label htmlFor="pet-marks" className={LABEL_CLASS}>
          Señas particulares
        </label>
        <textarea
          id="pet-marks"
          value={distinctiveMarks}
          onChange={(event) => setDistinctiveMarks(event.target.value)}
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
          placeholder="Manchas, cicatrices, collar… Ayudan a reconocerla si se pierde."
        />
      </div>

      {isEdit && pet?.status !== PET_STATUS.LOST ? (
        <div>
          <p className={LABEL_CLASS}>Estado</p>
          <div className="flex flex-wrap gap-1.5">
            {PET_MANUAL_STATUS_OPTIONS.map((option) => (
              <ChoiceChip
                key={option.value}
                label={option.label}
                selected={status === option.value}
                onSelect={() => setStatus(option.value)}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Si se pierde, usa «Marcar como perdida» para publicar su reporte.
          </p>
        </div>
      ) : null}
    </PetSheet>
  );
}

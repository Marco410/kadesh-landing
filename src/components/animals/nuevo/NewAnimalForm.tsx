"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { 
  GET_ANIMAL_TYPES_QUERY, 
  GET_ANIMAL_BREEDS_QUERY,
  CREATE_ANIMAL_MUTATION,
  CREATE_ANIMAL_LOG_MUTATION,
  CREATE_ANIMAL_MULTIMEDIA_MUTATION
} from 'kadesh/components/animals/queries';
import { useUser } from 'kadesh/utils/UserContext';
import { Autocomplete, AutocompleteOption } from 'kadesh/components/shared';
import LocationPicker from 'kadesh/components/animals/nuevo/LocationPicker';
import AnimalNameInput from 'kadesh/components/animals/nuevo/AnimalNameInput';
import { motion } from 'framer-motion';
import { ANIMAL_LOGS_OPTIONS, ANIMAL_SEX_OPTIONS, ANIMAL_TYPE_ICONS, ANIMAL_TYPE_LABELS } from 'kadesh/components/animals/constants';

interface ImagePreview {
  file: File;
  preview: string;
}

export default function NewAnimalForm() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [animalTypeId, setAnimalTypeId] = useState<string>('');
  const [animalBreedId, setAnimalBreedId] = useState<string>('');
  const [sex, setSex] = useState('unknown');
  const [status, setStatus] = useState('register');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [lastSeen, setLastSeen] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);

  // Queries
  const { data: animalTypesData, loading: loadingTypes } = useQuery(GET_ANIMAL_TYPES_QUERY, {
    variables: { orderBy: [{ order: "asc" }] },
  });

  const { data: animalBreedsData, loading: loadingBreeds } = useQuery(GET_ANIMAL_BREEDS_QUERY, {
    variables: { 
      where: { 
        animal_type: { 
          id: { equals: animalTypeId } 
        } 
      },
      orderBy: [{ breed: "asc" }]
    },
    skip: !animalTypeId,
  });

  // Transform breeds data for Autocomplete
  const breedOptions: AutocompleteOption[] = (animalBreedsData?.animalBreeds || []).map((breed: any) => ({
    id: breed.id,
    label: breed.breed,
    ...breed,
  }));

  // Mutations
  const [createAnimal] = useMutation(CREATE_ANIMAL_MUTATION);
  const [createAnimalLog] = useMutation(CREATE_ANIMAL_LOG_MUTATION);
  const [createAnimalMultimedias] = useMutation(CREATE_ANIMAL_MULTIMEDIA_MUTATION);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = [];
    const maxImages = 3;
    const remainingSlots = maxImages - images.length;

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
        });
      }
    }

    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    newImages.forEach(img => URL.revokeObjectURL(img.preview));
    setImages(newImages);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !name || !animalTypeId || !animalBreedId || !status || !lat || !lng) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Animal
      const { data: animalData } = await createAnimal({
        variables: {
          data: {
            name,
            sex,
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

      // Step 2: Create AnimalLog
      await createAnimalLog({
        variables: {
          data: {
            animal: { connect: { id: animalId } },
            status,
            notes: notes || null,
            lat,
            lng,
            address: address || null,
            city: city || null,
            state: state || null,
            country: country || null,
            last_seen: lastSeen,
          },
        },
      });

      // Step 3: Upload images (if any)
      if (images.length > 0) {
        const multimediaData = images.map((img) => ({
          animal: { connect: { id: animalId } },
          image: { upload: img.file },
        }));

        await createAnimalMultimedias({
          variables: {
            data: multimediaData,
          },
        });
      }

      // Success - redirect to animals page
      router.push('/animales');
    } catch (error: any) {
      console.error('Error creating animal:', error);
      alert(`Error: ${error.message || 'No se pudo crear el animal'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <AnimalNameInput
            value={name}
            onChange={setName}
            required
          />

          {/* Animal Type */}
          <div>
            <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
              Tipo de Animal <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {animalTypesData?.animalTypes?.map((type: any) => {
                // Obtener el label en español basado en el value (name) que viene del backend
                const typeValue = type.name?.toLowerCase() || '';
                const typeLabel = ANIMAL_TYPE_LABELS[typeValue] || type.name;
                const emojiIcon = ANIMAL_TYPE_ICONS[typeValue] || "🐾";
                const iconUrl = type.icon?.url || "";

                return (
                  <label
                    key={type.id}
                    className={`
                      flex flex-col items-center justify-center px-5 py-3 rounded-xl
                      cursor-pointer transition border-2
                      ${animalTypeId === type.id 
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/40"
                          : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212]"
                      }
                      w-28 hover:shadow-md
                    `}
                  >
                    {/* Icon (image or emoji) */}
                    {iconUrl ? (
                      <img 
                        src={iconUrl} 
                        alt={typeLabel}
                        className="w-10 h-10 mb-2 object-contain"
                      />
                    ) : (
                      <span className="text-3xl mb-2">{emojiIcon}</span>
                    )}
                    <span className="text-sm font-semibold text-[#212121] dark:text-[#ffffff]">
                      {typeLabel}
                    </span>
                    <input
                      type="radio"
                      name="animalType"
                      value={type.id}
                      checked={animalTypeId === type.id}
                      onChange={() => {
                        setAnimalTypeId(type.id);
                        setAnimalBreedId(""); // Reset breed when type changes
                      }}
                      required
                      disabled={loadingTypes}
                      className="sr-only"
                      aria-label={typeLabel}
                    />
                  </label>
                );
              })}
            </div>
            {!animalTypeId && (
              <p className="text-red-500 text-xs mt-2">Selecciona un tipo</p>
            )}
          </div>

          {/* Animal Breed - Autocomplete */}
          <Autocomplete
            id="animalBreed"
            label="Raza"
            value={animalBreedId}
            options={breedOptions}
            onChange={() => {
              // Search is handled internally by Autocomplete
            }}
            onSelect={(option) => setAnimalBreedId(option.id)}
            placeholder={
              !animalTypeId 
                ? 'Primero selecciona un tipo de animal' 
                : loadingBreeds 
                ? 'Cargando razas...' 
                : 'Busca o selecciona una raza'
            }
            required
            disabled={!animalTypeId}
            loading={loadingBreeds}
            searchKey="breed"
            displayKey="breed"
          />

          {/* Sex */}
          <div>
            <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
              Sexo
            </label>
            <div className="flex flex-wrap gap-4">
              {ANIMAL_SEX_OPTIONS.map((option) => {
                const sexIcons: Record<string, string> = {
                  male: '♂️',
                  female: '♀️',
                  unknown: '❓',
                };
                const icon = sexIcons[option.value] || '❓';

                return (
                  <label
                    key={option.value}
                    className={`
                      flex flex-col items-center justify-center px-5 py-3 rounded-xl
                      cursor-pointer transition border-2
                      ${sex === option.value 
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/40"
                          : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212]"
                      }
                      w-28 hover:shadow-md
                    `}
                  >
                    <span className="text-2xl mb-2">{icon}</span>
                    <span className="text-sm font-semibold text-[#212121] dark:text-[#ffffff]">
                      {option.label}
                    </span>
                    <input
                      type="radio"
                      name="sex"
                      value={option.value}
                      checked={sex === option.value}
                      onChange={() => setSex(option.value)}
                      className="sr-only"
                      aria-label={option.label}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
              Estado <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {ANIMAL_LOGS_OPTIONS.filter((option) => option.value == 'abandoned' || option.value == 'found' || option.value == 'lost' || option.value == 'rescued').map((option) => {
                const statusIcons: Record<string, string> = {
                  abandoned: '🚫',
                  found: '✅',
                  lost: '🔍',
                  rescued: '🆘',
                };
                const icon = statusIcons[option.value] || '📋';

                return (
                  <label
                    key={option.value}
                    className={`
                      flex flex-col items-center justify-center px-5 py-3 rounded-xl
                      cursor-pointer transition border-2
                      ${status === option.value 
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/40"
                          : "border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212]"
                      }
                      w-28 hover:shadow-md
                    `}
                  >
                    <span className="text-3xl mb-2">{icon}</span>
                    <span className="text-sm font-semibold text-[#212121] dark:text-[#ffffff]">
                      {option.label}
                    </span>
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={() => setStatus(option.value)}
                      required
                      className="sr-only"
                      aria-label={option.label}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Location - Map Picker */}
          <LocationPicker
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

          {/* Last Seen Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="lastSeen"
              type="checkbox"
              checked={lastSeen}
              onChange={(e) => setLastSeen(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
            />
            <label htmlFor="lastSeen" className="text-sm font-medium text-[#212121] dark:text-[#ffffff]">
              Esta fue la última vez que se vio a {name || 'el animal'} en esta ubicación
            </label>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 resize-none"
              placeholder={`Información adicional sobre ${name || 'el animal'}...`}
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
              Imágenes (máximo 3)
            </label>
            <div className="space-y-4">
              {images.length < 3 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#e0e0e0] dark:border-[#3a3a3a] rounded-lg cursor-pointer hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-[#616161] dark:text-[#b0b0b0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
                      <span className="font-semibold">Click para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-[#616161] dark:text-[#b0b0b0]">PNG, JPG o GIF (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              )}
              
              {/* Image Previews */}
              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] text-[#212121] dark:text-[#ffffff] font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : `Guardar a ${name || 'el animal'}`}
            </button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}

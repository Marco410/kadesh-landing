"use client";

import { useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { Autocomplete, type AutocompleteOption } from "kadesh/components/shared";
import { GET_ANIMAL_BREEDS_QUERY } from "kadesh/components/animals/queries";
import { findFallbackBreedId } from "kadesh/components/animals/constants";

interface AnimalBreedPickerProps {
  animalTypeId: string;
  value: string;
  onChange: (breedId: string, breedName?: string) => void;
  required?: boolean;
  error?: string;
  id?: string;
}

export default function AnimalBreedPicker({
  animalTypeId,
  value,
  onChange,
  required = false,
  error,
  id = "animalBreed",
}: AnimalBreedPickerProps) {
  const { data, loading } = useQuery(GET_ANIMAL_BREEDS_QUERY, {
    variables: {
      where: { animal_type: { id: { equals: animalTypeId } } },
      orderBy: [{ breed: "asc" }],
    },
    skip: !animalTypeId,
  });

  const breedOptions: AutocompleteOption[] = (data?.animalBreeds || []).map(
    (breed: { id: string; breed: string }) => ({
      id: breed.id,
      label: breed.breed,
      breed: breed.breed,
    }),
  );

  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Autocomplete
          id={id}
          label="Raza"
          value={value}
          options={breedOptions}
          onChange={() => undefined}
          onSelect={(option) =>
            onChange(
              option.id,
              typeof option.breed === "string" ? option.breed : "",
            )
          }
          placeholder={
            !animalTypeId
              ? "Primero elige un tipo"
              : loading
                ? "Cargando razas…"
                : "Busca o selecciona"
          }
          required={required}
          disabled={!animalTypeId}
          loading={loading}
          searchKey="breed"
          displayKey="breed"
          error={error}
        />
      </div>
      <button
        type="button"
        disabled={!animalTypeId || loading}
        onClick={() => {
          const fallback = findFallbackBreedId(breedOptions);
          if (fallback) {
            const selected = breedOptions.find((option) => option.id === fallback);
            onChange(
              fallback,
              typeof selected?.breed === "string" ? selected.breed : "",
            );
            return;
          }
          sileo.error({
            title: "Busca mestizo",
            description:
              "No hay una raza “no sé” en este tipo. Elige la más cercana.",
          });
        }}
        className="mb-0.5 inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-semibold text-kadesh hover:bg-kadesh-50 disabled:opacity-40 dark:hover:bg-kadesh/20"
      >
        No sé
      </button>
    </div>
  );
}

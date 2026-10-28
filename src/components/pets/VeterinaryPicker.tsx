"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Autocomplete, type AutocompleteOption } from 'kadesh/components/shared';
import { SEARCH_VETERINARIES_QUERY, type SearchVeterinariesResponse } from './queries';

/** Busca la veterinaria en el directorio por nombre (mínimo 2 letras). Es opcional. */
export default function VeterinaryPicker({
  value,
  initial,
  onChange,
}: {
  value: string;
  /** La que ya tenía el registro, para mostrar su nombre al editar. */
  initial?: { id: string; name: string } | null;
  onChange: (vet: { id: string; name: string } | null) => void;
}) {
  const [typed, setTyped] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const id = window.setTimeout(() => setSearch(typed.trim()), 300);
    return () => window.clearTimeout(id);
  }, [typed]);

  const { data, loading } = useQuery<SearchVeterinariesResponse>(SEARCH_VETERINARIES_QUERY, {
    variables: { search },
    skip: search.length < 2,
  });

  const options: AutocompleteOption[] = useMemo(() => {
    const found = (data?.petPlaces ?? []).map((place) => ({
      id: place.id,
      label: place.municipality ? `${place.name} · ${place.municipality}` : place.name,
      name: place.name,
    }));
    if (initial && !found.some((option) => option.id === initial.id)) {
      found.unshift({ id: initial.id, label: initial.name, name: initial.name });
    }
    return found;
  }, [data, initial]);

  return (
    <Autocomplete
      id="health-record-vet"
      label="Veterinaria"
      value={value}
      options={options}
      onChange={setTyped}
      onSelect={(option) =>
        onChange(option.id ? { id: option.id, name: String(option.name ?? option.label) } : null)
      }
      placeholder="Busca por nombre (opcional)"
      loading={loading && search.length >= 2}
    />
  );
}

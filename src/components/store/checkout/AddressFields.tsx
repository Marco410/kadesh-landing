'use client';

import { MEXICO_STATES } from 'kadesh/components/events/mexicoStates';
import type { StoreAddress, StoreAddressInput } from '../types';

export const checkoutFieldClass =
  'min-h-12 w-full rounded-xl border border-[#d8dee8] bg-white px-3.5 text-[15px] text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6]';

export const checkoutLabelClass = 'flex flex-col gap-1 text-sm font-semibold text-[#3a3a3a] dark:text-[#d0d0d0]';

export const EMPTY_ADDRESS: StoreAddressInput = {
  recipientName: '',
  phone: '',
  street: '',
  exteriorNumber: '',
  interiorNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  references: '',
};

export function addressToInput(address: StoreAddress): StoreAddressInput {
  return {
    recipientName: address.recipientName,
    phone: address.phone,
    street: address.street,
    exteriorNumber: address.exteriorNumber,
    interiorNumber: address.interiorNumber ?? '',
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.stateCode,
    postalCode: address.postalCode,
    references: address.references ?? '',
  };
}

/** One line a person can check at a glance. */
export function addressLine(address: StoreAddress): string {
  return `${address.street} ${address.exteriorNumber}${address.interiorNumber ? ` int. ${address.interiorNumber}` : ''}, ${address.neighborhood}, ${address.postalCode} ${address.city}, ${address.stateName}`;
}

/** The first thing missing in an address, or `null` when it can be sent. The server checks again. */
export function addressProblem(address: StoreAddressInput): string | null {
  if (address.recipientName.trim().length < 3) return 'Escribe el nombre de quien recibe.';
  if (address.phone.replace(/\D/g, '').length !== 10) return 'El teléfono de quien recibe debe tener 10 dígitos.';
  if (!address.street.trim()) return 'Escribe la calle.';
  if (!address.exteriorNumber.trim()) return 'Escribe el número exterior (o «S/N»).';
  if (!address.neighborhood.trim()) return 'Escribe la colonia.';
  if (address.postalCode.replace(/\D/g, '').length !== 5) return 'El código postal debe tener 5 dígitos.';
  if (!address.city.trim()) return 'Escribe el municipio o alcaldía.';
  if (!address.state) return 'Elige el estado.';
  return null;
}

/** Fields of a shipping address in Mexico: what a carrier needs to deliver. */
export default function AddressFields({
  value,
  onChange,
  idPrefix = 'direccion',
}: {
  value: StoreAddressInput;
  onChange: (next: StoreAddressInput) => void;
  idPrefix?: string;
}) {
  const set = (field: keyof StoreAddressInput, text: string) => onChange({ ...value, [field]: text });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <label className={`${checkoutLabelClass} sm:col-span-4`}>
        Quién recibe
        <input
          id={`${idPrefix}-nombre`}
          value={value.recipientName}
          onChange={(event) => set('recipientName', event.target.value)}
          autoComplete="name"
          maxLength={120}
          className={checkoutFieldClass}
        />
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-2`}>
        Teléfono
        <input
          value={value.phone}
          onChange={(event) => set('phone', event.target.value)}
          autoComplete="tel-national"
          inputMode="tel"
          maxLength={15}
          placeholder="10 dígitos"
          className={checkoutFieldClass}
        />
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-4`}>
        Calle
        <input
          value={value.street}
          onChange={(event) => set('street', event.target.value)}
          autoComplete="address-line1"
          maxLength={160}
          className={checkoutFieldClass}
        />
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-1`}>
        Núm. ext.
        <input
          value={value.exteriorNumber}
          onChange={(event) => set('exteriorNumber', event.target.value)}
          maxLength={20}
          className={checkoutFieldClass}
        />
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-1`}>
        Núm. int.
        <input
          value={value.interiorNumber ?? ''}
          onChange={(event) => set('interiorNumber', event.target.value)}
          maxLength={20}
          placeholder="Opcional"
          className={checkoutFieldClass}
        />
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-4`}>
        Colonia
        <input
          value={value.neighborhood}
          onChange={(event) => set('neighborhood', event.target.value)}
          autoComplete="address-line2"
          maxLength={120}
          className={checkoutFieldClass}
        />
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-2`}>
        Código postal
        <input
          value={value.postalCode}
          onChange={(event) => set('postalCode', event.target.value.replace(/\D/g, '').slice(0, 5))}
          autoComplete="postal-code"
          inputMode="numeric"
          className={checkoutFieldClass}
        />
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-3`}>
        Municipio o alcaldía
        <input
          value={value.city}
          onChange={(event) => set('city', event.target.value)}
          autoComplete="address-level2"
          maxLength={120}
          className={checkoutFieldClass}
        />
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-3`}>
        Estado
        <select
          value={value.state}
          onChange={(event) => set('state', event.target.value)}
          autoComplete="address-level1"
          className={checkoutFieldClass}
        >
          <option value="">Elige un estado</option>
          {MEXICO_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </label>
      <label className={`${checkoutLabelClass} sm:col-span-6`}>
        Referencias para encontrar el domicilio (opcional)
        <input
          value={value.references ?? ''}
          onChange={(event) => set('references', event.target.value)}
          maxLength={300}
          placeholder="Entre qué calles, color de la casa…"
          className={checkoutFieldClass}
        />
      </label>
    </div>
  );
}

'use client';

import { MEXICO_STATES } from 'kadesh/components/events/mexicoStates';
import type { ReactNode } from 'react';
import { cn } from 'kadesh/utils/cn';
import type { StoreAddress, StoreAddressInput } from '../types';

export const checkoutFieldClass =
  'min-h-12 w-full rounded-xl border border-[#d8dee8] bg-white px-3.5 text-[15px] text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh dark:border-white/18 dark:bg-night dark:text-[#eef1f6]';

export const checkoutFieldErrorClass = 'border-red-500 ring-1 ring-red-500 dark:border-red-400 dark:ring-red-400';

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

/**
 * The 10 digits of a Mexican phone. Accepts what people type: spaces, dashes, parentheses and the
 * country code (+52, or +52 1 of old mobile numbers). Same rule as the server.
 */
export function mxPhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('521') && digits.length === 13) digits = digits.slice(3);
  else if (digits.startsWith('52') && digits.length === 12) digits = digits.slice(2);
  return digits;
}

export type AddressErrors = Partial<Record<keyof StoreAddressInput, string>>;

/** Order of the fields on screen: the first one with a problem gets the focus. */
export const ADDRESS_FIELD_ORDER: Array<keyof StoreAddressInput> = [
  'recipientName',
  'phone',
  'street',
  'exteriorNumber',
  'neighborhood',
  'postalCode',
  'city',
  'state',
];

/** Everything missing in an address, by field (empty when it can be sent). The server checks again. */
export function addressErrors(address: StoreAddressInput): AddressErrors {
  const errors: AddressErrors = {};
  if (address.recipientName.trim().length < 3) errors.recipientName = 'Escribe el nombre de quien recibe.';
  if (mxPhoneDigits(address.phone).length !== 10) errors.phone = 'Debe tener 10 dígitos.';
  if (!address.street.trim()) errors.street = 'Escribe la calle.';
  if (!address.exteriorNumber.trim()) errors.exteriorNumber = 'Escribe el número (o «S/N»).';
  if (!address.neighborhood.trim()) errors.neighborhood = 'Escribe la colonia.';
  if (address.postalCode.replace(/\D/g, '').length !== 5) errors.postalCode = 'Debe tener 5 dígitos.';
  if (!address.city.trim()) errors.city = 'Escribe el municipio o alcaldía.';
  if (!address.state) errors.state = 'Elige el estado.';
  return errors;
}

export function addressFieldId(idPrefix: string, field: keyof StoreAddressInput): string {
  return `${idPrefix}-${field}`;
}

/** A label, its control and the control's error, tied together for screen readers. */
export function CheckoutField({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(checkoutLabelClass, className)}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <span id={`${id}-error`} className="text-[13px] font-medium text-red-700 dark:text-red-300">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** Props that mark a control as invalid and point it to its message. */
export function invalidProps(id: string, error?: string) {
  return error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {};
}

/** Fields of a shipping address in Mexico: what a carrier needs to deliver. */
export default function AddressFields({
  value,
  onChange,
  errors = {},
  idPrefix = 'direccion',
}: {
  value: StoreAddressInput;
  onChange: (next: StoreAddressInput) => void;
  errors?: AddressErrors;
  idPrefix?: string;
}) {
  const set = (field: keyof StoreAddressInput, text: string) => onChange({ ...value, [field]: text });
  const id = (field: keyof StoreAddressInput) => addressFieldId(idPrefix, field);
  const control = (field: keyof StoreAddressInput) => ({
    id: id(field),
    className: cn(checkoutFieldClass, errors[field] && checkoutFieldErrorClass),
    ...invalidProps(id(field), errors[field]),
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <CheckoutField id={id('recipientName')} label="Quién recibe" error={errors.recipientName} className="sm:col-span-4">
        <input
          {...control('recipientName')}
          value={value.recipientName}
          onChange={(event) => set('recipientName', event.target.value)}
          autoComplete="name"
          maxLength={120}
        />
      </CheckoutField>
      <CheckoutField id={id('phone')} label="Teléfono" error={errors.phone} className="sm:col-span-2">
        <input
          {...control('phone')}
          value={value.phone}
          onChange={(event) => set('phone', event.target.value)}
          autoComplete="tel"
          inputMode="tel"
          maxLength={20}
          placeholder="10 dígitos"
        />
      </CheckoutField>
      <CheckoutField id={id('street')} label="Calle" error={errors.street} className="sm:col-span-4">
        <input
          {...control('street')}
          value={value.street}
          onChange={(event) => set('street', event.target.value)}
          autoComplete="address-line1"
          maxLength={160}
        />
      </CheckoutField>
      <CheckoutField id={id('exteriorNumber')} label="Núm. ext." error={errors.exteriorNumber} className="sm:col-span-1">
        <input
          {...control('exteriorNumber')}
          value={value.exteriorNumber}
          onChange={(event) => set('exteriorNumber', event.target.value)}
          maxLength={20}
        />
      </CheckoutField>
      <CheckoutField id={id('interiorNumber')} label="Núm. int." className="sm:col-span-1">
        <input
          {...control('interiorNumber')}
          value={value.interiorNumber ?? ''}
          onChange={(event) => set('interiorNumber', event.target.value)}
          maxLength={20}
          placeholder="Opcional"
        />
      </CheckoutField>
      <CheckoutField id={id('neighborhood')} label="Colonia" error={errors.neighborhood} className="sm:col-span-4">
        <input
          {...control('neighborhood')}
          value={value.neighborhood}
          onChange={(event) => set('neighborhood', event.target.value)}
          autoComplete="address-line2"
          maxLength={120}
        />
      </CheckoutField>
      <CheckoutField id={id('postalCode')} label="Código postal" error={errors.postalCode} className="sm:col-span-2">
        <input
          {...control('postalCode')}
          value={value.postalCode}
          onChange={(event) => set('postalCode', event.target.value.replace(/\D/g, '').slice(0, 5))}
          autoComplete="postal-code"
          inputMode="numeric"
        />
      </CheckoutField>
      <CheckoutField id={id('city')} label="Municipio o alcaldía" error={errors.city} className="sm:col-span-3">
        <input
          {...control('city')}
          value={value.city}
          onChange={(event) => set('city', event.target.value)}
          autoComplete="address-level2"
          maxLength={120}
        />
      </CheckoutField>
      <CheckoutField id={id('state')} label="Estado" error={errors.state} className="sm:col-span-3">
        <select {...control('state')} value={value.state} onChange={(event) => set('state', event.target.value)} autoComplete="address-level1">
          <option value="">Elige un estado</option>
          {MEXICO_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </CheckoutField>
      <CheckoutField id={id('references')} label="Referencias para encontrar el domicilio (opcional)" className="sm:col-span-6">
        <input
          {...control('references')}
          value={value.references ?? ''}
          onChange={(event) => set('references', event.target.value)}
          maxLength={300}
          placeholder="Entre qué calles, color de la casa…"
        />
      </CheckoutField>
    </div>
  );
}

export type ProfileFieldKey =
  | 'name'
  | 'lastName'
  | 'phone'
  | 'birthday';

export type ProfileFieldErrors = Partial<Record<ProfileFieldKey, string>>;

/** Misma regla que Keystone (`User.hooks` phoneHooks): 10+ dígitos, opcional +. */
const PHONE_PATTERN = /^\+?\d{10,}$/;

export function normalizePhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

export function validateProfileFields(input: {
  name: string;
  lastName: string;
  phone: string;
  birthday: string;
}): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  const name = input.name.trim();
  const lastName = input.lastName.trim();
  const phone = normalizePhone(input.phone);

  if (!name) {
    errors.name = 'Escribe tu nombre.';
  }

  if (!lastName) {
    errors.lastName = 'Escribe tu apellido paterno.';
  }

  if (!phone) {
    errors.phone = 'Un teléfono para que te contacten.';
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = 'El teléfono debe ser de 10 dígitos y puros números.';
  }

  if (input.birthday) {
    const birth = new Date(`${input.birthday}T00:00:00`);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (Number.isNaN(birth.getTime())) {
      errors.birthday = 'Elige una fecha válida.';
    } else if (birth > today) {
      errors.birthday = 'La fecha no puede ser posterior a hoy.';
    }
  }

  return errors;
}

export function fieldErrorFromGraphQL(message: string): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  if (/User\.phone/i.test(message) || /teléfono/i.test(message)) {
    errors.phone =
      message.includes('missing value')
        ? 'Un teléfono para que te contacten.'
        : 'El teléfono debe ser de 10 dígitos y puros números.';
  }
  if (/User\.name/i.test(message)) {
    errors.name = 'Escribe tu nombre.';
  }
  if (/User\.lastName/i.test(message)) {
    errors.lastName = 'Escribe tu apellido paterno.';
  }
  if (/User\.birthday/i.test(message)) {
    errors.birthday = 'Elige una fecha válida.';
  }
  return errors;
}

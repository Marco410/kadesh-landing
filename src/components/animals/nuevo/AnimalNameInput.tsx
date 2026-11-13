"use client";

interface AnimalNameInputProps {
  value: string;
  onChange: (name: string) => void;
  /** «No sé su nombre»: el nombre se guarda vacío y la web lo describe («Perra café»). */
  unknown?: boolean;
  /** Sin esta función no se ofrece «No sé su nombre» (p. ej. al agendar una cita). */
  onUnknownChange?: (unknown: boolean) => void;
  required?: boolean;
  error?: string;
}

const PET_NAMES = [
  'Max', 'Luna', 'Rocky', 'Bella', 'Charlie', 'Daisy', 'Milo', 'Lola',
  'Cooper', 'Sadie', 'Buddy', 'Molly', 'Bear', 'Lucy', 'Duke', 'Zoe',
  'Jack', 'Lily', 'Toby', 'Chloe', 'Oscar', 'Sophie', 'Zeus', 'Mia',
  'Bruno', 'Coco', 'Jake', 'Ruby', 'Rex', 'Penny', 'Sam', 'Nala',
  'Buster', 'Rosie', 'Rusty', 'Gus', 'Maya', 'Leo',
  'Tucker', 'Stella', 'Murphy', 'Finn', 'Dixie', 'Harley', 'Willow',
  'Bentley', 'Pepper', 'Jax', 'Ginger', 'Ace', 'Princess', 'Bandit', 'Lucky',
  'Shadow', 'Apollo', 'Blue', 'Cash', 'Maggie',
  'Chance', 'Diesel', 'Sasha', 'Gunner', 'Roxy', 'King', 'Nina',
  'Simba', 'Oliver', 'Felix', 'Paco', 'Pepe', 'Chico', 'Amigo',
];

const inputClassName =
  'w-full rounded-xl border border-[#d8dee8] bg-white px-4 py-3 text-sm text-[#121212] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-kadesh disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/18 dark:bg-night dark:text-[#eef1f6] dark:placeholder:text-[#9aa3b2]';

export default function AnimalNameInput({
  value,
  onChange,
  unknown = false,
  onUnknownChange,
  required = false,
  error,
}: AnimalNameInputProps) {
  const generateRandomName = () => {
    const randomName = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
    onChange(randomName);
    onUnknownChange?.(false);
  };

  const handleUnknownChange = (checked: boolean) => {
    onUnknownChange?.(checked);
    if (checked) onChange('');
  };

  return (
    <div>
      <label
        htmlFor="name"
        className="mb-2 block text-sm font-semibold text-[#121212] dark:text-[#eef1f6]"
      >
        Nombre {required && !unknown && <span className="text-red-600">*</span>}
      </label>

      <div className="space-y-3">
        {onUnknownChange ? (
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#3a3a3a] dark:text-[#d0d0d0]">
            <input
              id="noName"
              type="checkbox"
              checked={unknown}
              onChange={(e) => handleUnknownChange(e.target.checked)}
              className="h-4 w-4 rounded border-[#d8dee8] text-kadesh focus:ring-kadesh"
            />
            No sé su nombre
          </label>
        ) : null}
        {unknown ? (
          <p className="text-xs text-[#5a5a5a] dark:text-[#9aa3b2]">
            Lo mostraremos por su tipo y color (por ejemplo, «Perra café»). Si su familia aparece, podrá
            ponerle su nombre.
          </p>
        ) : null}

        <div className="flex gap-2">
          <input
            id="name"
            type="text"
            value={unknown ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            required={required && !unknown}
            disabled={unknown}
            className={inputClassName}
            placeholder={unknown ? 'Sin nombre conocido' : 'Ej. Luna, Rocky…'}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={generateRandomName}
            disabled={unknown}
            className="shrink-0 rounded-xl bg-kadesh px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-kadesh-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kadesh"
          >
            Sugerir
          </button>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

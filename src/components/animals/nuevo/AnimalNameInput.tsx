"use client";

import { useState, useEffect } from 'react';

interface AnimalNameInputProps {
  value: string;
  onChange: (name: string) => void;
  required?: boolean;
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
  'Maximus', 'Zoey', 'Ranger', 'Layla', 'Samson',
  'Thor', 'Titan',
  'Simba', 'Oliver', 'Felix', 'Whiskers',
  'Garfield', 'Tom', 'Jerry', 'Spike',
  'Fluffy', 'Snowball', 'Mittens',
  'Tiger', 'Smokey', 'Patches', 'Oreo',
  'Gizmo', 'Pumpkin', 'Cinnamon',
  'Mocha', 'Caramel', 'Honey',
  'Sunny', 'Buttercup', 'Dandelion', 'Marigold',
  'Rio', 'Samba', 'Tango', 'Cha-Cha',
  'Paco', 'Pepe', 'Chico', 'Loco',
  'Amigo', 'Bonito', 'Chiquito', 'Fiesta',
];

export default function AnimalNameInput({ value, onChange, required = false }: AnimalNameInputProps) {
  const [hasNoName, setHasNoName] = useState(value === 'Sin nombre' || value === '');

  useEffect(() => {
    if (value === 'Sin nombre') {
      setHasNoName(true);
    } else if (value && value !== 'Sin nombre') {
      setHasNoName(false);
    }
  }, [value]);

  const generateRandomName = () => {
    const randomIndex = Math.floor(Math.random() * PET_NAMES.length);
    const randomName = PET_NAMES[randomIndex];
    onChange(randomName);
    setHasNoName(false);
  };

  const handleNoNameChange = (checked: boolean) => {
    setHasNoName(checked);
    if (checked) {
      onChange('Sin nombre');
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    onChange(newName);
    if (newName.trim() !== '' && newName.trim() !== 'Sin nombre') {
      setHasNoName(false);
    } else if (newName.trim() === 'Sin nombre') {
      setHasNoName(true);
    }
  };

  return (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
        Nombre del Animal {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            id="noName"
            type="checkbox"
            checked={hasNoName}
            onChange={(e) => handleNoNameChange(e.target.checked)}
            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
          />
          <label htmlFor="noName" className="text-sm font-medium text-[#212121] dark:text-[#ffffff] cursor-pointer">
            El animal no tiene nombre
          </label>
        </div>

        {/* Input de nombre y botón generador */}
        <div className="flex gap-2">
          <input
            id="name"
            type="text"
            value={value}
            onChange={handleNameChange}
            required={required && !hasNoName}
            disabled={hasNoName}
            className="flex-1 px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={hasNoName ? "Sin nombre (se establecerá automáticamente)" : "Ej: Max, Luna, Rocky..."}
          />
          <button
            type="button"
            onClick={generateRandomName}
            disabled={hasNoName}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
            title="Generar nombre aleatorio"
          >
            🎲 Generar
          </button>
        </div>
      </div>
    </div>
  );
}

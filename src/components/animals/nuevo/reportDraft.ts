const DB_NAME = 'kadesh-drafts';
const DB_VERSION = 1;
const STORE = 'animal-reports';

export type AnimalReportDraftV1 = {
  v: 1;
  step: number;
  showNotes: boolean;
  name: string;
  animalTypeId: string;
  animalBreedId: string;
  sex: string;
  status: string;
  physicalDescription: string;
  age: string;
  color: string;
  size: string;
  lat: string;
  lng: string;
  address: string;
  city: string;
  state: string;
  country: string;
  notes: string;
  contactNumber: string;
  dateStatus: string;
  isToday: boolean;
  images: { name: string; type: string; dataUrl: string }[];
};

function openDraftDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAnimalReportDraft(
  userId: string
): Promise<AnimalReportDraftV1 | null> {
  try {
    const db = await openDraftDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const request = tx.objectStore(STORE).get(userId);
      request.onsuccess = () => {
        const value = request.result as AnimalReportDraftV1 | undefined;
        resolve(value?.v === 1 ? value : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveAnimalReportDraft(
  userId: string,
  draft: AnimalReportDraftV1
): Promise<void> {
  const db = await openDraftDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(draft, userId);
  });
}

export async function clearAnimalReportDraft(userId: string): Promise<void> {
  try {
    const db = await openDraftDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).delete(userId);
    });
  } catch {
    // Ignore: publishing already succeeded.
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function dataUrlToFile(dataUrl: string, name: string, type: string): File {
  const comma = dataUrl.indexOf(',');
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], name, { type: type || 'image/jpeg' });
}

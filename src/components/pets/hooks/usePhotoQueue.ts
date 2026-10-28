"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { sileo } from 'sileo';
import { toUploadableImage } from 'kadesh/utils/uploadable-image';
import { MAX_IMAGE_BYTES } from '../constants';

export interface QueuedPhoto {
  file: File;
  preview: string;
}

/**
 * Fotos nuevas antes de subirlas: convierte HEIC a JPG, descarta lo que no es imagen o pesa más
 * de 5 MB y respeta el tope (`max` menos las que ya existen). Mismo criterio que los reportes.
 */
export function usePhotoQueue(max: number) {
  const [photos, setPhotos] = useState<QueuedPhoto[]>([]);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview));
    },
    [],
  );

  const add = useCallback(
    async (incoming: File[]) => {
      const remaining = max - photosRef.current.length;
      const accepted: QueuedPhoto[] = [];
      let skippedSize = 0;
      let skippedConvert = 0;
      let skippedCap = 0;
      for (const raw of incoming) {
        const isImage =
          raw.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(raw.name);
        if (!isImage) continue;
        if (accepted.length >= remaining) {
          skippedCap += 1;
          continue;
        }
        let file: File;
        try {
          file = await toUploadableImage(raw);
        } catch (error) {
          console.error('[pets] no se pudo convertir la foto', raw.name, error);
          skippedConvert += 1;
          continue;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          skippedSize += 1;
          continue;
        }
        accepted.push({ file, preview: URL.createObjectURL(file) });
      }
      if (skippedConvert) {
        sileo.error({ title: 'No pudimos leer una foto', description: 'Intenta con otra o guárdala como JPG.' });
      } else if (skippedSize) {
        sileo.error({ title: 'Foto demasiado pesada', description: 'Cada imagen debe pesar 5 MB o menos.' });
      } else if (skippedCap) {
        sileo.error({ title: `Solo caben ${Math.max(remaining, 0)}`, description: 'Quita una foto para agregar otra.' });
      }
      if (accepted.length) setPhotos((current) => [...current, ...accepted]);
    },
    [max],
  );

  const remove = useCallback((index: number) => {
    setPhotos((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return current.filter((_, i) => i !== index);
    });
  }, []);

  const reorder = useCallback((from: number, to: number) => {
    setPhotos((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      if (moved) next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
  }, []);

  return { photos, add, remove, reorder, reset };
}

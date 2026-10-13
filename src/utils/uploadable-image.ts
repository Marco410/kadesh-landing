/**
 * Keystone solo acepta jpg, png, webp y gif en los campos `image`.
 * Las fotos de iPhone llegan en HEIC/HEIF (y algunos Android en AVIF), así que
 * se convierten a JPEG en el navegador antes de subirlas.
 */

const KEYSTONE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const KEYSTONE_IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const HEIC_EXT = /\.(heic|heif)$/i;
const MAX_SIDE = 2560;
const JPEG_QUALITY = 0.85;

function isHeicFile(file: File) {
  return /^image\/hei[cf](-sequence)?$/i.test(file.type) || HEIC_EXT.test(file.name);
}

function isKeystoneImage(file: File) {
  if (isHeicFile(file)) return false;
  return file.type
    ? KEYSTONE_IMAGE_TYPES.has(file.type.toLowerCase())
    : KEYSTONE_IMAGE_EXT.test(file.name);
}

async function decode(file: File): Promise<ImageBitmap> {
  if (isHeicFile(file)) {
    const { heicTo } = await import('heic-to/next');
    return heicTo({ blob: file, type: 'bitmap' });
  }
  return createImageBitmap(file);
}

function toJpegName(name: string) {
  const base = name.replace(/\.[^./\\]+$/, '') || 'foto';
  return `${base}.jpg`;
}

/**
 * Devuelve el archivo tal cual si Keystone ya lo acepta; si no, lo convierte a JPEG.
 * Lanza un error si el navegador no puede leer la imagen.
 */
export async function toUploadableImage(file: File): Promise<File> {
  if (isKeystoneImage(file)) return file;

  const bitmap = await decode(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo preparar la imagen.');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    );
    if (!blob) throw new Error('No se pudo convertir la imagen.');

    return new File([blob], toJpegName(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}

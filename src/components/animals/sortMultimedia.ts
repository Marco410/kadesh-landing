export function sortMultimediaByOrder<T extends { order?: number | null }>(
  items: T[] | null | undefined
): T[] {
  return [...(items ?? [])].sort((a, b) => {
    const left = a.order == null ? Number.POSITIVE_INFINITY : a.order;
    const right = b.order == null ? Number.POSITIVE_INFINITY : b.order;
    return left - right;
  });
}

const _store = new Map<string, { data: unknown }>();

/** Obtener del cache. Devuelve null si nunca se pidió esta key. */
export function cacheGet<T>(key: string): T | null {
  const entry = _store.get(key);
  return entry ? (entry.data as T) : null;
}

/** Guardar en cache. */
export function cacheSet(key: string, data: unknown): void {
  _store.set(key, { data });
}

/** Invalidar cache completo o por prefijo (ej: "products."). */
export function cacheClear(prefix?: string): void {
  if (!prefix) {
    _store.clear();
    return;
  }
  for (const key of _store.keys()) {
    if (key.startsWith(prefix)) _store.delete(key);
  }
}

/** Generar key consistente a partir de partes. */
export function cacheKey(...parts: (string | number | undefined | null)[]): string {
  return parts.filter((p) => p != null && p !== "").join(":");
}

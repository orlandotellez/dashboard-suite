// ---------------------------------------------------------------------------
// Simple module-level data cache with TTL
// ---------------------------------------------------------------------------
// Las páginas se montan/desmontan al navegar, pero este módulo vive en memoria
// toda la sesión. Así podemos saltarnos el fetch inicial si ya tenemos datos.
// ---------------------------------------------------------------------------

const _store = new Map<string, { data: unknown; ts: number }>();
const DEFAULT_TTL = 60_000; // 1 minuto

/** Obtener del cache. Devuelve null si no existe o expiró. */
export function cacheGet<T>(key: string): T | null {
  const entry = _store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > DEFAULT_TTL) {
    _store.delete(key);
    return null;
  }
  return entry.data as T;
}

/** Guardar en cache. */
export function cacheSet(key: string, data: unknown): void {
  _store.set(key, { data, ts: Date.now() });
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

type Entry<T> = { value: T; expiresAt: number }
const store = new Map<string, Entry<any>>()

export function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key)
  if (!hit) return
  if (Date.now() > hit.expiresAt) { store.delete(key); return }
  return hit.value as T
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export function cacheClear() {
  store.clear()
}

export function cacheDelete(key: string) {
  store.delete(key)
}

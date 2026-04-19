// Server-side cache singleton
const SERVER_CACHE = new Map<string, { data: any; timestamp: number }>();
const MAX_ENTRIES = 100;
const TTL_MS = 60 * 60 * 1000; // 1 hour

export function getCachedServer(key: string) {
  const normalizedKey = key.toLowerCase().trim();
  const entry = SERVER_CACHE.get(normalizedKey);
  
  if (entry) {
    if (Date.now() - entry.timestamp < TTL_MS) {
      return entry.data;
    }
    // Remove if expired
    SERVER_CACHE.delete(normalizedKey);
  }
  return null;
}

export function setCachedServer(key: string, data: any) {
  const normalizedKey = key.toLowerCase().trim();
  
  // Evict oldest if full
  if (SERVER_CACHE.size >= MAX_ENTRIES && !SERVER_CACHE.has(normalizedKey)) {
    const oldestKey = Array.from(SERVER_CACHE.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    SERVER_CACHE.delete(oldestKey);
  }
  
  SERVER_CACHE.set(normalizedKey, {
    data,
    timestamp: Date.now()
  });
}

"use client";

const DREAM_CACHE_KEY = "dream-evolution-cache";
const MAX_DREAMS = 5;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface FullCache {
  [dreamKey: string]: CacheEntry;
}

function getDreamKey(dream: string) {
  return dream.toLowerCase().trim();
}

export function getCachedDream(dream: string) {
  if (typeof window === "undefined") return null;
  
  try {
    const raw = localStorage.getItem(DREAM_CACHE_KEY);
    if (!raw) return null;
    
    const cache: FullCache = JSON.parse(raw);
    const key = getDreamKey(dream);
    const entry = cache[key];
    
    if (entry && Date.now() - entry.timestamp < TTL_MS) {
      return entry.data;
    }
    
    // Clear expired
    if (entry) {
      delete cache[key];
      localStorage.setItem(DREAM_CACHE_KEY, JSON.stringify(cache));
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function setCachedDream(dream: string, data: any) {
  if (typeof window === "undefined") return;
  
  try {
    const raw = localStorage.getItem(DREAM_CACHE_KEY);
    const cache: FullCache = raw ? JSON.parse(raw) : {};
    const key = getDreamKey(dream);
    
    // Evict oldest if max reached and it's a new entry
    const keys = Object.keys(cache);
    if (keys.length >= MAX_DREAMS && !cache[key]) {
      const oldestKey = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp)[0];
      delete cache[oldestKey];
    }
    
    cache[key] = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(DREAM_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to set dream cache:", e);
  }
}

export function clearDreamCache() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DREAM_CACHE_KEY);
  }
}

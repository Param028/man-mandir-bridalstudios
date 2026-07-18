/**
 * Featured Products for "Photos of the Week"
 * ─────────────────────────────────────────
 * Stores the list of product IDs that the admin has curated as
 * "Photos of the Week". Persisted in localStorage so it survives
 * page refreshes without requiring a backend change.
 */

const KEY = 'photosOfWeek_featuredIds'

export function getFeaturedIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setFeaturedIds(ids: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(ids))
}

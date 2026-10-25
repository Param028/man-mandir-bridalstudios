import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type SiteSettingKey =
  | 'sale_strip_enabled'
  | 'reviews_auto_publish'
  | 'craftsmanship'
  | 'stats'
  | 'footer'
  | 'social_links'

export type SiteSettingRow = {
  key: SiteSettingKey
  value: unknown
}

async function fetchPublicSettings(): Promise<Partial<Record<SiteSettingKey, unknown>>> {
  const { data, error } = await supabase
    .from('public_site_settings')
    .select('key,value')

  if (error) throw error

  return (data ?? []).reduce<Partial<Record<SiteSettingKey, unknown>>>((settings, row) => {
    settings[row.key as SiteSettingKey] = row.value
    return settings
  }, {})
}

export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['public-site-settings'],
    queryFn: fetchPublicSettings,
    staleTime: 60_000,
    retry: false,
  })
}

export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

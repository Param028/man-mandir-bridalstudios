import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

type JsonRecord = Record<string, unknown>
const inputClass = 'w-full border border-[#D0C9C0] rounded px-4 py-3 font-body text-sm outline-none focus:border-[#8C7045] bg-white'
const labelClass = 'font-body text-xs tracking-[0.1em] uppercase text-[#514B46] block mb-2'

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {}
}

export default function AdminSettingsPage() {
  const [reviewsAutoPublish, setReviewsAutoPublish] = useState(false)
  const [saleStripEnabled, setSaleStripEnabled] = useState(false)
  const [craftsmanship, setCraftsmanship] = useState<JsonRecord>({})
  const [statsJson, setStatsJson] = useState('[]')
  const [footer, setFooter] = useState<JsonRecord>({})
  const [social, setSocial] = useState<JsonRecord>({})
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState('')

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const { data, error } = await supabase.from('site_settings').select('key,value')
      if (error) throw error
      const values = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]))
      setReviewsAutoPublish(values.reviews_auto_publish === true)
      setSaleStripEnabled(values.sale_strip_enabled === true)
      setCraftsmanship(asRecord(values.craftsmanship))
      setStatsJson(JSON.stringify(values.stats ?? [], null, 2))
      setFooter(asRecord(values.footer))
      setSocial(asRecord(values.social_links))
    } catch (error) {
      console.error('Unable to load site settings:', error)
      setLoadError('Site settings could not be loaded. Verify that this account is an active administrator and retry.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadSettings() }, [loadSettings])

  const saveSetting = async (key: string, value: unknown) => {
    setBusy(true)
    try {
      const { error } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
      if (error) throw error
      toast.success('Setting saved')
    } catch (error) {
      console.error(`Unable to save ${key}:`, error)
      toast.error('Setting could not be saved. Verify active admin access and try again.')
    } finally {
      setBusy(false)
    }
  }

  const saveStats = async () => {
    let value: unknown
    try { value = JSON.parse(statsJson) } catch { toast.error('Stats must be valid JSON.'); return }
    if (!Array.isArray(value) && (!value || typeof value !== 'object')) {
      toast.error('Stats must be a JSON array or object.')
      return
    }
    await saveSetting('stats', value)
  }

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setPasswordError('')
    if (newPassword.length < 8) return setPasswordError('Password must be at least 8 characters.')
    if (newPassword !== confirmPassword) return setPasswordError('Passwords do not match.')
    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Unable to update password:', error)
      setPasswordError('Password could not be updated. Confirm your authenticated session and try again.')
    } finally {
      setBusy(false)
    }
  }

  const updateObjectField = (setter: (next: JsonRecord) => void, current: JsonRecord, key: string, value: string) => {
    setter({ ...current, [key]: value })
  }

  if (loading) return <div className="py-16 text-center font-body text-sm text-[#514B46]">Loading settings…</div>

  return (
    <div className="max-w-4xl space-y-6">
      {loadError && <div role="alert" className="flex items-center justify-between gap-3 border border-[#E8C9C3] bg-[#FFF8F6] p-4 font-body text-sm text-[#9E4A3E]">{loadError}<button type="button" onClick={() => void loadSettings()} className="underline">Retry</button></div>}

      <section className="border border-[#E5E0D8] bg-white p-6 shadow-card">
        <h2 className="mb-5 font-body text-base font-medium text-[#2C2C2C]">Publishing controls</h2>
        <div className="space-y-5">
          <label className="flex items-start gap-3 font-body text-sm text-[#514B46]"><input type="checkbox" className="mt-1 accent-[#8C7045]" checked={saleStripEnabled} onChange={(event) => setSaleStripEnabled(event.target.checked)} /><span><strong className="block text-[#2C2C2C]">Enable sale announcement and cards</strong>Master switch. Individual sale dates and active state still control which promotions are shown.</span></label>
          <button type="button" disabled={busy} onClick={() => void saveSetting('sale_strip_enabled', saleStripEnabled)} className="bg-[#6B4F1D] px-5 py-2.5 font-body text-xs uppercase tracking-wide text-white disabled:opacity-50">Save sale switch</button>
          <div className="border-t border-[#F0ECE6] pt-5">
            <label className="flex items-start gap-3 font-body text-sm text-[#514B46]"><input type="checkbox" className="mt-1 accent-[#8C7045]" checked={reviewsAutoPublish} onChange={(event) => setReviewsAutoPublish(event.target.checked)} /><span><strong className="block text-[#2C2C2C]">Automatically publish eligible reviews</strong>When off, new reviews stay pending until an administrator approves them. Profanity checks still force moderation.</span></label>
            <button type="button" disabled={busy} onClick={() => void saveSetting('reviews_auto_publish', reviewsAutoPublish)} className="mt-3 bg-[#6B4F1D] px-5 py-2.5 font-body text-xs uppercase tracking-wide text-white disabled:opacity-50">Save review policy</button>
          </div>
        </div>
      </section>

      <section className="space-y-4 border border-[#E5E0D8] bg-white p-6 shadow-card">
        <div><h2 className="font-body text-base font-medium text-[#2C2C2C]">Craftsmanship content</h2><p className="mt-1 font-body text-sm text-[#514B46]">Only saved content is shown publicly. Leave unused fields blank.</p></div>
        <label className={labelClass}>Section heading<input className={inputClass} maxLength={120} value={String(craftsmanship.title ?? '')} onChange={(event) => updateObjectField(setCraftsmanship, craftsmanship, 'title', event.target.value)} /></label>
        <label className={labelClass}>Description<textarea className={`${inputClass} min-h-28 resize-y`} maxLength={3000} value={String(craftsmanship.body ?? '')} onChange={(event) => updateObjectField(setCraftsmanship, craftsmanship, 'body', event.target.value)} /></label>
        <label className={labelClass}>Public image URL (optional)<input className={inputClass} type="url" value={String(craftsmanship.image_url ?? '')} onChange={(event) => updateObjectField(setCraftsmanship, craftsmanship, 'image_url', event.target.value)} /></label>
        <button type="button" disabled={busy} onClick={() => void saveSetting('craftsmanship', craftsmanship)} className="bg-[#6B4F1D] px-5 py-2.5 font-body text-xs uppercase tracking-wide text-white disabled:opacity-50">Save craftsmanship</button>
      </section>

      <section className="space-y-4 border border-[#E5E0D8] bg-white p-6 shadow-card">
        <div><h2 className="font-body text-base font-medium text-[#2C2C2C]">Studio footer details</h2><p className="mt-1 font-body text-sm text-[#514B46]">Blank contact and social values remain hidden on the public site.</p></div>
        {(['description', 'address', 'phone', 'email', 'copyright'] as const).map((key) => <label key={key} className={labelClass}>{key === 'email' ? 'Email' : key[0].toUpperCase() + key.slice(1)}{key === 'description' || key === 'address' ? <textarea className={`${inputClass} mt-1 min-h-20`} value={String(footer[key] ?? '')} onChange={(event) => updateObjectField(setFooter, footer, key, event.target.value)} maxLength={1000} /> : <input className={`${inputClass} mt-1`} type={key === 'email' ? 'email' : 'text'} value={String(footer[key] ?? '')} onChange={(event) => updateObjectField(setFooter, footer, key, event.target.value)} maxLength={300} />}</label>)}
        <button type="button" disabled={busy} onClick={() => void saveSetting('footer', footer)} className="bg-[#6B4F1D] px-5 py-2.5 font-body text-xs uppercase tracking-wide text-white disabled:opacity-50">Save footer</button>
      </section>

      <section className="space-y-4 border border-[#E5E0D8] bg-white p-6 shadow-card">
        <div><h2 className="font-body text-base font-medium text-[#2C2C2C]">Social links</h2><p className="mt-1 font-body text-sm text-[#514B46]">Use full public https:// URLs. Invalid or empty links are not displayed.</p></div>
        {(['instagram', 'facebook', 'youtube', 'pinterest'] as const).map((key) => <label key={key} className={labelClass}>{key[0].toUpperCase() + key.slice(1)} URL<input className={`${inputClass} mt-1`} type="url" value={String(social[key] ?? '')} onChange={(event) => updateObjectField(setSocial, social, key, event.target.value)} placeholder="https://" maxLength={500} /></label>)}
        <button type="button" disabled={busy} onClick={() => void saveSetting('social_links', social)} className="bg-[#6B4F1D] px-5 py-2.5 font-body text-xs uppercase tracking-wide text-white disabled:opacity-50">Save social links</button>
      </section>

      <section className="space-y-4 border border-[#E5E0D8] bg-white p-6 shadow-card">
        <div><h2 className="font-body text-base font-medium text-[#2C2C2C]">Public studio stats</h2><p className="mt-1 font-body text-sm text-[#514B46]">Enter only verified figures. Supported formats: an array of objects like [{`{"label":"Years","value":"…"}`}], or an object of equivalent values.</p></div>
        <label className={labelClass}>Stats JSON<textarea className={`${inputClass} min-h-36 resize-y font-mono text-xs`} value={statsJson} onChange={(event) => setStatsJson(event.target.value)} spellCheck={false} /></label>
        <button type="button" disabled={busy} onClick={() => void saveStats()} className="bg-[#6B4F1D] px-5 py-2.5 font-body text-xs uppercase tracking-wide text-white disabled:opacity-50">Save stats</button>
      </section>

      <section className="border border-[#E5E0D8] bg-white p-6 shadow-card">
        <h2 className="mb-2 font-body text-base font-medium text-[#2C2C2C]">Change admin password</h2>
        <p className="mb-5 font-body text-sm text-[#514B46]">Your authenticated Supabase account will be updated.</p>
        <form onSubmit={(event) => void savePassword(event)} className="space-y-4">
          <label className={labelClass}>New password<input className={inputClass} type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
          <label className={labelClass}>Confirm new password<input className={inputClass} type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          {passwordError && <p role="alert" className="font-body text-sm text-[#B14F42]">{passwordError}</p>}
          <button type="submit" disabled={busy} className="bg-[#6B4F1D] px-5 py-2.5 font-body text-xs uppercase tracking-wide text-white disabled:opacity-50">Update password</button>
        </form>
      </section>
    </div>
  )
}

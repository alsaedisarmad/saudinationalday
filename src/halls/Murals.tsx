import { useCallback, useEffect, useRef, useState } from 'react'
import { backdrop } from '../backdrop/Backdrop'
import { murals, muralById } from '../content/murals'
import { discoverIds } from '../exhibition/discovery'
import { useSession, writeHash, parseHash } from '../session/session'
import { useStore } from '../session/store'
import { audio } from '../audio/engine'
import { Wall } from './murals/Wall'
import { MobileList } from './murals/MobileList'
import { Viewer } from './murals/Viewer'
import { css } from './murals/styles'

/**
 * الجداريات: صفحات مجلة «من قيمنا إلى رؤيتنا» كما ستُعلَّق في المعرض الواقعي — لوحات مؤطّرة على جدار دافئ بإضاءة معرض.
 * سبورة/سطح مكتب: جدار أفقي؛ الهاتف عموديًا: قائمة لوحة لوحة. والمس لوحة يفتح عارضًا كبيرًا (صورة + نص HTML + QR).
 * الرابط العميق #/mural/<id> (الوجهة الأولى لزائر الهاتف بعد مسح الـQR) يفتح العارض فورًا: الصورة والنص أولًا.
 */
export default function Murals() {
  const session = useSession()
  const mode = useStore((s) => s.mode)
  const initial = session.focus ? muralById(session.focus) : undefined
  const [openId, setOpenId] = useState<string | null>(initial?.id ?? null)
  const [lastId, setLastId] = useState<string | null>(initial?.id ?? null)
  const openRef = useRef(openId)
  openRef.current = openId
  const [notice, setNotice] = useState<string | null>(session.focus && !initial ? 'لم نجد هذه الجدارية — تصفّح الجدار واختر لوحة.' : null)

  useEffect(() => { backdrop.grade = 'murals'; backdrop.thread = 0; backdrop.threadY = 0.3 }, [])

  const open = useCallback((id: string) => {
    if (!muralById(id)) return
    audio.chime(murals.findIndex((m) => m.id === id) % 8)
    setOpenId(id)
    setLastId(id)
    setNotice(null)
  }, [])

  // كل جدارية تُفتح = اكتشاف + رابط عميق قابل للنسخ (replaceState لا يُطلق hashchange)
  useEffect(() => {
    if (!openId) return
    useStore.getState().discover(discoverIds.mural(openId))
    writeHash('murals', openId)
  }, [openId])

  // رابط عميق جديد أثناء وجودنا في القاعة (لصق/مسح رمز آخر) أو goto('murals', id)
  useEffect(() => {
    if (session.focus && session.focus !== openId && muralById(session.focus)) open(session.focus)
  }, [session.focus]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const on = () => {
      const p = parseHash()
      if (p.hall === 'murals' && p.focus && muralById(p.focus)) open(p.focus)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [open])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 9000)
    return () => clearTimeout(t)
  }, [notice])

  const close = useCallback(() => {
    const id = openId
    setOpenId(null)
    writeHash('murals')
    // Layer يعيد التركيز لما قبله؛ نوجّهه إلى اللوحة التي كانت مفتوحة
    if (id) setTimeout(() => document.querySelector<HTMLElement>(`.pr__btn[data-mural="${id}"]`)?.focus({ preventScroll: true }), 80)
  }, [openId])

  const step = useCallback((dir: 1 | -1) => {
    const cur = openRef.current
    if (!cur) return
    const n = murals[murals.findIndex((m) => m.id === cur) + dir]
    if (!n) return
    audio.tick()
    setOpenId(n.id)
    setLastId(n.id)
  }, [])

  const lastMural = (lastId && muralById(lastId)) || murals[0]
  const cur = openId ? muralById(openId) ?? null : null

  return (
    <div className="mhall" data-view={mode === 'mobile' ? 'list' : 'wall'}>
      {mode === 'mobile' ? (
        <MobileList onOpen={open} openId={openId} focusId={openId ?? lastId} />
      ) : (
        <Wall onOpen={open} openId={openId} focusId={openId ?? lastId} />
      )}
      {notice && <div className="mhall__notice label" role="status">{notice}</div>}
      <Viewer m={cur} last={lastMural} onClose={close} onStep={step} />
      <style>{css}</style>
    </div>
  )
}

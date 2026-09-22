import { useEffect } from 'react'
import { Stage } from './Stage'
import { useStore, detectMode } from '../session/store'
import { injectTokens } from '../design/tokens'

/** نقطة دخول رفيعة: كشف الوضع + حقن الرموز التصميمية ثم المسرح. لا منطق آخر هنا. */
export default function App() {
  const setMode = useStore((s) => s.setMode)
  const mode = useStore((s) => s.mode)

  useEffect(() => {
    const apply = () => setMode(detectMode())
    apply()
    let t: number
    const onResize = () => { clearTimeout(t); t = window.setTimeout(apply, 200) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setMode])

  useEffect(() => { injectTokens(mode) }, [mode])

  return <Stage />
}

import { useEffect, useState } from 'react'
import { backdrop } from '../backdrop/Backdrop'
import { VerseStage } from './VerseStage'
import { useSession } from '../session/session'

/**
 * الجذور: البيت الحرام ومقام إبراهيم — آيتان (2:125، 3:97) وتفسير السعدي عند «اكتشف المعنى».
 * التعبير بالعمارة والضوء والخط، لا بمجسّم للكعبة (SAUDI_VISUAL_LANGUAGE §6).
 */
const IDS = ['q2-125', 'q3-97']

export default function Roots() {
  const session = useSession()
  const [i, setI] = useState(() => (session.focus && IDS.includes(session.focus) ? IDS.indexOf(session.focus) : 0))
  useEffect(() => { backdrop.grade = 'roots'; backdrop.thread = 0; backdrop.threadY = 0.3 }, [])
  return <VerseStage ids={IDS} index={i} onIndex={setI} />
}

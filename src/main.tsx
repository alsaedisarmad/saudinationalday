import { createRoot } from 'react-dom/client'
import './design/global.css'
import { injectTokens } from './design/tokens'
import { detectMode } from './session/store'
import App from './app/App'

// الرموز قبل أول رسم لتفادي وميض بلا ألوان
injectTokens(detectMode())
createRoot(document.getElementById('root')!).render(<App />)

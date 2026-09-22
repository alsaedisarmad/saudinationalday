import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** base './' فيعمل الناتج من أي مجلد/استضافة (التوجيه بالـhash) */
export default defineConfig({ base: './', plugins: [react()] })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** بناء نسخة مستقلة (ملف HTML واحد بلا مراجع خارجية) لعرضها كـArtifact خاص. يُتبَع بـ scripts/inline-artifact.mjs */
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist-artifact',
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 4000,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})

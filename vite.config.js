import { defineConfig } from 'vite';

export default defineConfig({
  base: './',                 // relative URLs: works on Vercel and in any sub-folder
  build: {
    target: 'es2022',         // top-level await in main.js
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: { manualChunks: { three: ['three'], gsap: ['gsap', 'lenis'] } },
    },
  },
});

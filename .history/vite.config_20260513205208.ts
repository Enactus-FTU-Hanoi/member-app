// import react from '@vitejs/plugin-react'

export default {
  plugins: [],
  base: '/',  // Custom domain — no subfolder needed
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://api.enactusftuhanoi.id.vn'),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
} as const

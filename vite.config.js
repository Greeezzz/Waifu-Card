import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base : '/Waifu-Card/', // Set the base path for GitHub Pages
  plugins: [react()],
})

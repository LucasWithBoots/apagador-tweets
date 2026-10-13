import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Caminhos relativos para funcionar em lucaswithboots.github.io/apagador-tweets/
  base: './',
  plugins: [react()],
})

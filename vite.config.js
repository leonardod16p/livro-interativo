import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Caminho relativo: funciona tanto rodando localmente quanto publicado
  // em https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/ (GitHub Pages).
  base: './',
  server: {
    port: 5173,
    open: true
  }
})

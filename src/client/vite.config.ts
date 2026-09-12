import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          content: [
            path.resolve(__dirname, 'index.html'),
            path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}')
          ],
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                slate: {
                  850: '#151f32',
                  950: '#070d19',
                },
                indigo: {
                  950: '#1e1b4b',
                },
              },
              fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
              },
              animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              },
              keyframes: {
                fadeIn: {
                  '0%': { opacity: '0' },
                  '100%': { opacity: '1' },
                },
                slideUp: {
                  '0%': { transform: 'translateY(12px)', opacity: '0' },
                  '100%': { transform: 'translateY(0)', opacity: '1' },
                },
              },
            },
          },
        }),
        autoprefixer()
      ]
    }
  },
  build: {
    outDir: path.resolve(__dirname, '../../dist/client'),
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1500
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4173',
        changeOrigin: true
      }
    }
  }
});

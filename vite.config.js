import { defineConfig } from 'vite';

export default defineConfig({
  base: '/site-lacid/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        noticias: 'noticias.html',
        noticiaExpandida: 'noticia-expandida.html',
      },
    },
  },
});


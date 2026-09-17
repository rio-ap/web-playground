import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const tightenCsp = {
  name: 'tighten-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace("style-src 'self' 'unsafe-inline'", "style-src 'self'");
  },
};

export default defineConfig({
  plugins: [tailwindcss(), tightenCsp],
  base: '/web-playground/',
});

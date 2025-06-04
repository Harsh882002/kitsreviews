import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // ✅ Required for JSX
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()], // ✅ Combine both plugins in the array
});

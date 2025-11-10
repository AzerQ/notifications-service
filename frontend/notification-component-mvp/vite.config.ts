import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // Library build mode
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'NotificationComponent',
          formats: ['es', 'umd'],
          fileName: (format) => `notification-component.${format}.js`
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'mobx', 'mobx-react-lite'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              mobx: 'mobx',
              'mobx-react-lite': 'mobxReactLite'
            }
          }
        }
      }
    };
  }

  // Development mode
  return {
    plugins: [react()],
    server: {
      port: 3001,
      open: true
    }
  };
});

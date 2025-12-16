import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // Library build mode
    return {
      plugins: [react()],
      css: {
        modules: {
          // Generate scoped class names for CSS modules
          generateScopedName: '[name]__[local]___[hash:base64:5]',
          localsConvention: 'camelCase'
        }
      },
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
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
            },
            // Ensure CSS is extracted to a separate file
            assetFileNames: (assetInfo) => {
              if (assetInfo.name === 'style.css') {
                return 'notification-component.css';
              }
              return assetInfo.name || '';
            }
          }
        },
        cssCodeSplit: false
      }
    };
  }

  // Development mode
  return {
    plugins: [react()],
    css: {
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]',
        localsConvention: 'camelCase'
      }
    },
    server: {
      host: true,
      allowedHosts: ["localhost", "code.azerqtech.pw", "dev-front.azerqtech.pw"],
      port: 5094,
      open: true
    }
  };
});

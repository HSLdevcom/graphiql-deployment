import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import $monacoEditorPlugin from 'vite-plugin-monaco-editor';

const monacoEditorPlugin = $monacoEditorPlugin.default ?? $monacoEditorPlugin;

export default defineConfig({
  base: '/graphiql',
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json'],
      customWorkers: [
        {
          label: 'graphql',
          entry: 'monaco-graphql/esm/graphql.worker.js',
        },
      ],
    }),
  ],
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'build',
  },
});

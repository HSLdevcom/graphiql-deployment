import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import $monacoEditorPlugin from 'vite-plugin-monaco-editor';
import path from 'path';

const monacoEditorPlugin = $monacoEditorPlugin.default ?? $monacoEditorPlugin;

export default defineConfig({
  base: '/graphiql',
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json'],
      // This having to be here probably indicates a bug in vite-plugin-monaco-editor.
      // This changes the build path from graphiql/monacoeditorwork to monacoeditorwork.
      customDistPath: (root, buildOutDir) =>
        path.join(root, buildOutDir, 'monacoeditorwork'),
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

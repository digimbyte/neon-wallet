import react from '@vitejs/plugin-react'
import { bytecodePlugin, defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [
      react(),
      svgr(),
      nodePolyfills({
        include: ['crypto', 'util', 'stream', 'querystring'],
      }),
    ],
  },
})

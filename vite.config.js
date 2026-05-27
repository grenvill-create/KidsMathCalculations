import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isModernHost = command === 'serve' || process.env.VERCEL === '1' || process.env.CF_PAGES === '1' || process.env.NETLIFY === '1';
  return {
    base: isModernHost ? '/' : '/KidsMathCalculations/',
    plugins: [react(), cloudflare()],
    // 强制本地服务监听 IP 与指定端口，解决 Windows localhost 映射或端口冲突问题
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: true,
    }
  };
})
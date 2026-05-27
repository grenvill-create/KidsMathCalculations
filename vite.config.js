import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    base: '/',
    plugins: [react()],
    // 强制本地服务监听 IP 与指定端口，解决 Windows localhost 映射或端口冲突问题
    server: {
      host: '127.0.0.1',
      port: 3000,
      strictPort: true,
    }
  }
})

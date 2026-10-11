import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 部署到 GitHub Pages 项目仓库：JUI456.github.io/QiuCao/
// base 需指向 /QiuCao/，但本地 dev 仍用根路径，避免开发时 URL 带前缀
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/QiuCao/' : '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
}))

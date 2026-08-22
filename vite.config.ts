import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { validateAll } from './src/utils/puzzleGenerator'

// Data gate: fail the build if any puzzle bank entry is invalid
const res = validateAll()
if (res.olErrors > 0 || res.fmErrors > 0) {
  console.error(`Puzzle data validation FAILED: orderle errors=${res.olErrors}, fermi errors=${res.fmErrors}`)
  process.exit(1)
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base defaults to '/' — correct for web hosting
})

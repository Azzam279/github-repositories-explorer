/// <reference types="vitest" />
import { defineConfig } from "vitest/config"
import react from '@vitejs/plugin-react'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        exclude: [
            '**/dist/**',
            '**/node_modules/**',
            '**/public/**',
        ],
        coverage: {
            exclude: [
                '**/dist/**',
                '**/node_modules/**',
                '**/public/**',
                'eslint.config.js',
                'vite.config.ts',
                'vitest.config.ts',
                'src/main.tsx',
                'src/vite-env.d.ts',
            ],
        },
    },
    plugins: [react()],
})

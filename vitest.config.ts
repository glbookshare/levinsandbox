import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'node:url';
export default defineConfig({resolve:{alias:{'phaser':fileURLToPath(new URL('./node_modules/phaser/dist/phaser.js',import.meta.url)),'virtual:pwa-register':fileURLToPath(new URL('./src/test-support/pwa.ts',import.meta.url))}},test:{include:['src/**/*.test.ts']}});

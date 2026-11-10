import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
const base = process.env.VITE_BASE_PATH || '/';
export default defineConfig({ base, plugins:[VitePWA({registerType:'prompt',includeAssets:['icon-192.png','icon-512.png'],manifest:{name:'Pocket Physics',short_name:'Pocket Physics',description:'A friendly little physics playground',theme_color:'#f7f8f2',background_color:'#eef4ed',display:'standalone',orientation:'landscape',start_url:base,scope:base,icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,png,svg,ico,woff2}'],maximumFileSizeToCacheInBytes:8000000,cleanupOutdatedCaches:true}})]});

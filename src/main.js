import { createApp } from 'vue'
import App from './App.vue'

// Import UnoCSS
import '@unocss/reset/tailwind.css'
import 'uno.css'

// Vercel Analytics
import { inject } from '@vercel/analytics'

// Initialize analytics (no-op locally unless deployed on Vercel)
inject()

createApp(App).mount('#app')
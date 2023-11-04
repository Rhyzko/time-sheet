// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head:{
      title: 'AvaTimeSheet',
    },
      pageTransition: { name: 'page', mode: 'out-in' },
  },
  css: ['~/assets/css/main.scss'],
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  ssr: false,
  ui: {
    icons: ['heroicons', 'material-symbols', 'mdi']
  },
  modules: [
    '@vite-pwa/nuxt',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-icon',
    '@formkit/auto-animate/nuxt',
    "@nuxtjs/supabase",
    "@nuxt/image"
  ],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: "AvaTimeSheet",
      short_name: "AvaTimeSheet",
      display: "standalone",
      background_color: "#f97316",
      theme_color: '#f97316',
      description: "A new way to save your time",
      lang: "en",
      icons: [
        {
          "src": "img/logo-48-48.png",
          "sizes": "48x48",
          "type": "image/png"
        },
        {
          "src": "img/logo-72-72.png",
          "sizes": "72x72",
          "type": "image/png"
        },
        {
          "src": "img/logo-96-96.png",
          "sizes": "96x96",
          "type": "image/png"
        },
        {
          "src": "img/logo-144-144.png",
          "sizes": "144x144",
          "type": "image/png"
        },
        {
          "src": "img/logo-512-512.png",
          "sizes": "512x512",
          "type": "image/png"
        },
        {
          "src": "img/logo-192-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ],
  }}
})
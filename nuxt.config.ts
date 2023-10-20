// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@vite-pwa/nuxt',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-icon',
    '@formkit/auto-animate/nuxt'
  ],
  pwa: {
    manifest: {
      name: "TimeSheet",
      short_name: "TimeSheet",
      start_url: ".",
      display: "standalone",
      background_color: "#fff",
      description: "A new way to save timesheet",
      icons: [
        {
          "src": "images/touch/homescreen48.png",
          "sizes": "48x48",
          "type": "image/png"
        },
        {
          "src": "images/touch/homescreen72.png",
          "sizes": "72x72",
          "type": "image/png"
        },
        {
          "src": "images/touch/homescreen96.png",
          "sizes": "96x96",
          "type": "image/png"
        },
        {
          "src": "images/touch/homescreen144.png",
          "sizes": "144x144",
          "type": "image/png"
        },
        {
          "src": "images/touch/homescreen168.png",
          "sizes": "168x168",
          "type": "image/png"
        },
        {
          "src": "images/touch/homescreen192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ],
  }}
})

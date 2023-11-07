export default defineAppConfig({
  ui: {
    primary: 'orange',
    gray: 'cool',
    button: {
      base: "focus:outline-none focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-30 flex-shrink-0",
      default: {
        variant: 'outline',
      },
    },
  },
  nuxtIcon: {
    size: '20px',
    class: 'text-primary m-[6px]'
  }
})
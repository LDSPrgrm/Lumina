import { fileURLToPath } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  vite: {
    optimizeDeps: {
      include: ['zod'],
    }
  },
  app: {
    head: {
      title: "Lumina - AI Language Learning",
      meta: [
        {
          name: "description",
          content: "Master any language with AI-powered personalized quizzes.",
        },
        { name: "theme-color", content: "#00dc92" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap",
        },
      ],
    },
  },
  experimental: {
    externalVue: false,
  },
});

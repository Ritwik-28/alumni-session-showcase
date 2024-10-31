/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DIRECTUS_URL: string
  readonly VITE_DIRECTUS_EMAIL: string
  readonly VITE_DIRECTUS_PASSWORD: string
  readonly VITE_COLLECTION_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
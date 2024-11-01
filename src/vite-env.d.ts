/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DIRECTUS_URL: string;
  readonly VITE_DIRECTUS_EMAIL: string;
  readonly VITE_DIRECTUS_PASSWORD: string;
  readonly VITE_COLLECTION_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Define specific types for gtag function calls
interface GtagConfigParams {
  send_page_view?: boolean;
  cookie_flags?: string;
  [key: string]: unknown; // Allows for additional optional parameters
}

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown; // Allows for additional optional parameters
}

// Extend the Window interface with a more structured gtag function type
interface Window {
  gtag?: (
    command: 'config' | 'event',
    targetId: string,
    params?: GtagConfigParams | GtagEventParams
  ) => void;
}
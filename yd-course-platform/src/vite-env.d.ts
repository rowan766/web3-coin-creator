/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INFURA_API_KEY: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_YD_TOKEN_ADDRESS: string
  readonly VITE_COURSE_PLATFORM_ADDRESS: string
  readonly VITE_DEFAULT_CHAIN_ID: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
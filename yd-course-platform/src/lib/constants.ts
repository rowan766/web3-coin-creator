// src/lib/constants.ts
export const CHAIN_IDS = {
  SEPOLIA: 11155111,
  MAINNET: 1,
} as const

export const SUPPORTED_CHAINS = [CHAIN_IDS.SEPOLIA]

export const RPC_URLS: Record<number, string> = {
  [CHAIN_IDS.SEPOLIA]: `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
  [CHAIN_IDS.MAINNET]: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`,
}

// 合约地址 - 从环境变量读取
export const CONTRACT_ADDRESSES = {
  YD_TOKEN: import.meta.env.VITE_YD_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000",
  COURSE_PLATFORM: import.meta.env.VITE_COURSE_PLATFORM_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const

// 网络信息
export const NETWORK_NAMES: Record<number, string> = {
  [CHAIN_IDS.SEPOLIA]: "Sepolia",
  [CHAIN_IDS.MAINNET]: "Ethereum",
}

// WalletConnect 项目ID（需要到 https://cloud.walletconnect.com 申请）
export const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "your_walletconnect_project_id"

// 其他常量
export const DEFAULT_CHAIN_ID = CHAIN_IDS.SEPOLIA
export const APP_NAME = "YD Course Platform"
export const APP_DESCRIPTION = "基于区块链的去中心化课程平台"
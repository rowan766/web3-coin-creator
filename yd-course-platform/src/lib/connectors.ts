// src/lib/connectors.ts
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { SUPPORTED_CHAINS, RPC_URLS, WALLET_CONNECT_PROJECT_ID } from './constants'

// MetaMask 连接器
export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAINS,
})

// WalletConnect 连接器
export const walletConnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  chainId: SUPPORTED_CHAINS[0],
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000,
})

// 连接器映射
export const connectorsByName = {
  MetaMask: injected,
  WalletConnect: walletConnect,
} as const

export type ConnectorNames = keyof typeof connectorsByName

// 连接器信息
export const connectorInfo = {
  MetaMask: {
    name: 'MetaMask',
    iconUrl: 'https://docs.metamask.io/img/metamask-fox.svg',
    description: '连接到 MetaMask 钱包',
  },
  WalletConnect: {
    name: 'WalletConnect',
    iconUrl: 'https://walletconnect.org/static/walletconnect-logo.svg',
    description: '使用 WalletConnect 协议连接',
  },
}
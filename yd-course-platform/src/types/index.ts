// src/types/index.ts

// 课程类型
export interface Course {
  id: number
  title: string
  description: string
  contentHash: string
  price: bigint
  instructor: string
  isActive: boolean
  createdAt: number
  totalSales: number
}

// 购买记录类型
export interface Purchase {
  courseId: number
  buyer: string
  purchaseTime: number
  pricePaid: bigint
}

// 平台统计类型
export interface PlatformStats {
  totalCourses: number
  activeCourses: number
  totalSales: number
}

// 钱包状态类型
export interface WalletState {
  account: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

// 代币信息类型
export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
  balance: bigint
  allowance: bigint
}

// 交易状态类型
export interface TransactionState {
  isLoading: boolean
  hash: string | null
  error: string | null
}

// 课程创建表单类型
export interface CreateCourseForm {
  title: string
  description: string
  contentHash: string
  price: string
  instructor: string
}

// 用户课程数据类型
export interface UserCourseData {
  courseId: number
  course: Course
  purchaseTime: number
  pricePaid: bigint
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 连接器类型
export type ConnectorType = 'MetaMask' | 'WalletConnect'

// 网络类型
export interface NetworkInfo {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
}

// 错误类型
export interface Web3Error {
  code: number
  message: string
  data?: any
}

// 组件 Props 类型
export interface CourseCardProps {
  course: Course
  onPurchase: (courseId: number) => void
  isOwned?: boolean
  isLoading?: boolean
}

export interface WalletConnectorProps {
  onConnect?: (account: string) => void
  onDisconnect?: () => void
}

export interface TokenBalanceProps {
  address?: string
  showActions?: boolean
}

// 状态管理类型
export interface CourseStore {
  courses: Course[]
  userCourses: number[]
  platformStats: PlatformStats | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchCourses: () => Promise<void>
  fetchUserCourses: (address: string) => Promise<void>
  purchaseCourse: (courseId: number) => Promise<void>
  createCourse: (courseData: CreateCourseForm) => Promise<void>
  setError: (error: string | null) => void
}

// Hook 返回类型
export interface UseYDTokenResult {
  tokenInfo: TokenInfo | null
  balance: bigint
  allowance: bigint
  isLoading: boolean
  error: string | null
  
  // Actions
  transfer: (to: string, amount: bigint) => Promise<void>
  approve: (spender: string, amount: bigint) => Promise<void>
  refreshBalance: () => Promise<void>
}

export interface UseCoursePlatformResult {
  courses: Course[]
  userCourses: number[]
  platformStats: PlatformStats | null
  isLoading: boolean
  error: string | null
  
  // Actions
  purchaseCourse: (courseId: number) => Promise<void>
  createCourse: (courseData: CreateCourseForm) => Promise<void>
  fetchCourses: () => Promise<void>
  refreshUserCourses: () => Promise<void>
}

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_INFURA_API_KEY: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_YD_TOKEN_ADDRESS: string
  readonly VITE_COURSE_PLATFORM_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
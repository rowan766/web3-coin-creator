// src/hooks/useContract.ts
import { useMemo } from 'react'
import { Contract, BrowserProvider } from 'ethers'
import { useWeb3React } from '@web3-react/core'

// 合约 ABI
export const YD_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
]

export const COURSE_PLATFORM_ABI = [
  "function owner() view returns (address)",
  "function ydToken() view returns (address)",
  "function nextCourseId() view returns (uint256)",
  "function platformFeePercentage() view returns (uint256)",
  "function courses(uint256) view returns (uint256, string, string, string, uint256, address, bool, uint256, uint256)",
  "function userCourses(address, uint256) view returns (bool)",
  "function getAllActiveCourses() view returns (tuple(uint256 id, string title, string description, string contentHash, uint256 price, address instructor, bool isActive, uint256 createdAt, uint256 totalSales)[])",
  "function getUserCourses(address user) view returns (uint256[])",
  "function purchaseCourse(uint256 courseId)",
  "function createCourse(string memory title, string memory description, string memory contentHash, uint256 price, address instructor) returns (uint256)",
  "event CourseCreated(uint256 indexed courseId, string title, address indexed instructor, uint256 price)",
  "event CoursePurchased(uint256 indexed courseId, address indexed buyer, uint256 price, uint256 timestamp)"
]

// 安全的合约创建函数
async function createSafeContract(address: string, abi: any[], needsSigner: boolean = false) {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error('Invalid contract address')
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No ethereum provider found')
  }

  try {
    // 使用 window.ethereum 直接创建 provider
    const provider = new BrowserProvider(window.ethereum)
    const contract = new Contract(address, abi, provider)
    
    if (needsSigner) {
      // 获取 signer
      const signer = await provider.getSigner()
      return contract.connect(signer)
    }
    
    return contract
  } catch (error) {
    console.error('Failed to create contract:', error)
    throw error
  }
}

// 通用合约 Hook - 最简化版本
export function useContract(address: string, abi: any[]) {
  const { account } = useWeb3React()
  
  return useMemo(() => {
    if (!address || address === "0x0000000000000000000000000000000000000000") {
      return null
    }
    
    if (typeof window === 'undefined' || !window.ethereum) {
      console.warn('No ethereum provider available')
      return null
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const contract = new Contract(address, abi, provider)
      
      // 返回基础合约，在需要时再连接 signer
      return contract
    } catch (error) {
      console.error('Failed to create contract:', error)
      return null
    }
  }, [address, abi])
}

// 获取合约与 signer 连接的版本
export function useContractWithSigner(address: string, abi: any[]) {
  const { account } = useWeb3React()
  const baseContract = useContract(address, abi)
  
  return useMemo(async () => {
    if (!baseContract || !account) {
      return baseContract
    }
    
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      return baseContract.connect(signer)
    } catch (error) {
      console.error('Failed to connect signer:', error)
      return baseContract
    }
  }, [baseContract, account])
}

// YDToken 合约 Hook
export function useYDTokenContract() {
  const tokenAddress = import.meta.env.VITE_YD_TOKEN_ADDRESS
  console.log('YD Token Address:', tokenAddress)
  return useContract(tokenAddress, YD_TOKEN_ABI)
}

// CoursePlatform 合约 Hook
export function useCoursePlatformContract() {
  const platformAddress = import.meta.env.VITE_COURSE_PLATFORM_ADDRESS
  console.log('Course Platform Address:', platformAddress)
  return useContract(platformAddress, COURSE_PLATFORM_ABI)
}

// 工具函数：获取带 signer 的合约
export async function getContractWithSigner(contract: Contract | null): Promise<Contract | null> {
  if (!contract) return null
  
  try {
    const provider = new BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return contract.connect(signer)
  } catch (error) {
    console.error('Failed to get contract with signer:', error)
    return contract
  }
}

// 声明 window.ethereum 类型
declare global {
  interface Window {
    ethereum?: any
  }
}
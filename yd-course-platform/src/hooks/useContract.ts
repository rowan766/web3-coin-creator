// src/hooks/useContract.ts
import { useMemo } from 'react'
import { Contract } from 'ethers'
import { useWeb3React } from '@web3-react/core'

// 合约 ABI - 简化版本
export const YD_TOKEN_ABI = [
  // 查询方法
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // 交易方法
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  
  // 事件
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
]

export const COURSE_PLATFORM_ABI = [
  // 查询方法
  "function owner() view returns (address)",
  "function ydToken() view returns (address)",
  "function nextCourseId() view returns (uint256)",
  "function platformFeePercentage() view returns (uint256)",
  "function courses(uint256) view returns (uint256, string, string, string, uint256, address, bool, uint256, uint256)",
  "function userCourses(address, uint256) view returns (bool)",
  "function getAllActiveCourses() view returns (tuple(uint256 id, string title, string description, string contentHash, uint256 price, address instructor, bool isActive, uint256 createdAt, uint256 totalSales)[])",
  "function getUserCourses(address user) view returns (uint256[])",
  
  // 交易方法
  "function purchaseCourse(uint256 courseId)",
  "function createCourse(string memory title, string memory description, string memory contentHash, uint256 price, address instructor) returns (uint256)",
  
  // 事件
  "event CourseCreated(uint256 indexed courseId, string title, address indexed instructor, uint256 price)",
  "event CoursePurchased(uint256 indexed courseId, address indexed buyer, uint256 price, uint256 timestamp)"
]

// 通用合约 Hook
export function useContract(address: string, abi: any[]) {
  const { library, account } = useWeb3React()
  
  return useMemo(() => {
    if (!library || !address || address === "0x0000000000000000000000000000000000000000") {
      return null
    }
    
    try {
      const contract = new Contract(address, abi, library)
      return account ? contract.connect(library.getSigner()) : contract
    } catch (error) {
      console.error('Failed to get contract:', error)
      return null
    }
  }, [address, abi, library, account])
}

// YDToken 合约 Hook
export function useYDTokenContract() {
  const tokenAddress = import.meta.env.VITE_YD_TOKEN_ADDRESS
  return useContract(tokenAddress, YD_TOKEN_ABI)
}

// CoursePlatform 合约 Hook
export function useCoursePlatformContract() {
  const platformAddress = import.meta.env.VITE_COURSE_PLATFORM_ADDRESS
  return useContract(platformAddress, COURSE_PLATFORM_ABI)
}

// 只读合约 Hook（不需要连接钱包）
export function useReadOnlyContract(address: string, abi: any[]) {
  const { library } = useWeb3React()
  
  return useMemo(() => {
    if (!library || !address) return null
    
    try {
      return new Contract(address, abi, library)
    } catch (error) {
      console.error('Failed to get read-only contract:', error)
      return null
    }
  }, [address, abi, library])
}
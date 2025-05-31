// src/lib/contracts.ts
import { Contract } from 'ethers'
import { CONTRACT_ADDRESSES } from './constants'

// YDToken ABI（简化版，包含主要方法）
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
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // 事件
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
]

// YDCoursePlatform ABI（主要方法）
export const COURSE_PLATFORM_ABI = [
  // 查询方法
  "function owner() view returns (address)",
  "function ydToken() view returns (address)",
  "function nextCourseId() view returns (uint256)",
  "function platformFeePercentage() view returns (uint256)",
  "function courses(uint256) view returns (uint256, string, string, string, uint256, address, bool, uint256, uint256)",
  "function userCourses(address, uint256) view returns (bool)",
  "function hasUserPurchasedCourse(address user, uint256 courseId) view returns (bool)",
  "function getAllActiveCourses() view returns (tuple(uint256 id, string title, string description, string contentHash, uint256 price, address instructor, bool isActive, uint256 createdAt, uint256 totalSales)[])",
  "function getUserCourses(address user) view returns (uint256[])",
  "function getPlatformStats() view returns (uint256 totalCourses, uint256 activeCourses, uint256 totalSales)",
  
  // 交易方法
  "function createCourse(string memory title, string memory description, string memory contentHash, uint256 price, address instructor) returns (uint256)",
  "function purchaseCourse(uint256 courseId)",
  "function updateCourse(uint256 courseId, string memory title, string memory description, uint256 price)",
  "function deactivateCourse(uint256 courseId)",
  "function setCoursePrice(uint256 courseId, uint256 newPrice)",
  
  // 事件
  "event CourseCreated(uint256 indexed courseId, string title, address indexed instructor, uint256 price)",
  "event CoursePurchased(uint256 indexed courseId, address indexed buyer, uint256 price, uint256 timestamp)",
  "event CourseUpdated(uint256 indexed courseId, string title, uint256 newPrice)"
]

// 合约实例创建函数
export const getYDTokenContract = (provider: any) => {
  return new Contract(CONTRACT_ADDRESSES.YD_TOKEN, YD_TOKEN_ABI, provider)
}

export const getCoursePlatformContract = (provider: any) => {
  return new Contract(CONTRACT_ADDRESSES.COURSE_PLATFORM, COURSE_PLATFORM_ABI, provider)
}

// 合约信息
export const contracts = {
  ydToken: {
    address: CONTRACT_ADDRESSES.YD_TOKEN,
    abi: YD_TOKEN_ABI,
  },
  coursePlatform: {
    address: CONTRACT_ADDRESSES.COURSE_PLATFORM,
    abi: COURSE_PLATFORM_ABI,
  },
} as const
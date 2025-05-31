// src/hooks/useCoursePlatform.ts
import { useState, useEffect, useCallback } from 'react'
import { formatEther } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useCoursePlatformContract } from './useContract'

interface Course {
  id: number
  title: string
  description: string
  contentHash: string
  price: bigint
  instructor: string
  isActive: boolean
  createdAt: bigint
  totalSales: bigint
}

export function useCoursePlatform() {
  const { account, chainId } = useWeb3React()
  const contract = useCoursePlatformContract()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [userCourses, setUserCourses] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取所有活跃课程
  const fetchCourses = useCallback(async () => {
    if (!contract) {
      // 如果没有合约，使用模拟数据
      setCourses([
        {
          id: 1,
          title: 'Web3 开发入门',
          description: '从零开始学习 Web3 开发，包括智能合约、DApp 开发等核心概念',
          contentHash: 'QmExample1',
          price: BigInt('100000000000000000000'), // 100 代币
          instructor: '0x1234567890abcdef1234567890abcdef12345678',
          isActive: true,
          createdAt: BigInt(Date.now()),
          totalSales: BigInt(156)
        },
        {
          id: 2,
          title: 'DeFi 协议深度解析',
          description: '深入理解 DeFi 协议的运作机制，学习如何构建去中心化金融应用',
          contentHash: 'QmExample2',
          price: BigInt('150000000000000000000'), // 150 代币
          instructor: '0xabcdef1234567890abcdef1234567890abcdef12',
          isActive: true,
          createdAt: BigInt(Date.now()),
          totalSales: BigInt(89)
        },
        {
          id: 3,
          title: 'NFT 开发实战',
          description: '学习如何创建、部署和交易 NFT，包括元数据管理和市场集成',
          contentHash: 'QmExample3',
          price: BigInt('120000000000000000000'), // 120 代币
          instructor: '0x9876543210fedcba9876543210fedcba98765432',
          isActive: true,
          createdAt: BigInt(Date.now()),
          totalSales: BigInt(234)
        }
      ])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const allCourses = await contract.getAllActiveCourses()
      
      const formattedCourses = allCourses.map((course: any) => ({
        id: Number(course.id),
        title: course.title,
        description: course.description,
        contentHash: course.contentHash,
        price: BigInt(course.price.toString()),
        instructor: course.instructor,
        isActive: course.isActive,
        createdAt: BigInt(course.createdAt.toString()),
        totalSales: BigInt(course.totalSales.toString())
      }))

      setCourses(formattedCourses)
    } catch (err: any) {
      console.error('Failed to fetch courses:', err)
      setError('获取课程失败: ' + (err.reason || err.message))
      
      // 发生错误时使用模拟数据
      setCourses([
        {
          id: 1,
          title: 'Web3 开发入门 (演示)',
          description: '从零开始学习 Web3 开发，包括智能合约、DApp 开发等核心概念',
          contentHash: 'QmExample1',
          price: BigInt('100000000000000000000'),
          instructor: '0x1234567890abcdef1234567890abcdef12345678',
          isActive: true,
          createdAt: BigInt(Date.now()),
          totalSales: BigInt(156)
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  // 获取用户已购买的课程
  const fetchUserCourses = useCallback(async () => {
    if (!contract || !account) {
      setUserCourses([])
      return
    }

    try {
      const purchasedCourses = await contract.getUserCourses(account)
      const courseIds = purchasedCourses.map((id: any) => Number(id))
      setUserCourses(courseIds)
    } catch (err: any) {
      console.error('Failed to fetch user courses:', err)
      setError('获取用户课程失败: ' + (err.reason || err.message))
    }
  }, [contract, account])

  // 购买课程
  const purchaseCourse = useCallback(async (courseId: number) => {
    if (!contract || !account) {
      throw new Error('合约或账户未连接')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const tx = await contract.purchaseCourse(courseId)
      
      console.log('购买交易已提交:', tx.hash)
      await tx.wait()
      
      // 刷新用户课程列表
      await fetchUserCourses()
      await fetchCourses() // 刷新总销量
      
      return tx
    } catch (err: any) {
      console.error('Purchase failed:', err)
      let errorMessage = '购买失败'
      
      if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        if (err.message.includes('insufficient')) {
          errorMessage = '余额不足'
        } else if (err.message.includes('allowance')) {
          errorMessage = '授权额度不足'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, fetchUserCourses, fetchCourses])

  // 创建课程（讲师功能）
  const createCourse = useCallback(async (
    title: string,
    description: string,
    contentHash: string,
    price: bigint,
    instructor: string
  ) => {
    if (!contract || !account) {
      throw new Error('合约或账户未连接')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const tx = await contract.createCourse(
        title,
        description,
        contentHash,
        price.toString(),
        instructor
      )
      
      console.log('创建课程交易已提交:', tx.hash)
      await tx.wait()
      
      // 刷新课程列表
      await fetchCourses()
      
      return tx
    } catch (err: any) {
      console.error('Create course failed:', err)
      const errorMessage = err.reason || err.message || '创建课程失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, fetchCourses])

  // 格式化价格
  const formatPrice = useCallback((price: bigint) => {
    return formatEther(price)
  }, [])

  // 刷新所有数据
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchCourses(),
      fetchUserCourses()
    ])
  }, [fetchCourses, fetchUserCourses])

  // 初始化加载
  useEffect(() => {
    refreshData()
  }, [contract, account, chainId, refreshData])

  // 监听合约事件
  useEffect(() => {
    if (!contract) return

    // 监听课程创建事件
    const handleCourseCreated = () => {
      fetchCourses()
    }

    // 监听课程购买事件
    const handleCoursePurchased = () => {
      fetchCourses()
      fetchUserCourses()
    }

    try {
      contract.on('CourseCreated', handleCourseCreated)
      contract.on('CoursePurchased', handleCoursePurchased)

      return () => {
        contract.off('CourseCreated', handleCourseCreated)
        contract.off('CoursePurchased', handleCoursePurchased)
      }
    } catch (error) {
      // 如果事件监听失败，使用定时刷新
      const interval = setInterval(() => {
        refreshData()
      }, 30000) // 每30秒刷新一次

      return () => clearInterval(interval)
    }
  }, [contract, fetchCourses, fetchUserCourses, refreshData])

  return {
    // 数据
    courses,
    userCourses,
    isLoading,
    error,
    
    // 方法
    purchaseCourse,
    createCourse,
    refreshData,
    formatPrice,
  }
}
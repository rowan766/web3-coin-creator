// src/hooks/useCoursePlatform.ts
import { useState, useEffect, useCallback } from 'react'
import { formatEther, parseEther } from 'ethers'
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
  createdAt: number
  totalSales: number
}

interface CreateCourseData {
  title: string
  description: string
  contentHash: string
  price: string // 以 ETH 为单位的字符串
  instructor: string
}

export function useCoursePlatform() {
  const { account, chainId } = useWeb3React()
  const contract = useCoursePlatformContract()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [userCourses, setUserCourses] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  // 检查是否是合约所有者
  const checkOwnership = useCallback(async () => {
    if (!contract || !account) {
      setIsOwner(false)
      return
    }

    try {
      const owner = await contract.owner()
      setIsOwner(owner.toLowerCase() === account.toLowerCase())
    } catch (err) {
      console.error('Failed to check ownership:', err)
      setIsOwner(false)
    }
  }, [contract, account])

  // 获取所有活跃课程
  const fetchCourses = useCallback(async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)
      
      const activeCourses = await contract.getAllActiveCourses()
      
      const formattedCourses = activeCourses.map((course: any) => ({
        id: Number(course.id),
        title: course.title,
        description: course.description,
        contentHash: course.contentHash,
        price: course.price,
        instructor: course.instructor,
        isActive: course.isActive,
        createdAt: Number(course.createdAt),
        totalSales: Number(course.totalSales),
      }))
      
      setCourses(formattedCourses)
    } catch (err: any) {
      console.error('Failed to fetch courses:', err)
      setError('获取课程列表失败: ' + (err.reason || err.message))
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  // 获取用户购买的课程
  const fetchUserCourses = useCallback(async () => {
    if (!contract || !account) {
      setUserCourses([])
      return
    }

    try {
      const purchasedCourses = await contract.getUserCourses(account)
      setUserCourses(purchasedCourses.map((id: any) => Number(id)))
    } catch (err: any) {
      console.error('Failed to fetch user courses:', err)
      setError('获取用户课程失败: ' + (err.reason || err.message))
    }
  }, [contract, account])

  // 检查用户是否购买了某个课程
  const hasPurchasedCourse = useCallback(async (courseId: number) => {
    if (!contract || !account) return false

    try {
      return await contract.hasUserPurchasedCourse(account, courseId)
    } catch (err) {
      console.error('Failed to check course purchase:', err)
      return false
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
      
      // 检查是否已经购买
      const alreadyPurchased = await hasPurchasedCourse(courseId)
      if (alreadyPurchased) {
        throw new Error('您已经购买了这个课程')
      }
      
      const tx = await contract.purchaseCourse(courseId)
      
      console.log('购买交易已提交:', tx.hash)
      await tx.wait()
      
      // 刷新用户课程列表
      await fetchUserCourses()
      
      return tx
    } catch (err: any) {
      console.error('Purchase failed:', err)
      const errorMessage = err.reason || err.message || '购买失败'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, hasPurchasedCourse, fetchUserCourses])

  // 创建课程（仅所有者）
  const createCourse = useCallback(async (courseData: CreateCourseData) => {
    if (!contract || !account) {
      throw new Error('合约或账户未连接')
    }

    if (!isOwner) {
      throw new Error('只有合约所有者可以创建课程')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const priceInWei = parseEther(courseData.price)
      
      const tx = await contract.createCourse(
        courseData.title,
        courseData.description,
        courseData.contentHash,
        priceInWei,
        courseData.instructor
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
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, isOwner, fetchCourses])

  // 获取课程详情
  const getCourse = useCallback(async (courseId: number) => {
    if (!contract) return null

    try {
      const course = await contract.courses(courseId)
      return {
        id: Number(course[0]),
        title: course[1],
        description: course[2],
        contentHash: course[3],
        price: course[4],
        instructor: course[5],
        isActive: course[6],
        createdAt: Number(course[7]),
        totalSales: Number(course[8]),
      }
    } catch (err) {
      console.error('Failed to get course:', err)
      return null
    }
  }, [contract])

  // 刷新所有数据
  const refreshAll = useCallback(async () => {
    await Promise.all([
      checkOwnership(),
      fetchCourses(),
      fetchUserCourses()
    ])
  }, [checkOwnership, fetchCourses, fetchUserCourses])

  // 初始化加载
  useEffect(() => {
    if (contract) {
      refreshAll()
    }
  }, [contract, account, chainId, refreshAll])

  // 监听课程相关事件
  useEffect(() => {
    if (!contract) return

    const handleCourseCreated = () => {
      fetchCourses()
    }

    const handleCoursePurchased = (courseId: any, buyer: string) => {
      if (account && buyer.toLowerCase() === account.toLowerCase()) {
        fetchUserCourses()
      }
      fetchCourses() // 更新销售数量
    }

    contract.on('CourseCreated', handleCourseCreated)
    contract.on('CoursePurchased', handleCoursePurchased)

    return () => {
      contract.off('CourseCreated', handleCourseCreated)
      contract.off('CoursePurchased', handleCoursePurchased)
    }
  }, [contract, account, fetchCourses, fetchUserCourses])

  return {
    // 数据
    courses,
    userCourses,
    isLoading,
    error,
    isOwner,
    
    // 方法
    purchaseCourse,
    createCourse,
    getCourse,
    hasPurchasedCourse,
    refreshAll,
    
    // 帮助方法
    formatPrice: (price: bigint) => formatEther(price),
  }
}
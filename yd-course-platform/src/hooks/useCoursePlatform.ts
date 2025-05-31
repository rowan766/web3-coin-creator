// src/hooks/useCoursePlatform.ts
import { useState, useEffect, useCallback } from 'react'
import { formatEther, parseEther } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useCoursePlatformContract, getContractWithSigner } from './useContract'

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

interface CreateCourseForm {
  title: string
  description: string
  contentHash: string
  price: string
  instructor: string
}

// 模拟课程数据作为回退
const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Web3 开发入门',
    description: '从零开始学习 Web3 开发，包括智能合约、DApp 开发等核心概念。掌握 React、ethers.js 等核心技术栈。',
    contentHash: 'QmExample1',
    price: BigInt('100000000000000000000'), // 100 代币
    instructor: '0x1234567890abcdef1234567890abcdef12345678',
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 30),
    totalSales: BigInt(156)
  },
  {
    id: 2,
    title: 'DeFi 协议深度解析',
    description: '深入理解 DeFi 协议的运作机制，学习如何构建去中心化金融应用。包括 Uniswap、Compound、Aave 等主流协议。',
    contentHash: 'QmExample2',
    price: BigInt('150000000000000000000'), // 150 代币
    instructor: '0xabcdef1234567890abcdef1234567890abcdef12',
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 20),
    totalSales: BigInt(89)
  },
  {
    id: 3,
    title: 'NFT 开发实战',
    description: '学习如何创建、部署和交易 NFT，包括元数据管理和市场集成。使用 OpenZeppelin、IPFS 等工具构建完整的 NFT 项目。',
    contentHash: 'QmExample3',
    price: BigInt('120000000000000000000'), // 120 代币
    instructor: '0x9876543210fedcba9876543210fedcba98765432',
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 15),
    totalSales: BigInt(234)
  },
  {
    id: 4,
    title: '智能合约安全审计',
    description: '学习智能合约安全最佳实践，常见漏洞分析和审计技术。包括重入攻击、整数溢出、权限控制等安全问题的识别与防范。',
    contentHash: 'QmExample4',
    price: BigInt('200000000000000000000'), // 200 代币
    instructor: '0xfedcba9876543210fedcba9876543210fedcba98',
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 10),
    totalSales: BigInt(67)
  },
  {
    id: 5,
    title: 'Layer 2 扩容解决方案',
    description: '深入了解以太坊 Layer 2 扩容方案，包括 Polygon、Arbitrum、Optimism 等技术原理和开发实践。',
    contentHash: 'QmExample5',
    price: BigInt('180000000000000000000'), // 180 代币
    instructor: '0x1111222233334444555566667777888899990000',
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 5),
    totalSales: BigInt(45)
  },
  {
    id: 6,
    title: 'DAO 治理与实践',
    description: '学习去中心化自治组织(DAO)的设计原理和治理机制，包括投票系统、提案管理、代币经济学等核心概念。',
    contentHash: 'QmExample6',
    price: BigInt('160000000000000000000'), // 160 代币
    instructor: '0x2222333344445555666677778888999900001111',
    isActive: true,
    createdAt: BigInt(Date.now() - 86400000 * 7),
    totalSales: BigInt(92)
  }
]

export function useCoursePlatform() {
  const { account, chainId } = useWeb3React()
  const contract = useCoursePlatformContract()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [userCourses, setUserCourses] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contractOwner, setContractOwner] = useState<string | null>(null)

  // 检查是否有合约地址配置
  const hasContract = !!import.meta.env.VITE_COURSE_PLATFORM_ADDRESS

  // 检查当前用户是否是合约 owner
  const isOwner = account && contractOwner && 
    account.toLowerCase() === contractOwner.toLowerCase()

  // 获取合约 owner
  const fetchOwner = useCallback(async () => {
    if (!contract || !hasContract) {
      // 在模拟模式下，将当前连接的账户设为 owner
      if (account) {
        setContractOwner(account)
      }
      return
    }

    try {
      const owner = await contract.owner()
      setContractOwner(owner)
      console.log('Contract owner:', owner)
    } catch (err: any) {
      console.error('Failed to fetch contract owner:', err)
      // 回退：将当前账户设为 owner（用于演示）
      if (account) {
        setContractOwner(account)
      }
    }
  }, [contract, hasContract, account])

  // 获取所有活跃课程
  const fetchCourses = useCallback(async () => {
    if (!contract || !hasContract) {
      console.log('No course platform contract configured, using mock data')
      setCourses(mockCourses)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching courses from contract...')
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
      console.log('Courses fetched successfully:', formattedCourses.length, 'courses')
    } catch (err: any) {
      console.error('Failed to fetch courses:', err)
      
      // 处理不支持的操作错误
      if (err.code === 'UNSUPPORTED_OPERATION') {
        console.log('Contract calls not supported, using mock courses data')
        setCourses(mockCourses)
        setError(null)
      } else {
        setError('获取课程失败，使用模拟数据')
        setCourses(mockCourses)
      }
    } finally {
      setIsLoading(false)
    }
  }, [contract, hasContract])

  // 获取用户已购买的课程
  const fetchUserCourses = useCallback(async () => {
    if (!contract || !account || !hasContract) {
      if (account && !hasContract) {
        // 模拟用户已购买课程 1 和 3
        setUserCourses([1, 3])
      } else {
        setUserCourses([])
      }
      return
    }

    try {
      console.log('Fetching user courses for account:', account)
      const purchasedCourses = await contract.getUserCourses(account)
      const courseIds = purchasedCourses.map((id: any) => Number(id))
      setUserCourses(courseIds)
      console.log('User courses fetched:', courseIds)
    } catch (err: any) {
      console.error('Failed to fetch user courses:', err)
      
      if (err.code === 'UNSUPPORTED_OPERATION') {
        console.log('User courses query not supported, using mock data')
        setUserCourses([1, 3])
        setError(null)
      } else {
        setError('获取用户课程失败，使用模拟数据')
        setUserCourses([1, 3])
      }
    }
  }, [contract, account, hasContract])

  // 购买课程
  const purchaseCourse = useCallback(async (courseId: number) => {
    if (!account) {
      throw new Error('请先连接钱包')
    }

    // 检查是否已购买
    if (userCourses.includes(courseId)) {
      throw new Error('您已经购买过这门课程了')
    }

    if (!contract || !hasContract) {
      // 模拟购买
      console.log('Simulating course purchase for course ID:', courseId)
      setIsLoading(true)
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 模拟可能的失败（5% 概率）
      if (Math.random() < 0.05) {
        setIsLoading(false)
        throw new Error('网络错误，请重试')
      }
      
      // 更新用户课程列表
      setUserCourses(prev => [...prev, courseId])
      
      // 更新课程销量
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, totalSales: course.totalSales + BigInt(1) }
          : course
      ))
      
      setIsLoading(false)
      return { 
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        wait: async () => ({ status: 1 })
      }
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Purchasing course ID:', courseId)
      
      // 获取带 signer 的合约
      const contractWithSigner = await getContractWithSigner(contract)
      if (!contractWithSigner) {
        throw new Error('无法获取签名合约，请检查钱包连接')
      }
      
      const tx = await contractWithSigner.purchaseCourse(courseId)
      
      console.log('Purchase transaction submitted:', tx.hash)
      await tx.wait()
      console.log('Purchase transaction confirmed')
      
      // 刷新用户课程列表和课程信息
      await Promise.all([
        fetchUserCourses(),
        fetchCourses()
      ])
      
      return tx
    } catch (err: any) {
      console.error('Purchase failed:', err)
      
      let errorMessage = '购买失败'
      
      if (err.code === 'UNSUPPORTED_OPERATION') {
        errorMessage = '当前网络不支持合约调用，请检查钱包连接'
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        if (err.message.includes('insufficient')) {
          errorMessage = '余额不足'
        } else if (err.message.includes('allowance')) {
          errorMessage = '授权额度不足'
        } else if (err.message.includes('already purchased')) {
          errorMessage = '您已经购买过这门课程了'
        } else if (err.message.includes('user rejected')) {
          errorMessage = '用户取消了交易'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, hasContract, userCourses, fetchUserCourses, fetchCourses])

  // 创建课程（讲师功能）- 修改参数接口
  const createCourse = useCallback(async (formData: CreateCourseForm) => {
    if (!account) {
      throw new Error('请先连接钱包')
    }

    // 检查是否是 owner
    if (!isOwner) {
      throw new Error('只有合约所有者可以创建课程')
    }

    const { title, description, contentHash, price, instructor } = formData
    const priceInWei = parseEther(price)

    if (!contract || !hasContract) {
      // 模拟创建课程
      console.log('Simulating course creation:', { title, price })
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newCourse: Course = {
        id: Math.max(...courses.map(c => c.id)) + 1,
        title,
        description,
        contentHash: contentHash || `Qm${Math.random().toString(36)}`,
        price: priceInWei,
        instructor,
        isActive: true,
        createdAt: BigInt(Date.now()),
        totalSales: BigInt(0)
      }
      
      setCourses(prev => [newCourse, ...prev])
      setIsLoading(false)
      return { 
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        wait: async () => ({ status: 1 })
      }
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Creating course:', { title, price, instructor })
      
      // 获取带 signer 的合约
      const contractWithSigner = await getContractWithSigner(contract)
      if (!contractWithSigner) {
        throw new Error('无法获取签名合约，请检查钱包连接')
      }
      
      const tx = await contractWithSigner.createCourse(
        title,
        description,
        contentHash || `Qm${Math.random().toString(36)}`,
        priceInWei.toString(),
        instructor
      )
      
      console.log('Create course transaction submitted:', tx.hash)
      await tx.wait()
      console.log('Create course transaction confirmed')
      
      // 刷新课程列表
      await fetchCourses()
      
      return tx
    } catch (err: any) {
      console.error('Create course failed:', err)
      
      let errorMessage = '创建课程失败'
      
      if (err.code === 'UNSUPPORTED_OPERATION') {
        errorMessage = '当前网络不支持合约调用，请检查钱包连接'
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        if (err.message.includes('Ownable')) {
          errorMessage = '只有合约所有者可以创建课程'
        } else if (err.message.includes('user rejected')) {
          errorMessage = '用户取消了交易'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, hasContract, isOwner, courses, fetchCourses])

  // 格式化价格
  const formatPrice = useCallback((price: bigint) => {
    return formatEther(price)
  }, [])

  // 刷新所有数据
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchOwner(),
      fetchCourses(),
      fetchUserCourses()
    ])
  }, [fetchOwner, fetchCourses, fetchUserCourses])

  // 获取课程详情
  const getCourseById = useCallback((courseId: number) => {
    return courses.find(course => course.id === courseId)
  }, [courses])

  // 检查用户是否拥有课程
  const hasUserPurchased = useCallback((courseId: number) => {
    return userCourses.includes(courseId)
  }, [userCourses])

  // 初始化加载
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // 监听账户变化
  useEffect(() => {
    if (account) {
      fetchUserCourses()
      fetchOwner()
    } else {
      setUserCourses([])
      setContractOwner(null)
    }
  }, [account, chainId, fetchUserCourses, fetchOwner])

  return {
    // 数据
    courses,
    userCourses,
    isLoading,
    error,
    hasContract,
    contractOwner,
    isOwner,
    
    // 方法
    purchaseCourse,
    createCourse,
    refreshData,
    formatPrice,
    getCourseById,
    hasUserPurchased,
    
    // 统计
    totalCourses: courses.length,
    totalSales: courses.reduce((acc, course) => acc + Number(course.totalSales), 0),
    userPurchasedCount: userCourses.length,
    
    // 分类统计
    coursesByCategory: {
      total: courses.length,
      active: courses.filter(c => c.isActive).length,
      recent: courses.filter(c => Date.now() - Number(c.createdAt) < 86400000 * 7).length // 最近7天
    }
  }
}
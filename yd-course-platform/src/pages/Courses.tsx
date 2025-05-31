// src/pages/Courses.tsx
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Badge,
  Button,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Search, Star, Clock, Users, ShoppingCart } from 'lucide-react'
import { useWeb3React } from '@web3-react/core'
// 修复导入路径 - 使用相对路径
import { useCoursePlatform } from '@/hooks/useCoursePlatform'
import { useYDToken } from '@/hooks/useYDToken'

export function Courses() {
  const { account, active } = useWeb3React()
  const { 
    courses, 
    userCourses, 
    isLoading, 
    error, 
    purchaseCourse,
    formatPrice 
  } = useCoursePlatform()
  const { balance, allowance } = useYDToken()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [purchasingCourseId, setPurchasingCourseId] = useState<number | null>(null)
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // 分类选项
  const categoryOptions = [
    { value: 'blockchain', label: '区块链基础' },
    { value: 'defi', label: 'DeFi' },
    { value: 'nft', label: 'NFT' },
    { value: 'smart-contract', label: '智能合约' },
    { value: 'web3', label: 'Web3开发' },
  ]

  // 难度选项
  const levelOptions = [
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' },
  ]

  const levelColors = {
    beginner: 'green',
    intermediate: 'blue',
    advanced: 'red',
  }

  const levelLabels = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  }

  // 过滤课程
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // 处理课程购买
  const handlePurchase = async (courseId: number, coursePrice: bigint) => {
    if (!account || !active) {
      toast({
        title: '请先连接钱包',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // 检查余额
    if (balance < coursePrice) {
      toast({
        title: '余额不足',
        description: `购买此课程需要 ${formatPrice(coursePrice)} YDT`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    // 检查授权
    if (allowance < coursePrice) {
      toast({
        title: '需要授权代币',
        description: '请先在代币余额卡片中授权 YD Token',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      setPurchasingCourseId(courseId)
      await purchaseCourse(courseId)
      
      toast({
        title: '购买成功！',
        description: '恭喜你，课程购买成功！现在可以开始学习了。',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: '购买失败',
        description: error.message || '购买过程中出现错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setPurchasingCourseId(null)
    }
  }

  // 检查用户是否已购买课程
  const isCoursePurchased = (courseId: number) => {
    return userCourses.includes(courseId)
  }

  return (
    <Container maxW="container.xl">
      <VStack spacing={8} align="stretch">
        {/* 页面标题 */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>课程中心</Heading>
          <Text fontSize="lg" color="gray.600">
            探索我们精心策划的 Web3 和区块链课程
          </Text>
        </Box>

        {/* 搜索和筛选 */}
        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth={1}
          borderColor={borderColor}
        >
          <VStack spacing={4}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Search color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="搜索课程..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <HStack spacing={4} w="full">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                placeholder="选择分类"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                placeholder="选择难度"
              >
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </HStack>
          </VStack>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* 连接钱包提示 */}
        {!active && (
          <Alert status="info">
            <AlertIcon />
            连接钱包后可以购买课程并开始学习
          </Alert>
        )}

        {/* 课程网格 */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <Skeleton height="200px" />
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Skeleton height="20px" />
                    <Skeleton height="40px" />
                    <HStack justify="space-between">
                      <Skeleton height="20px" width="60px" />
                      <Skeleton height="20px" width="80px" />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : filteredCourses.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredCourses.map(course => {
              const isPurchased = isCoursePurchased(course.id)
              const isPurchasing = purchasingCourseId === course.id
              
              return (
                <Card
                  key={course.id}
                  overflow="hidden"
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                  transition="all 0.2s"
                  opacity={isPurchased ? 0.8 : 1}
                >
                  <Box position="relative">
                    <Image
                      src={`https://via.placeholder.com/300x200/4299e1/ffffff?text=Course+${course.id}`}
                      alt={course.title}
                      height="200px"
                      objectFit="cover"
                    />
                    {isPurchased && (
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="green"
                        variant="solid"
                      >
                        已购买
                      </Badge>
                    )}
                  </Box>
                  
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between" align="flex-start">
                        <Badge colorScheme="blue" size="sm">
                          ID: {course.id}
                        </Badge>
                        
                        <HStack spacing={1}>
                          <Star size={16} fill="gold" color="gold" />
                          <Text fontSize="sm" fontWeight="medium">
                            4.8
                          </Text>
                        </HStack>
                      </HStack>

                      <Heading size="md" noOfLines={2}>
                        {course.title}
                      </Heading>

                      <Text color="gray.600" fontSize="sm" noOfLines={3}>
                        {course.description}
                      </Text>

                      <Text fontSize="sm" color="gray.500">
                        讲师: {course.instructor.slice(0, 8)}...
                      </Text>

                      <HStack justify="space-between" fontSize="sm">
                        <HStack spacing={1}>
                          <Clock size={16} />
                          <Text>8小时</Text>
                        </HStack>
                        
                        <HStack spacing={1}>
                          <Users size={16} />
                          <Text>{course.totalSales} 学员</Text>
                        </HStack>
                      </HStack>

                      <HStack justify="space-between" align="center" pt={2}>
                        <VStack spacing={0} align="flex-start">
                          <Text fontSize="2xl" fontWeight="bold" color="green.500">
                            {formatPrice(course.price)} YDT
                          </Text>
                        </VStack>
                        
                        {isPurchased ? (
                          <Button
                            as={RouterLink}
                            to={`/courses/${course.id}`}
                            colorScheme="green"
                            size="sm"
                            variant="outline"
                          >
                            开始学习
                          </Button>
                        ) : (
                          <VStack spacing={2}>
                            <Button
                              colorScheme="blue"
                              size="sm"
                              leftIcon={<ShoppingCart size={16} />}
                              onClick={() => handlePurchase(course.id, course.price)}
                              isLoading={isPurchasing}
                              loadingText="购买中..."
                              disabled={!active}
                            >
                              立即购买
                            </Button>
                            <Button
                              as={RouterLink}
                              to={`/courses/${course.id}`}
                              variant="ghost"
                              size="xs"
                            >
                              查看详情
                            </Button>
                          </VStack>
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>
        ) : (
          <Alert status="info">
            <AlertIcon />
            {courses.length === 0 ? '当前没有可用的课程' : '没有找到符合条件的课程，请尝试调整搜索条件。'}
          </Alert>
        )}

        {/* 合约信息 */}
        {courses.length > 0 && (
          <Box p={4} bg="gray.50" borderRadius="md" textAlign="center">
            <Text fontSize="sm" color="gray.600">
              课程数据来自智能合约: {import.meta.env.VITE_COURSE_PLATFORM_ADDRESS}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              所有购买记录都存储在 Sepolia 测试网络上
            </Text>
          </Box>
        )}

        {/* 加载更多按钮 */}
        {filteredCourses.length > 0 && (
          <Box textAlign="center">
            <Button variant="outline" size="lg">
              加载更多课程
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  )
}
// src/pages/Dashboard.tsx
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Button,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Grid,
  Image,
  Badge,
} from '@chakra-ui/react'
import { useWeb3React } from '@web3-react/core'
import { Link as RouterLink } from 'react-router-dom'
import { TrendingUp, BookOpen, Clock } from 'lucide-react'
import { TokenBalance } from '../components/token/TokenBalance'
import { useCoursePlatform } from '../hooks/useCoursePlatform'
import { useYDToken } from '../hooks/useYDToken'
import { useEffect, useState } from 'react'

export function Dashboard() {
  const { account, active } = useWeb3React()
  const { courses, userCourses, isLoading: coursesLoading, formatPrice } = useCoursePlatform()
  const { formattedBalance } = useYDToken()
  
  const [userPurchasedCourses, setUserPurchasedCourses] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    tokensSpent: '0',
  })

  // 计算用户购买的课程详情
  useEffect(() => {
    if (courses.length > 0 && userCourses.length > 0) {
      const purchasedCoursesDetails = userCourses.map(courseId => {
        const course = courses.find(c => c.id === courseId)
        if (course) {
          return {
            ...course,
            // 模拟学习进度
            progress: Math.floor(Math.random() * 100),
            lastAccessed: new Date().toLocaleDateString(),
            completedLessons: Math.floor(Math.random() * 10),
            totalLessons: 12,
            certificateEarned: Math.random() > 0.7,
          }
        }
        return null
      }).filter(Boolean)
      
      setUserPurchasedCourses(purchasedCoursesDetails)
      
      // 计算统计数据
      const tokensSpent = purchasedCoursesDetails.reduce((total, course) => {
        return total + parseFloat(formatPrice(course.price))
      }, 0)
      
      setStats({
        totalCourses: userCourses.length,
        completedCourses: purchasedCoursesDetails.filter(c => c.progress === 100).length,
        tokensSpent: tokensSpent.toFixed(2),
      })
    }
  }, [courses, userCourses, formatPrice])

  if (!active || !account) {
    return (
      <Container maxW="container.xl">
        <Alert status="warning">
          <AlertIcon />
          请先连接钱包以查看你的学习仪表板
        </Alert>
      </Container>
    )
  }

  const completionRate = stats.totalCourses > 0 
    ? Math.round((stats.completedCourses / stats.totalCourses) * 100) 
    : 0

  return (
    <Container maxW="container.xl">
      <VStack spacing={8} align="stretch">
        {/* 页面标题 */}
        <Box>
          <Heading size="xl" mb={2}>学习仪表板</Heading>
          <Text color="gray.600">欢迎回来！继续你的 Web3 学习之旅</Text>
          <Text fontSize="sm" color="gray.500" mt={1}>
            钱包地址: {account.slice(0, 8)}...{account.slice(-6)}
          </Text>
        </Box>

        {/* 统计卡片 */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>已购买课程</StatLabel>
                <StatNumber color="blue.500">{stats.totalCourses}</StatNumber>
                <StatHelpText>
                  {stats.completedCourses} 门已完成
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>当前余额</StatLabel>
                <StatNumber color="green.500">{parseFloat(formattedBalance).toFixed(2)}</StatNumber>
                <StatHelpText>YDT</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>完成率</StatLabel>
                <StatNumber color="purple.500">{completionRate}%</StatNumber>
                <StatHelpText>
                  <TrendingUp size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  持续提升中
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>消费代币</StatLabel>
                <StatNumber color="orange.500">{stats.tokensSpent}</StatNumber>
                <StatHelpText>YDT</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 代币余额 */}
        <TokenBalance />

        {/* 我的课程 */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">我的课程</Heading>
              <Button as={RouterLink} to="/courses" variant="outline" size="sm">
                浏览更多课程
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            {coursesLoading ? (
              <Text textAlign="center" color="gray.500">
                正在加载课程数据...
              </Text>
            ) : userPurchasedCourses.length > 0 ? (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {userPurchasedCourses.map(course => (
                  <Card key={course.id} variant="outline">
                    <Grid templateColumns="150px 1fr" gap={4}>
                      <Image
                        src={`https://via.placeholder.com/150x100/4299e1/ffffff?text=Course+${course.id}`}
                        alt={course.title}
                        height="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      
                      <CardBody py={4}>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between" align="flex-start">
                            <Heading size="sm" noOfLines={2}>
                              {course.title}
                            </Heading>
                            
                            {course.certificateEarned && (
                              <Badge colorScheme="gold" variant="subtle">
                                已认证
                              </Badge>
                            )}
                          </HStack>

                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between" fontSize="sm">
                              <Text color="gray.600">进度</Text>
                              <Text fontWeight="medium">{course.progress}%</Text>
                            </HStack>
                            <Progress
                              value={course.progress}
                              colorScheme={course.progress === 100 ? 'green' : 'blue'}
                              size="sm"
                              borderRadius="full"
                            />
                          </VStack>

                          <HStack justify="space-between" fontSize="sm" color="gray.600">
                            <HStack spacing={1}>
                              <BookOpen size={14} />
                              <Text>{course.completedLessons}/{course.totalLessons} 课时</Text>
                            </HStack>
                            
                            <HStack spacing={1}>
                              <Clock size={14} />
                              <Text>{course.lastAccessed}</Text>
                            </HStack>
                          </HStack>

                          <HStack spacing={2}>
                            <Button
                              as={RouterLink}
                              to={`/courses/${course.id}`}
                              size="sm"
                              colorScheme="blue"
                              variant={course.progress === 100 ? 'outline' : 'solid'}
                              flex={1}
                            >
                              {course.progress === 100 ? '重新学习' : '继续学习'}
                            </Button>
                            
                            <Text fontSize="xs" color="gray.500">
                              {formatPrice(course.price)} YDT
                            </Text>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Grid>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Box textAlign="center" py={8}>
                <Text color="gray.500" mb={4}>
                  你还没有购买任何课程
                </Text>
                <Button as={RouterLink} to="/courses" colorScheme="blue">
                  去选择课程
                </Button>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* 学习统计和区块链信息 */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="md">学习统计</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text>总课程数</Text>
                  <Text fontWeight="bold">{stats.totalCourses}</Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text>已完成</Text>
                  <Text fontWeight="bold" color="green.500">
                    {stats.completedCourses}
                  </Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text>学习中</Text>
                  <Text fontWeight="bold" color="blue.500">
                    {stats.totalCourses - stats.completedCourses}
                  </Text>
                </HStack>
                
                <Progress
                  value={completionRate}
                  colorScheme="green"
                  size="lg"
                  borderRadius="full"
                />
                <Text textAlign="center" fontSize="sm" color="gray.600">
                  完成率: {completionRate}%
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">区块链信息</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">网络:</Text>
                  <Badge colorScheme="blue">Sepolia 测试网</Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">代币合约:</Text>
                  <Text fontSize="xs" fontFamily="mono" color="blue.600">
                    {import.meta.env.VITE_YD_TOKEN_ADDRESS?.slice(0, 8)}...
                  </Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">平台合约:</Text>
                  <Text fontSize="xs" fontFamily="mono" color="blue.600">
                    {import.meta.env.VITE_COURSE_PLATFORM_ADDRESS?.slice(0, 8)}...
                  </Text>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">总课程数:</Text>
                  <Text fontWeight="medium">{courses.length}</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 学习建议 */}
        {userPurchasedCourses.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">学习建议</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Text>
                  🎯 你的学习完成率已达到 {completionRate}%，继续保持！
                </Text>
                <Text>
                  📚 建议每天至少学习 30 分钟来保持学习节奏
                </Text>
                <Text>
                  🏆 完成课程后记得获取你的区块链认证证书
                </Text>
                {parseFloat(formattedBalance) > 100 && (
                  <Text>
                    💰 你的余额充足，可以考虑购买更多高级课程
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  )
}
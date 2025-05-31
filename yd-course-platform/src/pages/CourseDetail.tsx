// src/pages/CourseDetail.tsx
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Button,
  Image,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Divider,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react'
import { useParams, Navigate } from 'react-router-dom'
import { CheckCircle, Clock, Users, Star, PlayCircle, BookOpen } from 'lucide-react'

// 模拟课程详细数据
const mockCourseDetails = {
  1: {
    id: 1,
    title: 'Solidity 智能合约开发入门',
    description: '从零开始学习 Solidity 语言，掌握智能合约开发的核心技能。本课程将带你深入了解以太坊生态系统，学习如何编写、测试和部署智能合约。',
    price: '50',
    instructor: '李老师',
    instructorBio: '区块链技术专家，拥有5年智能合约开发经验，曾参与多个DeFi项目开发。',
    duration: '8小时',
    students: 156,
    rating: 4.8,
    image: 'https://via.placeholder.com/600x400/4299e1/ffffff?text=Solidity+Course',
    category: 'smart-contract',
    level: 'beginner',
    totalLessons: 12,
    completionRate: 95,
    requirements: [
      '基础的编程知识',
      '了解区块链基本概念',
      '有学习新技术的热情',
    ],
    curriculum: [
      { title: '课程介绍与环境搭建', duration: '30分钟' },
      { title: 'Solidity 语言基础', duration: '60分钟' },
      { title: '数据类型和变量', duration: '45分钟' },
      { title: '函数和修饰器', duration: '50分钟' },
      { title: '继承和接口', duration: '40分钟' },
      { title: '事件和日志', duration: '35分钟' },
      { title: '错误处理', duration: '30分钟' },
      { title: '安全最佳实践', duration: '45分钟' },
      { title: '测试智能合约', duration: '60分钟' },
      { title: '部署到测试网', duration: '40分钟' },
      { title: '与前端交互', duration: '50分钟' },
      { title: '项目实战', duration: '90分钟' },
    ],
    skills: [
      'Solidity 编程语言',
      '智能合约开发',
      'Hardhat 开发框架',
      '合约测试',
      '安全编程',
      '部署和验证',
    ],
  },
}

export function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)
  const course = mockCourseDetails[courseId]

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  if (!course) {
    return <Navigate to="/courses" replace />
  }

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

  return (
    <Container maxW="container.xl">
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* 主要内容 */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* 课程标题和基本信息 */}
            <Box>
              <HStack spacing={2} mb={3}>
                <Badge colorScheme={levelColors[course.level]}>
                  {levelLabels[course.level]}
                </Badge>
                <Badge variant="outline">智能合约</Badge>
              </HStack>
              
              <Heading size="xl" mb={4}>
                {course.title}
              </Heading>
              
              <Text fontSize="lg" color="gray.600" mb={4}>
                {course.description}
              </Text>

              <HStack spacing={6} mb={4}>
                <HStack spacing={1}>
                  <Star size={20} fill="gold" color="gold" />
                  <Text fontWeight="medium">{course.rating}</Text>
                  <Text color="gray.500">({course.students} 学员)</Text>
                </HStack>
                
                <HStack spacing={1}>
                  <Clock size={16} />
                  <Text>{course.duration}</Text>
                </HStack>
                
                <HStack spacing={1}>
                  <BookOpen size={16} />
                  <Text>{course.totalLessons} 课时</Text>
                </HStack>
              </HStack>

              <Text color="gray.600">
                讲师: <Text as="span" fontWeight="medium">{course.instructor}</Text>
              </Text>
            </Box>

            {/* 课程图片 */}
            <Image
              src={course.image}
              alt={course.title}
              borderRadius="lg"
              width="100%"
              height="300px"
              objectFit="cover"
            />

            {/* 学习收获 */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>你将学到什么</Heading>
                <List spacing={2}>
                  {course.skills.map((skill, index) => (
                    <ListItem key={index}>
                      <ListIcon as={CheckCircle} color="green.500" />
                      {skill}
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>

            {/* 课程要求 */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>课程要求</Heading>
                <List spacing={2}>
                  {course.requirements.map((req, index) => (
                    <ListItem key={index}>
                      <ListIcon as={PlayCircle} color="blue.500" />
                      {req}
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>

            {/* 课程大纲 */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>课程大纲</Heading>
                <VStack spacing={3} align="stretch">
                  {course.curriculum.map((lesson, index) => (
                    <Box
                      key={index}
                      p={3}
                      borderWidth={1}
                      borderColor={borderColor}
                      borderRadius="md"
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                    >
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Text fontWeight="medium" color="blue.500">
                            {index + 1}.
                          </Text>
                          <Text>{lesson.title}</Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {lesson.duration}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* 讲师介绍 */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>关于讲师</Heading>
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="medium">{course.instructor}</Text>
                  <Text color="gray.600">{course.instructorBio}</Text>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        {/* 侧边栏 */}
        <GridItem>
          <Box position="sticky" top="100px">
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {/* 价格 */}
                  <Box textAlign="center">
                    <Text fontSize="3xl" fontWeight="bold" color="green.500">
                      {course.price} YDT
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      一次购买，终身访问
                    </Text>
                  </Box>

                  {/* 购买按钮 */}
                  <Button
                    colorScheme="blue"
                    size="lg"
                    width="100%"
                    leftIcon={<PlayCircle size={20} />}
                  >
                    立即购买课程
                  </Button>

                  <Divider />

                  {/* 课程统计 */}
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text color="gray.600">总时长:</Text>
                      <Text fontWeight="medium">{course.duration}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text color="gray.600">课时数:</Text>
                      <Text fontWeight="medium">{course.totalLessons} 节课</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text color="gray.600">学员数:</Text>
                      <Text fontWeight="medium">{course.students} 人</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text color="gray.600">完成率:</Text>
                      <Text fontWeight="medium">{course.completionRate}%</Text>
                    </HStack>
                  </VStack>

                  <Divider />

                  {/* 提示信息 */}
                  <Alert status="info" size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">
                      购买后可立即开始学习，支持多设备同步进度
                    </Text>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  )
}
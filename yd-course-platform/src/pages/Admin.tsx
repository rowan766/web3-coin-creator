// src/pages/Admin.tsx
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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Edit, Trash2, Plus, BarChart3 } from 'lucide-react'
import { useCoursePlatform } from '../hooks/useCoursePlatform'

interface CreateCourseForm {
  title: string
  description: string
  contentHash: string
  price: string
  instructor: string
}

export function Admin() {
  const { account, active } = useWeb3React()
  const { 
    courses, 
    isLoading, 
    error, 
    isOwner, 
    createCourse,
    formatPrice 
  } = useCoursePlatform()
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  
  const [formData, setFormData] = useState<CreateCourseForm>({
    title: '',
    description: '',
    contentHash: '',
    price: '',
    instructor: account || '',
  })
  const [isCreating, setIsCreating] = useState(false)

  // 处理表单输入
  const handleInputChange = (field: keyof CreateCourseForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contentHash: '',
      price: '',
      instructor: account || '',
    })
  }

  // 创建课程
  const handleCreateCourse = async () => {
    // 验证表单
    if (!formData.title || !formData.description || !formData.price || !formData.instructor) {
      toast({
        title: '表单验证失败',
        description: '请填写所有必填字段',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (parseFloat(formData.price) <= 0) {
      toast({
        title: '价格错误',
        description: '课程价格必须大于 0',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      setIsCreating(true)
      await createCourse(formData)
      
      toast({
        title: '课程创建成功！',
        description: `课程 "${formData.title}" 已成功创建`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      resetForm()
      onClose()
    } catch (error: any) {
      toast({
        title: '创建失败',
        description: error.message || '创建课程时出现错误',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsCreating(false)
    }
  }

  // 检查权限
  if (!active || !account) {
    return (
      <Container maxW="container.xl">
        <Alert status="warning">
          <AlertIcon />
          请先连接钱包以访问管理员面板
        </Alert>
      </Container>
    )
  }

  if (!isOwner) {
    return (
      <Container maxW="container.xl">
        <Alert status="error">
          <AlertIcon />
          只有合约所有者可以访问管理员面板
        </Alert>
      </Container>
    )
  }

  // 计算统计数据
  const stats = {
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.isActive).length,
    totalSales: courses.reduce((sum, course) => sum + course.totalSales, 0),
    totalRevenue: courses.reduce((sum, course) => 
      sum + (course.totalSales * parseFloat(formatPrice(course.price))), 0
    ),
  }

  return (
    <Container maxW="container.xl">
      <VStack spacing={8} align="stretch">
        {/* 页面标题 */}
        <Box>
          <Heading size="xl" mb={2}>管理员面板</Heading>
          <Text color="gray.600">管理课程和平台设置</Text>
          <Text fontSize="sm" color="green.600" mt={1}>
            ✅ 已确认合约所有者身份
          </Text>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* 统计卡片 */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stats.totalCourses}
              </Text>
              <Text color="gray.600">总课程数</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.activeCourses}
              </Text>
              <Text color="gray.600">活跃课程</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {stats.totalSales}
              </Text>
              <Text color="gray.600">总销售量</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {stats.totalRevenue.toFixed(2)}
              </Text>
              <Text color="gray.600">总收入 (YDT)</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 主要内容 */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>课程管理</Tab>
            <Tab>平台统计</Tab>
            <Tab>设置</Tab>
          </TabList>

          <TabPanels>
            {/* 课程管理 */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <HStack justify="space-between">
                    <Heading size="md">课程管理</Heading>
                    <Button
                      leftIcon={<Plus size={16} />}
                      colorScheme="blue"
                      onClick={onOpen}
                    >
                      创建新课程
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  {isLoading ? (
                    <Text textAlign="center" color="gray.500">
                      正在加载课程数据...
                    </Text>
                  ) : courses.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>课程标题</Th>
                          <Th>价格</Th>
                          <Th>销售量</Th>
                          <Th>状态</Th>
                          <Th>操作</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {courses.map(course => (
                          <Tr key={course.id}>
                            <Td>{course.id}</Td>
                            <Td>
                              <Text fontWeight="medium" noOfLines={1}>
                                {course.title}
                              </Text>
                              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                {course.description}
                              </Text>
                            </Td>
                            <Td>{formatPrice(course.price)} YDT</Td>
                            <Td>{course.totalSales}</Td>
                            <Td>
                              <Badge colorScheme={course.isActive ? 'green' : 'gray'}>
                                {course.isActive ? '活跃' : '已停用'}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  aria-label="编辑课程"
                                  icon={<Edit size={16} />}
                                  size="sm"
                                  variant="outline"
                                />
                                <IconButton
                                  aria-label="删除课程"
                                  icon={<Trash2 size={16} />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="outline"
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Box textAlign="center" py={8}>
                      <Text color="gray.500" mb={4}>
                        还没有创建任何课程
                      </Text>
                      <Button
                        leftIcon={<Plus size={16} />}
                        colorScheme="blue"
                        onClick={onOpen}
                      >
                        创建第一个课程
                      </Button>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>

            {/* 平台统计 */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <HStack>
                    <BarChart3 size={20} />
                    <Heading size="md">平台统计</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box>
                      <Text fontWeight="bold" mb={3}>课程统计</Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>总课程数:</Text>
                          <Text fontWeight="medium">{stats.totalCourses}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>活跃课程:</Text>
                          <Text fontWeight="medium">{stats.activeCourses}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>平均价格:</Text>
                          <Text fontWeight="medium">
                            {courses.length > 0 
                              ? (courses.reduce((sum, c) => sum + parseFloat(formatPrice(c.price)), 0) / courses.length).toFixed(2)
                              : '0'
                            } YDT
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" mb={3}>销售统计</Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>总销售量:</Text>
                          <Text fontWeight="medium">{stats.totalSales}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>总收入:</Text>
                          <Text fontWeight="medium">{stats.totalRevenue.toFixed(2)} YDT</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>平均销量:</Text>
                          <Text fontWeight="medium">
                            {courses.length > 0 
                              ? (stats.totalSales / courses.length).toFixed(1)
                              : '0'
                            }
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </TabPanel>

            {/* 设置 */}
            <TabPanel px={0}>
              <Card>
                <CardHeader>
                  <Heading size="md">平台设置</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="bold" mb={2}>合约信息</Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>YDToken 合约:</Text>
                          <Text fontSize="sm" fontFamily="mono" color="blue.600">
                            {import.meta.env.VITE_YD_TOKEN_ADDRESS}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>课程平台合约:</Text>
                          <Text fontSize="sm" fontFamily="mono" color="blue.600">
                            {import.meta.env.VITE_COURSE_PLATFORM_ADDRESS}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" mb={2}>权限信息</Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>当前账户:</Text>
                          <Text fontSize="sm" fontFamily="mono" color="green.600">
                            {account}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>权限状态:</Text>
                          <Badge colorScheme="green">合约所有者</Badge>
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* 创建课程模态框 */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>创建新课程</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>课程标题</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="输入课程标题"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>课程描述</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="输入课程描述"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>内容哈希</FormLabel>
                <Input
                  value={formData.contentHash}
                  onChange={(e) => handleInputChange('contentHash', e.target.value)}
                  placeholder="IPFS 哈希或其他内容标识符"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>课程价格 (YDT)</FormLabel>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.1"
                  min="0"
                  step="0.1"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>讲师地址</FormLabel>
                <Input
                  value={formData.instructor}
                  onChange={(e) => handleInputChange('instructor', e.target.value)}
                  placeholder="0x..."
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              取消
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateCourse}
              isLoading={isCreating}
              loadingText="创建中..."
            >
              创建课程
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
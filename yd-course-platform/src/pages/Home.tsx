// src/pages/Home.tsx
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { BookOpen, Users, Award, Zap } from 'lucide-react'

export function Home() {
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.400, blue.600)',
    'linear(to-r, blue.600, blue.800)'
  )

  const features = [
    {
      icon: BookOpen,
      title: '优质课程',
      description: '由行业专家打造的高质量区块链和编程课程',
      color: 'blue',
    },
    {
      icon: Users,
      title: '社区学习',
      description: '与全球开发者一起学习，分享经验和知识',
      color: 'green',
    },
    {
      icon: Award,
      title: '认证证书',
      description: '完成课程后获得区块链存储的认证证书',
      color: 'purple',
    },
    {
      icon: Zap,
      title: '去中心化',
      description: '基于区块链技术，真正的去中心化学习平台',
      color: 'orange',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient={bgGradient}
        color="white"
        py={20}
        textAlign="center"
        borderRadius="lg"
        mb={16}
      >
        <Container maxW="container.lg">
          <VStack spacing={6}>
            <Badge colorScheme="whiteAlpha" fontSize="sm" px={3} py={1}>
              基于区块链的学习平台
            </Badge>
            
            <Heading
              fontSize={{ base: '3xl', md: '5xl' }}
              fontWeight="bold"
              lineHeight="shorter"
            >
              开启你的
              <Text as="span" color="yellow.300"> Web3 </Text>
              学习之旅
            </Heading>
            
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              maxW="2xl"
              opacity={0.9}
            >
              在 YD Course Platform 上探索区块链技术、智能合约开发、
              DeFi 和 NFT 等前沿技术。使用 YD Token 购买课程，
              获得区块链认证的学习证书。
            </Text>
            
            <HStack spacing={4} pt={4}>
              <Button
                as={RouterLink}
                to="/courses"
                size="lg"
                colorScheme="yellow"
                color="gray.800"
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                探索课程
              </Button>
              
              <Button
                as={RouterLink}
                to="/dashboard"
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
              >
                我的仪表板
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl">
        <VStack spacing={12}>
          <Box textAlign="center">
            <Heading size="xl" mb={4}>
              为什么选择 YD Course Platform？
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              我们结合了传统在线教育的优势和区块链技术的创新，
              为学习者提供独特的去中心化学习体验。
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="outline"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardBody textAlign="center">
                  <VStack spacing={4}>
                    <Box
                      p={3}
                      borderRadius="full"
                      bg={`${feature.color}.100`}
                    >
                      <Icon
                        as={feature.icon}
                        boxSize={8}
                        color={`${feature.color}.500`}
                      />
                    </Box>
                    
                    <Heading size="md">{feature.title}</Heading>
                    
                    <Text color="gray.600" fontSize="sm">
                      {feature.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Stats Section */}
          <Box
            w="full"
            bg={useColorModeValue('gray.50', 'gray.800')}
            py={12}
            px={8}
            borderRadius="lg"
            textAlign="center"
          >
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <VStack>
                <Heading size="2xl" color="blue.500">50+</Heading>
                <Text color="gray.600">优质课程</Text>
              </VStack>
              
              <VStack>
                <Heading size="2xl" color="green.500">1000+</Heading>
                <Text color="gray.600">学习者</Text>
              </VStack>
              
              <VStack>
                <Heading size="2xl" color="purple.500">100%</Heading>
                <Text color="gray.600">去中心化</Text>
              </VStack>
            </SimpleGrid>
          </Box>

          {/* CTA Section */}
          <Box textAlign="center" py={12}>
            <VStack spacing={6}>
              <Heading size="lg">准备开始学习了吗？</Heading>
              
              <Text fontSize="lg" color="gray.600" maxW="xl">
                连接你的钱包，获取一些 YD Token，然后开始探索我们的课程库。
              </Text>
              
              <Button
                as={RouterLink}
                to="/courses"
                size="lg"
                colorScheme="blue"
                _hover={{ transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                立即开始学习
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
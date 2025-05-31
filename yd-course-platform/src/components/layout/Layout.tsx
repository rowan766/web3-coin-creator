// src/components/layout/Layout.tsx
import { ReactNode } from 'react'
import {
  Box,
  Flex,
  HStack,
  Link,
  Button,
  Text,
  Container,
  useColorModeValue,
  useColorMode,
  IconButton,
  Spacer,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Moon, Sun, BookOpen } from 'lucide-react'
import { WalletConnector } from '@/components/wallet/WalletConnector'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const location = useLocation()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const navigation = [
    { name: '首页', href: '/' },
    { name: '课程', href: '/courses' },
    { name: '仪表板', href: '/dashboard' },
  ]

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Header */}
      <Box
        bg={bgColor}
        px={4}
        borderBottomWidth={1}
        borderBottomColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl">
          <Flex h={16} alignItems="center">
            {/* Logo */}
            <HStack spacing={3}>
              <Box p={2} bg="blue.500" borderRadius="md">
                <BookOpen color="white" size={20} />
              </Box>
              <Text fontSize="xl" fontWeight="bold" color="blue.500">
                YD Course Platform
              </Text>
            </HStack>

            <Spacer />

            {/* Navigation */}
            <HStack spacing={8} mr={8}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  as={RouterLink}
                  to={item.href}
                  px={3}
                  py={2}
                  borderRadius="md"
                  fontWeight={location.pathname === item.href ? 'bold' : 'medium'}
                  color={location.pathname === item.href ? 'blue.500' : 'gray.600'}
                  bg={location.pathname === item.href ? 'blue.50' : 'transparent'}
                  _hover={{
                    textDecoration: 'none',
                    bg: 'blue.50',
                    color: 'blue.500',
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </HStack>

            {/* Right side actions */}
            <HStack spacing={3}>
              <IconButton
                aria-label="切换主题"
                icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
              />
              
              <WalletConnector />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>

      {/* Footer */}
      <Box
        bg={bgColor}
        borderTopWidth={1}
        borderTopColor={borderColor}
        py={8}
        mt={16}
      >
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', md: 'row' }} align="center">
            <Text color="gray.600" fontSize="sm">
              © 2025 YD Course Platform. 基于区块链的去中心化课程平台.
            </Text>
            
            <Spacer />
            
            <HStack spacing={4} mt={{ base: 4, md: 0 }}>
              <Link
                href="https://sepolia.etherscan.io"
                isExternal
                fontSize="sm"
                color="blue.500"
                _hover={{ textDecoration: 'underline' }}
              >
                Sepolia 浏览器
              </Link>
              <Link
                href="https://sepoliafaucet.com"
                isExternal
                fontSize="sm"
                color="blue.500"
                _hover={{ textDecoration: 'underline' }}
              >
                获取测试 ETH
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}
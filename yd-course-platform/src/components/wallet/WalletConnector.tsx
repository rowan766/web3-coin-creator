// src/components/wallet/WalletConnector.tsx
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Image,
  useDisclosure,
  useToast,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { useWeb3React } from '@web3-react/core'

// 暂时简化导入，避免循环依赖
const connectorsByName = {
  MetaMask: null, // 临时占位
}

const connectorInfo = {
  MetaMask: {
    name: 'MetaMask',
    iconUrl: 'https://docs.metamask.io/img/metamask-fox.svg',
    description: '连接到 MetaMask 钱包',
  },
}

interface WalletConnectorProps {
  onConnect?: (account: string) => void
  onDisconnect?: () => void
}

export function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps = {}) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const { account, chainId, active, error } = useWeb3React()

  // 简化的连接函数
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        if (accounts.length > 0) {
          onClose()
          
          toast({
            title: '钱包连接成功',
            description: `已连接到 MetaMask`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
          
          onConnect?.(accounts[0])
        }
      } else {
        toast({
          title: '未检测到钱包',
          description: '请安装 MetaMask 或其他以太坊钱包',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (err: any) {
      console.error('Failed to connect wallet:', err)
      
      toast({
        title: '连接失败',
        description: err.message || '无法连接到钱包',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // 断开连接
  const disconnectWallet = () => {
    onDisconnect?.()
    
    toast({
      title: '钱包已断开',
      description: '已成功断开钱包连接',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  }

  // 格式化地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      {active && account ? (
        <HStack spacing={3}>
          <Badge colorScheme="green" fontSize="xs">
            已连接
          </Badge>
          
          <VStack spacing={1} align="flex-end">
            <Text fontSize="sm" fontWeight="medium">
              {formatAddress(account)}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {chainId ? `Chain ${chainId}` : '未知网络'}
            </Text>
          </VStack>
          
          <Button size="sm" variant="outline" onClick={disconnectWallet}>
            断开连接
          </Button>
        </HStack>
      ) : (
        <Button colorScheme="blue" onClick={onOpen}>
          连接钱包
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>连接钱包</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4} color="gray.600">
              选择你要使用的钱包类型
            </Text>
            
            <VStack spacing={3}>
              <Button
                w="full"
                h="auto"
                p={4}
                variant="outline"
                onClick={connectWallet}
                _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
              >
                <HStack w="full" justify="space-between">
                  <HStack>
                    <Image
                      src={connectorInfo.MetaMask.iconUrl}
                      alt="MetaMask"
                      boxSize="32px"
                    />
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="medium">{connectorInfo.MetaMask.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {connectorInfo.MetaMask.description}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
              </Button>
            </VStack>

            {error && (
              <>
                <Divider my={4} />
                <Box p={3} bg="red.50" borderRadius="md" borderColor="red.200" borderWidth={1}>
                  <Text fontSize="sm" color="red.600">
                    连接错误: {error.message}
                  </Text>
                </Box>
              </>
            )}

            <Divider my={4} />
            
            <Box p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="xs" color="gray.600">
                连接钱包后，你将能够购买课程、查看余额等操作。请确保钱包已切换到 Sepolia 测试网络。
              </Text>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

// 声明 window.ethereum 类型
declare global {
  interface Window {
    ethereum?: any
  }
}
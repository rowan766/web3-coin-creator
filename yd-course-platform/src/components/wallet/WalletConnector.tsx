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
  Spinner,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

// Sepolia 测试网配置
const SEPOLIA_CHAIN_ID = 11155111
const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7', // 11155111 的十六进制
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'SEP',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
}

// 配置支持的链ID（包括主网和测试网）
const supportedChainIds = [1, 3, 4, 5, 42, 11155111] // 包含 Sepolia

// 创建 MetaMask 连接器
const injectedConnector = new InjectedConnector({
  supportedChainIds,
})

const connectorsByName = {
  MetaMask: injectedConnector,
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
  const { account, chainId, active, error, activate, deactivate } = useWeb3React()
  const [connecting, setConnecting] = useState(false)
  const [balance, setBalance] = useState<string>('')

  // 获取账户余额
  useEffect(() => {
    if (account && window.ethereum) {
      getBalance()
    }
  }, [account, chainId])

  const getBalance = async () => {
    try {
      if (window.ethereum && account) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [account, 'latest']
        })
        // 将 wei 转换为 ETH
        const ethBalance = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
        setBalance(ethBalance)
      }
    } catch (error) {
      console.error('获取余额失败:', error)
    }
  }

  // 连接钱包
  const connectWallet = async (connectorName: string) => {
    const connector = connectorsByName[connectorName as keyof typeof connectorsByName]
    
    if (!connector) {
      toast({
        title: '连接器未找到',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setConnecting(true)

    try {
      // 检查是否安装了 MetaMask
      if (connectorName === 'MetaMask' && typeof window.ethereum === 'undefined') {
        toast({
          title: '未检测到 MetaMask',
          description: '请先安装 MetaMask 浏览器扩展',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        setConnecting(false)
        return
      }

      // 激活连接器
      await activate(connector, undefined, true)
      
      // 连接成功后检查网络
      await checkAndSwitchNetwork()
      
      onClose()
      
      toast({
        title: '钱包连接成功',
        description: `已连接到 ${connectorName}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // 获取连接的账户
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      })
      
      if (accounts.length > 0) {
        onConnect?.(accounts[0])
      }
      
    } catch (err: any) {
      console.error('Failed to connect wallet:', err)
      
      let errorMessage = '无法连接到钱包'
      
      if (err.code === 4001) {
        errorMessage = '用户拒绝了连接请求'
      } else if (err.code === -32002) {
        errorMessage = '请在钱包中确认连接请求'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      toast({
        title: '连接失败',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    
    setConnecting(false)
  }

  // 检查并切换到 Sepolia 网络
  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum) return

    try {
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      })
      
      // 如果不在 Sepolia 网络，提示用户切换
      if (parseInt(currentChainId, 16) !== SEPOLIA_CHAIN_ID) {
        toast({
          title: '网络提示',
          description: '建议切换到 Sepolia 测试网络以获得最佳体验',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('检查网络失败:', error)
    }
  }

  // 切换到 Sepolia 网络
  const switchToSepolia = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      })
      
      toast({
        title: '网络切换成功',
        description: '已切换到 Sepolia 测试网络',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error: any) {
      // 如果网络不存在，尝试添加
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          })
        } catch (addError) {
          console.error('添加网络失败:', addError)
          toast({
            title: '添加网络失败',
            description: '请手动添加 Sepolia 测试网络',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      } else {
        console.error('切换网络失败:', error)
        toast({
          title: '切换网络失败',
          description: error.message || '无法切换到 Sepolia 网络',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  // 断开连接
  const disconnectWallet = () => {
    deactivate()
    setBalance('')
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

  // 获取网络名称
  const getNetworkName = (chainId: number) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum',
      11155111: 'Sepolia',
      5: 'Goerli',
      4: 'Rinkeby',
      3: 'Ropsten',
    }
    return networks[chainId] || `Chain ${chainId}`
  }

  return (
    <>
      {active && account ? (
        <HStack spacing={3}>
          <Badge 
            colorScheme={chainId === SEPOLIA_CHAIN_ID ? "green" : "orange"} 
            fontSize="xs"
          >
            {chainId === SEPOLIA_CHAIN_ID ? "Sepolia" : getNetworkName(chainId || 0)}
          </Badge>
          
          <VStack spacing={1} align="flex-end">
            <Text fontSize="sm" fontWeight="medium">
              {formatAddress(account)}
            </Text>
            {balance && (
              <Text fontSize="xs" color="gray.500">
                {balance} ETH
              </Text>
            )}
          </VStack>
          
          {chainId !== SEPOLIA_CHAIN_ID && (
            <Button size="sm" colorScheme="orange" onClick={switchToSepolia}>
              切换到 Sepolia
            </Button>
          )}
          
          <Button size="sm" variant="outline" onClick={disconnectWallet}>
            断开连接
          </Button>
        </HStack>
      ) : (
        <Button 
          colorScheme="blue" 
          onClick={onOpen}
          isLoading={connecting}
          loadingText="连接中..."
        >
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
              {Object.entries(connectorInfo).map(([name, info]) => (
                <Button
                  key={name}
                  w="full"
                  h="auto"
                  p={4}
                  variant="outline"
                  onClick={() => connectWallet(name)}
                  isLoading={connecting}
                  _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
                >
                  <HStack w="full" justify="space-between">
                    <HStack>
                      <Image
                        src={info.iconUrl}
                        alt={info.name}
                        boxSize="32px"
                      />
                      <VStack align="flex-start" spacing={0}>
                        <Text fontWeight="medium">{info.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {info.description}
                        </Text>
                      </VStack>
                    </HStack>
                    {connecting && <Spinner size="sm" />}
                  </HStack>
                </Button>
              ))}
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
            
            <Box p={3} bg="blue.50" borderRadius="md">
              <Text fontSize="xs" color="blue.600" mb={2}>
                <strong>重要提示：</strong>
              </Text>
              <Text fontSize="xs" color="gray.600">
                • 连接钱包后，你将能够购买课程、查看余额等操作<br/>
                • 建议使用 Sepolia 测试网络进行测试<br/>
                • 确保钱包中有足够的测试代币
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
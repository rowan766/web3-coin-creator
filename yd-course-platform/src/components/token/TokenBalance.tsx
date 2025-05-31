// src/components/token/TokenBalance.tsx
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
  Button,
  Skeleton,
  useColorModeValue,
  Icon,
  Text,
  Badge,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { RefreshCw, Coins, AlertTriangle } from 'lucide-react'
import { useWeb3React } from '@web3-react/core'
import { parseEther } from 'ethers'
import { useYDToken } from '@/hooks/useYDToken'

interface TokenBalanceProps {
  address?: string
  showActions?: boolean
}

export function TokenBalance({ address, showActions = true }: TokenBalanceProps = {}) {
  const { account, chainId } = useWeb3React()
  const { 
    tokenInfo, 
    balance, 
    allowance, 
    isLoading, 
    error, 
    refreshBalance,
    approve,
    formattedBalance,
    formattedAllowance 
  } = useYDToken()
  
  const toast = useToast()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  const targetAddress = address || account
  
  // 检查网络
  const isWrongNetwork = chainId && chainId !== 11155111 // Sepolia

  // 授权购买课程所需的代币
  const handleApprove = async () => {
    try {
      // 授权足够大的金额 (比如 1000 个代币)
      const approveAmount = parseEther('1000')
      await approve(approveAmount)
      
      toast({
        title: '授权成功',
        description: '已授权 1000 YDT 给课程平台',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error: any) {
      toast({
        title: '授权失败',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }
  
  if (!targetAddress) {
    return (
      <Box
        p={6}
        bg={bgColor}
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="lg"
      >
        <Text color="gray.500" textAlign="center">
          请先连接钱包
        </Text>
      </Box>
    )
  }

  if (isWrongNetwork) {
    return (
      <Box
        p={6}
        bg={bgColor}
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="lg"
      >
        <Alert status="warning">
          <AlertIcon />
          <VStack align="flex-start" spacing={2}>
            <Text fontWeight="medium">网络错误</Text>
            <Text fontSize="sm">
              请切换到 Sepolia 测试网络。当前网络 ID: {chainId}
            </Text>
          </VStack>
        </Alert>
      </Box>
    )
  }

  return (
    <Box
      p={6}
      bg={bgColor}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        {/* 代币信息头部 */}
        <HStack justify="space-between" align="center">
          <HStack>
            <Icon as={Coins} color="yellow.500" boxSize={5} />
            <Text fontWeight="bold" fontSize="lg">
              {tokenInfo ? `${tokenInfo.name} (${tokenInfo.symbol})` : 'YD Token'}
            </Text>
          </HStack>
          
          {showActions && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<RefreshCw size={16} />}
              onClick={refreshBalance}
              isLoading={isLoading}
              loadingText="刷新中"
            >
              刷新
            </Button>
          )}
        </HStack>

        {/* 错误提示 */}
        {error && (
          <Alert status="error" size="sm">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        {/* 余额统计 */}
        <HStack spacing={6}>
          <Stat>
            <StatLabel>余额</StatLabel>
            <StatNumber>
              {isLoading ? (
                <Skeleton height="32px" />
              ) : (
                <HStack>
                  <Text>{parseFloat(formattedBalance).toLocaleString()}</Text>
                  <Badge colorScheme="blue" fontSize="xs">
                    {tokenInfo?.symbol || 'YDT'}
                  </Badge>
                </HStack>
              )}
            </StatNumber>
            <StatHelpText>可用余额</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>授权额度</StatLabel>
            <StatNumber>
              {isLoading ? (
                <Skeleton height="32px" />
              ) : (
                <HStack>
                  <Text>{parseFloat(formattedAllowance).toLocaleString()}</Text>
                  <Badge colorScheme="green" fontSize="xs">
                    {tokenInfo?.symbol || 'YDT'}
                  </Badge>
                </HStack>
              )}
            </StatNumber>
            <StatHelpText>课程平台可用</StatHelpText>
          </Stat>
        </HStack>

        {/* 代币详细信息 */}
        {tokenInfo && !isLoading && (
          <Box p={3} bg="gray.50" borderRadius="md">
            <VStack spacing={1} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">总供应量:</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {parseFloat(tokenInfo.totalSupply.toString()).toLocaleString()} {tokenInfo.symbol}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">小数位数:</Text>
                <Text fontSize="sm" fontWeight="medium">{tokenInfo.decimals}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">合约地址:</Text>
                <Text fontSize="xs" fontFamily="mono" color="blue.600">
                  {import.meta.env.VITE_YD_TOKEN_ADDRESS}
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* 余额状态提示和操作 */}
        {!isLoading && (
          <VStack spacing={3}>
            {balance === 0n && (
              <Box p={3} bg="orange.50" borderRadius="md" borderColor="orange.200" borderWidth={1}>
                <HStack>
                  <Icon as={AlertTriangle} color="orange.500" />
                  <VStack align="flex-start" spacing={1}>
                    <Text fontSize="sm" color="orange.700" fontWeight="medium">
                      没有 YD Token
                    </Text>
                    <Text fontSize="xs" color="orange.600">
                      你需要一些 YD Token 来购买课程。请联系管理员获取测试代币。
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {allowance === 0n && balance > 0n && (
              <Box p={3} bg="blue.50" borderRadius="md" borderColor="blue.200" borderWidth={1}>
                <VStack spacing={3}>
                  <HStack>
                    <Icon as={AlertTriangle} color="blue.500" />
                    <VStack align="flex-start" spacing={1}>
                      <Text fontSize="sm" color="blue.700" fontWeight="medium">
                        需要授权代币
                      </Text>
                      <Text fontSize="xs" color="blue.600">
                        购买课程前需要先授权代币给课程平台使用。
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleApprove}
                    isLoading={isLoading}
                    loadingText="授权中..."
                    width="full"
                  >
                    授权 YD Token
                  </Button>
                </VStack>
              </Box>
            )}

            {allowance > 0n && balance > 0n && (
              <Box p={3} bg="green.50" borderRadius="md" borderColor="green.200" borderWidth={1}>
                <HStack>
                  <Icon as={Coins} color="green.500" />
                  <Text fontSize="sm" color="green.700">
                    ✅ 已准备好购买课程！你有 {formattedBalance} YDT，已授权 {formattedAllowance} YDT
                  </Text>
                </HStack>
              </Box>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
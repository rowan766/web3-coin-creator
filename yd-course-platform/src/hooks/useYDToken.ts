// src/hooks/useYDToken.ts
import { useState, useEffect, useCallback } from 'react'
import { formatEther } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useYDTokenContract, getContractWithSigner } from './useContract'

interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
}

export function useYDToken() {
  const { account, chainId } = useWeb3React()
  const contract = useYDTokenContract()
  
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [balance, setBalance] = useState<bigint>(0n)
  const [allowance, setAllowance] = useState<bigint>(0n)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查是否有合约地址配置
  const hasContract = !!import.meta.env.VITE_YD_TOKEN_ADDRESS

  // 获取代币基本信息
  const fetchTokenInfo = useCallback(async () => {
    if (!contract || !hasContract) {
      console.log('No YD Token contract configured, using mock data')
      setTokenInfo({
        name: 'YD Token (Mock)',
        symbol: 'YDT',
        decimals: 18,
        totalSupply: BigInt('1000000000000000000000000')
      })
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching token info from contract...')
      
      // 直接调用合约方法，不需要 signer
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
      ])

      setTokenInfo({
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: BigInt(totalSupply.toString()),
      })
      
      console.log('Token info fetched successfully:', { name, symbol, decimals: Number(decimals) })
    } catch (err: any) {
      console.error('Failed to fetch token info:', err)
      
      // 如果是不支持的操作错误，使用模拟数据
      if (err.code === 'UNSUPPORTED_OPERATION') {
        console.log('Contract calls not supported, using mock data')
        setTokenInfo({
          name: 'YD Token (Mock)',
          symbol: 'YDT',
          decimals: 18,
          totalSupply: BigInt('1000000000000000000000000')
        })
        setError(null)
      } else {
        setError('获取代币信息失败，使用模拟数据')
        setTokenInfo({
          name: 'YD Token (Fallback)',
          symbol: 'YDT',
          decimals: 18,
          totalSupply: BigInt('1000000000000000000000000')
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [contract, hasContract])

  // 获取用户余额
  const fetchBalance = useCallback(async () => {
    if (!contract || !account || !hasContract) {
      if (account && !hasContract) {
        setBalance(BigInt('1000000000000000000000')) // 1000 tokens
      } else {
        setBalance(0n)
      }
      return
    }

    try {
      console.log('Fetching balance for account:', account)
      const userBalance = await contract.balanceOf(account)
      const balanceBigInt = BigInt(userBalance.toString())
      setBalance(balanceBigInt)
      console.log('Balance fetched:', formatEther(balanceBigInt), 'YDT')
    } catch (err: any) {
      console.error('Failed to fetch balance:', err)
      
      if (err.code === 'UNSUPPORTED_OPERATION') {
        console.log('Balance query not supported, using mock balance')
        setBalance(BigInt('1000000000000000000000'))
        setError(null)
      } else {
        setError('获取余额失败，使用模拟数据')
        setBalance(BigInt('1000000000000000000000'))
      }
    }
  }, [contract, account, hasContract])

  // 获取授权额度
  const fetchAllowance = useCallback(async () => {
    if (!contract || !account || !hasContract) {
      if (account && !hasContract) {
        setAllowance(BigInt('500000000000000000000'))
      } else {
        setAllowance(0n)
      }
      return
    }

    try {
      const platformAddress = import.meta.env.VITE_COURSE_PLATFORM_ADDRESS
      if (platformAddress && platformAddress !== "0x0000000000000000000000000000000000000000") {
        console.log('Fetching allowance for platform:', platformAddress)
        const userAllowance = await contract.allowance(account, platformAddress)
        const allowanceBigInt = BigInt(userAllowance.toString())
        setAllowance(allowanceBigInt)
        console.log('Allowance fetched:', formatEther(allowanceBigInt), 'YDT')
      } else {
        console.warn('No platform address configured')
        setAllowance(BigInt('500000000000000000000'))
      }
    } catch (err: any) {
      console.error('Failed to fetch allowance:', err)
      
      if (err.code === 'UNSUPPORTED_OPERATION') {
        console.log('Allowance query not supported, using mock allowance')
        setAllowance(BigInt('500000000000000000000'))
        setError(null)
      } else {
        setError('获取授权额度失败，使用模拟数据')
        setAllowance(BigInt('500000000000000000000'))
      }
    }
  }, [contract, account, hasContract])

  // 授权代币
  const approve = useCallback(async (amount: bigint) => {
    if (!account) {
      throw new Error('请先连接钱包')
    }

    if (!contract || !hasContract) {
      // 模拟授权
      console.log('Simulating approval for:', formatEther(amount), 'YDT')
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAllowance(amount)
      setIsLoading(false)
      return { hash: '0x' + Math.random().toString(16).substr(2, 64) }
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const platformAddress = import.meta.env.VITE_COURSE_PLATFORM_ADDRESS
      if (!platformAddress) {
        throw new Error('未配置课程平台合约地址')
      }
      
      console.log('Approving', formatEther(amount), 'YDT for platform:', platformAddress)
      
      // 获取带 signer 的合约
      const contractWithSigner = await getContractWithSigner(contract)
      if (!contractWithSigner) {
        throw new Error('无法获取签名合约')
      }
      
      const tx = await contractWithSigner.approve(platformAddress, amount.toString())
      
      console.log('Approval transaction submitted:', tx.hash)
      await tx.wait()
      console.log('Approval transaction confirmed')
      
      // 刷新授权额度
      await fetchAllowance()
      
      return tx
    } catch (err: any) {
      console.error('Approval failed:', err)
      
      let errorMessage = '授权失败'
      if (err.code === 'UNSUPPORTED_OPERATION') {
        errorMessage = '当前网络不支持合约调用，请检查钱包连接'
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, hasContract, fetchAllowance])

  // 转账
  const transfer = useCallback(async (to: string, amount: bigint) => {
    if (!account) {
      throw new Error('请先连接钱包')
    }

    if (!contract || !hasContract) {
      // 模拟转账
      console.log('Simulating transfer of', formatEther(amount), 'YDT to:', to)
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setBalance(prev => prev - amount)
      setIsLoading(false)
      return { hash: '0x' + Math.random().toString(16).substr(2, 64) }
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Transferring', formatEther(amount), 'YDT to:', to)
      
      // 获取带 signer 的合约
      const contractWithSigner = await getContractWithSigner(contract)
      if (!contractWithSigner) {
        throw new Error('无法获取签名合约')
      }
      
      const tx = await contractWithSigner.transfer(to, amount.toString())
      
      console.log('Transfer transaction submitted:', tx.hash)
      await tx.wait()
      console.log('Transfer transaction confirmed')
      
      // 刷新余额
      await fetchBalance()
      
      return tx
    } catch (err: any) {
      console.error('Transfer failed:', err)
      
      let errorMessage = '转账失败'
      if (err.code === 'UNSUPPORTED_OPERATION') {
        errorMessage = '当前网络不支持合约调用，请检查钱包连接'
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, hasContract, fetchBalance])

  // 刷新所有数据
  const refreshBalance = useCallback(async () => {
    await Promise.all([
      fetchTokenInfo(),
      fetchBalance(),
      fetchAllowance()
    ])
  }, [fetchTokenInfo, fetchBalance, fetchAllowance])

  // 初始化加载
  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  // 监听账户和链变化
  useEffect(() => {
    if (account) {
      fetchBalance()
      fetchAllowance()
    }
  }, [account, chainId, fetchBalance, fetchAllowance])

  return {
    // 数据
    tokenInfo,
    balance,
    allowance,
    isLoading,
    error,
    hasContract,
    
    // 方法
    approve,
    transfer,
    refreshBalance,
    
    // 计算属性
    formattedBalance: formatEther(balance),
    formattedAllowance: formatEther(allowance),
  }
}
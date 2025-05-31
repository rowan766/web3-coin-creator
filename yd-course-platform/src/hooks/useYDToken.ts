// src/hooks/useYDToken.ts
import { useState, useEffect, useCallback } from 'react'
import { formatEther } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useYDTokenContract } from './useContract'

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

  // 获取代币基本信息
  const fetchTokenInfo = useCallback(async () => {
    if (!contract) return

    try {
      setIsLoading(true)
      setError(null)
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
      ])

      setTokenInfo({
        name,
        symbol,
        decimals,
        totalSupply,
      })
    } catch (err: any) {
      console.error('Failed to fetch token info:', err)
      setError('获取代币信息失败: ' + (err.reason || err.message))
    } finally {
      setIsLoading(false)
    }
  }, [contract])

  // 获取用户余额
  const fetchBalance = useCallback(async () => {
    if (!contract || !account) {
      setBalance(0n)
      return
    }

    try {
      const userBalance = await contract.balanceOf(account)
      setBalance(userBalance)
    } catch (err: any) {
      console.error('Failed to fetch balance:', err)
      setError('获取余额失败: ' + (err.reason || err.message))
    }
  }, [contract, account])

  // 获取授权额度
  const fetchAllowance = useCallback(async () => {
    if (!contract || !account) {
      setAllowance(0n)
      return
    }

    try {
      const platformAddress = import.meta.env.VITE_COURSE_PLATFORM_ADDRESS
      if (platformAddress && platformAddress !== "0x0000000000000000000000000000000000000000") {
        const userAllowance = await contract.allowance(account, platformAddress)
        setAllowance(userAllowance)
      }
    } catch (err: any) {
      console.error('Failed to fetch allowance:', err)
      setError('获取授权额度失败: ' + (err.reason || err.message))
    }
  }, [contract, account])

  // 授权代币
  const approve = useCallback(async (amount: bigint) => {
    if (!contract || !account) {
      throw new Error('合约或账户未连接')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const platformAddress = import.meta.env.VITE_COURSE_PLATFORM_ADDRESS
      const tx = await contract.approve(platformAddress, amount)
      
      console.log('授权交易已提交:', tx.hash)
      await tx.wait()
      
      // 刷新授权额度
      await fetchAllowance()
      
      return tx
    } catch (err: any) {
      console.error('Approval failed:', err)
      const errorMessage = err.reason || err.message || '授权失败'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, fetchAllowance])

  // 转账
  const transfer = useCallback(async (to: string, amount: bigint) => {
    if (!contract || !account) {
      throw new Error('合约或账户未连接')
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const tx = await contract.transfer(to, amount)
      
      console.log('转账交易已提交:', tx.hash)
      await tx.wait()
      
      // 刷新余额
      await fetchBalance()
      
      return tx
    } catch (err: any) {
      console.error('Transfer failed:', err)
      const errorMessage = err.reason || err.message || '转账失败'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contract, account, fetchBalance])

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
    if (contract) {
      refreshBalance()
    }
  }, [contract, account, chainId, refreshBalance])

  // 监听代币转账事件
  useEffect(() => {
    if (!contract || !account) return

    const transferToFilter = contract.filters.Transfer(null, account)
    const transferFromFilter = contract.filters.Transfer(account, null)
    const approvalFilter = contract.filters.Approval(account, null)

    const handleEvent = () => {
      fetchBalance()
      fetchAllowance()
    }

    contract.on(transferToFilter, handleEvent)
    contract.on(transferFromFilter, handleEvent)
    contract.on(approvalFilter, handleEvent)

    return () => {
      contract.off(transferToFilter, handleEvent)
      contract.off(transferFromFilter, handleEvent)
      contract.off(approvalFilter, handleEvent)
    }
  }, [contract, account, fetchBalance, fetchAllowance])

  return {
    // 数据
    tokenInfo,
    balance,
    allowance,
    isLoading,
    error,
    
    // 方法
    approve,
    transfer,
    refreshBalance,
    
    // 计算属性
    formattedBalance: formatEther(balance),
    formattedAllowance: formatEther(allowance),
  }
}
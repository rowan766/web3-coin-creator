// src/App.tsx - 完整版本
import { ChakraProvider } from '@chakra-ui/react'
import { Web3ReactProvider } from '@web3-react/core'
import { ethers } from 'ethers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Courses } from './pages/Courses'
import { CourseDetail } from './pages/CourseDetail'
import { Dashboard } from './pages/Dashboard'

// 创建 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
})

// Web3 Provider 函数 - 适配 ethers v6
function getLibrary(provider: any) {
  const library = new ethers.BrowserProvider(provider)
  library.pollingInterval = 12000
  return library
}

function App() {
  return (
    <ChakraProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </Layout>
          </Router>
        </QueryClientProvider>
      </Web3ReactProvider>
    </ChakraProvider>
  )
}

export default App
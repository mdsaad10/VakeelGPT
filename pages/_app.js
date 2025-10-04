import '@/styles/globals.css'
import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('vakeelgpt_user')
    const storedToken = localStorage.getItem('vakeelgpt_token')
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('vakeelgpt_user', JSON.stringify(userData))
    localStorage.setItem('vakeelgpt_token', token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vakeelgpt_user')
    localStorage.removeItem('vakeelgpt_token')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <>
      <Head>
        <title>VakeelGPT - Indian Legal AI Assistant</title>
        <meta name="description" content="VakeelGPT helps you understand Indian law, draft documents, and get legal guidance in multiple languages." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Component {...pageProps} userContext={value} />
    </>
  )
}
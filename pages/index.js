import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Home({ userContext }) {
  const { user, login } = userContext
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleQuickLogin = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@vakeelgpt.com',
          name: 'Demo User'
        }),
      })

      const data = await response.json()

      if (data.success) {
        login(data.user, data.token)
        router.push('/chat')
      } else {
        console.error('Login failed:', data.error)
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      router.push('/chat')
    }
  }, [user, router])

  return (
    <>
      <Head>
        <title>VakeelGPT - Your Indian Legal AI Assistant</title>
        <meta name="description" content="Get legal help in simple terms. Draft documents, understand laws, and get guidance in multiple Indian languages." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="relative z-10">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">V</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">VakeelGPT</h1>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                  About
                </Link>
                <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
                <button
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Connecting...' : 'Try Now'}
                </button>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Your{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Indian Legal
                </span>{' '}
                AI Assistant
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Get legal help in simple terms. Draft documents, understand Indian laws, 
                and get guidance in multiple languages - all powered by advanced AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="btn-primary text-lg px-8 py-3 w-full sm:w-auto"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting Demo...
                    </span>
                  ) : (
                    'Start Free Demo'
                  )}
                </button>
                
                <Link href="/documents" className="btn-outline text-lg px-8 py-3 w-full sm:w-auto">
                  Browse Documents
                </Link>
              </div>

              {/* Language Support */}
              <div className="text-center mb-12">
                <p className="text-sm text-gray-500 mb-3">Available in multiple Indian languages:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'hi', name: 'हिंदी' },
                    { code: 'ta', name: 'தமிழ்' },
                    { code: 'te', name: 'తెలుగు' },
                    { code: 'bn', name: 'বাংলা' }
                  ].map((lang) => (
                    <span
                      key={lang.code}
                      className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-200"
                    >
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ask Legal Questions</h3>
              <p className="text-gray-600">
                Get clear answers about Indian laws, procedures, and legal concepts in simple language.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Draft Documents</h3>
              <p className="text-gray-600">
                Create legal documents like rent agreements, NDAs, and contracts with AI assistance.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multilingual Support</h3>
              <p className="text-gray-600">
                Communicate in your preferred Indian language for better understanding.
              </p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-center mb-8">Common Use Cases</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Legal Questions</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• How to register an FIR?</li>
                  <li>• किराया अनुबंध कैसे बनाएं?</li>
                  <li>• Property registration process</li>
                  <li>• Employment law queries</li>
                  <li>• Consumer rights information</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Document Drafting</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Rent agreements</li>
                  <li>• Non-disclosure agreements</li>
                  <li>• Employment contracts</li>
                  <li>• Partnership deeds</li>
                  <li>• Legal notices</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">V</span>
                  </div>
                  <h3 className="text-xl font-bold">VakeelGPT</h3>
                </div>
                <p className="text-gray-400">
                  Making Indian legal assistance accessible through AI.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Legal Q&A</li>
                  <li>Document Drafting</li>
                  <li>Multilingual Support</li>
                  <li>Indian Law Focus</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Help Center</li>
                  <li>Contact Us</li>
                  <li>Legal Disclaimer</li>
                  <li>Privacy Policy</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Powered By</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>DigitalOcean</li>
                  <li>Gradient AI</li>
                  <li>PostgreSQL</li>
                  <li>Next.js</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 VakeelGPT. For educational and informational purposes only. Not a substitute for professional legal advice.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
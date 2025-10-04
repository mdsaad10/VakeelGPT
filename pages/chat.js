import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import MainHeader from '@/components/MainHeader'
import MessageBubble from '@/components/MessageBubble'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Chat({ userContext }) {
  const { user, login, logout } = userContext
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [language, setLanguage] = useState('en')
  const [chatSessions, setChatSessions] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) {
      // Auto-login for demo
      handleAutoLogin()
    } else {
      initializeChat()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAutoLogin = async () => {
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
      }
    } catch (error) {
      console.error('Auto-login error:', error)
    }
  }

  const initializeChat = () => {
    // Load initial greeting
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(language),
        timestamp: new Date().toISOString()
      }
    ])

    loadChatSessions()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getWelcomeMessage = (lang) => {
    const welcomeMessages = {
      en: "Welcome to VakeelGPT! I'm here to help you with Indian legal questions and document drafting. How can I assist you today?",
      hi: "VakeelGPT में आपका स्वागत है! मैं यहां भारतीय कानूनी प्रश्नों और दस्तावेज़ तैयार करने में आपकी सहायता के लिए हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
      ta: "VakeelGPT-ல் உங்களை வரவேற்கிறோம்! இந்திய சட்ட கேள்விகள் மற்றும் ஆவண தயாரிப்பில் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      te: "VakeelGPT కు స్వాగతం! భారతీయ న్యాయ ప్రశ్నలు మరియు పత్రాల తయారీలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
      bn: "VakeelGPT-তে আপনাকে স্বাগতম! আমি এখানে ভারতীয় আইনি প্রশ্ন এবং নথি তৈরিতে আপনাকে সাহায্য করতে এসেছি। আজ আমি কীভাবে আপনাকে সাহায্য করতে পারি?"
    }
    return welcomeMessages[lang] || welcomeMessages.en
  }

  const loadChatSessions = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions/${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setChatSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
    }
  }

  const createNewSession = async () => {
    if (!user) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: 'New Conversation'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setCurrentSessionId(data.sessionId)
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: getWelcomeMessage(language),
            timestamp: new Date().toISOString()
          }
        ])
        loadChatSessions()
      }
    } catch (error) {
      console.error('Error creating new session:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading || !user) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user.id,
          language,
          sessionId: currentSessionId
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        }

        setMessages(prev => [...prev, assistantMessage])
        
        if (!currentSessionId) {
          setCurrentSessionId(data.sessionId)
          loadChatSessions()
        }
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickQuestions = {
    en: [
      "How to register an FIR?",
      "What are tenant rights in India?",
      "How to draft a rent agreement?",
      "Property registration process"
    ],
    hi: [
      "FIR कैसे दर्ज करें?",
      "किराया अनुबंध कैसे बनाएं?",
      "संपत्ति पंजीकरण प्रक्रिया",
      "उपभोक्ता अधिकार क्या हैं?"
    ],
    ta: [
      "FIR எப்படி பதிவு செய்வது?",
      "வாடகை ஒப்பந்தம் எப்படி உருவாக்குவது?",
      "சொத்து பதிவு செயல்முறை",
      "நுகர்வோர் உரிமைகள் என்ன?"
    ]
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your chat...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Chat - VakeelGPT</title>
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <MainHeader user={user} onLogin={login} onLogout={logout} />

        {/* Chat Interface */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col`} style={{ top: '64px' }}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Chat Sessions</h2>
                <button
                  onClick={createNewSession}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="New Chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी</option>
                <option value="ta">🇮🇳 தமிழ்</option>
                <option value="te">🇮🇳 తెలుగు</option>
                <option value="bn">🇮🇳 বাংলা</option>
              </select>
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto p-4">
              {chatSessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No chat sessions yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start chatting to create your first session</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {/* Load session logic */}}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentSessionId === session.id 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'hover:bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm truncate">
                        {session.title || 'Untitled Chat'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-900">VakeelGPT Chat</h1>
                <div className="w-6"></div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  language={language}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-white">
                <p className="text-sm text-gray-600 mb-3">Quick questions to get started:</p>
                <div className="flex flex-wrap gap-2">
                  {(quickQuestions[language] || quickQuestions.en).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-full transition-colors border border-blue-200"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t border-gray-200 p-6 bg-white">
              <form onSubmit={sendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={language === 'hi' ? 'अपना प्रश्न लिखें...' : 
                             language === 'ta' ? 'உங்கள் கேள்வியை எழுதுங்கள்...' :
                             language === 'te' ? 'మీ ప్రశ్నను రాయండి...' :
                             language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' :
                             'Type your legal question...'}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  )
}

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getWelcomeMessage = (lang) => {
    const welcomeMessages = {
      en: "Welcome to VakeelGPT! I'm here to help you with Indian legal questions and document drafting. How can I assist you today?",
      hi: "VakeelGPT में आपका स्वागत है! मैं यहां भारतीय कानूनी प्रश्नों और दस्तावेज़ तैयार करने में आपकी सहायता के लिए हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
      ta: "VakeelGPT-ல் உங்களை வரவேற்கிறோம்! இந்திய சட்ட கேள்விகள் மற்றும் ஆவண தயாரிப்பில் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      te: "VakeelGPT కు స్వాగతం! భారతీయ న్యాయ ప్రశ్నలు మరియు పత్రాల తయారీలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
      bn: "VakeelGPT-তে আপনাকে স্বাগতম! আমি এখানে ভারতীয় আইনি প্রশ্ন এবং নথি তৈরিতে আপনাকে সাহায্য করতে এসেছি। আজ আমি কীভাবে আপনাকে সাহায্য করতে পারি?"
    }
    return welcomeMessages[lang] || welcomeMessages.en
  }

  const loadChatSessions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions/${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setChatSessions(data.sessions)
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: 'New Conversation'
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setCurrentSessionId(data.sessionId)
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: getWelcomeMessage(language),
            timestamp: new Date().toISOString()
          }
        ])
        loadChatSessions()
      }
    } catch (error) {
      console.error('Error creating new session:', error)
    }
  }

  const loadChatSession = async (sessionId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history/${user.id}?sessionId=${sessionId}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedMessages = data.chats.map(chat => [
          {
            id: `user-${chat.id}`,
            role: 'user',
            content: chat.message,
            timestamp: chat.timestamp
          },
          {
            id: `assistant-${chat.id}`,
            role: 'assistant',
            content: chat.response,
            timestamp: chat.timestamp
          }
        ]).flat().reverse()
        
        setMessages(formattedMessages)
        setCurrentSessionId(sessionId)
      }
    } catch (error) {
      console.error('Error loading chat session:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user.id,
          language,
          sessionId: currentSessionId
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        }

        setMessages(prev => [...prev, assistantMessage])
        
        if (!currentSessionId) {
          setCurrentSessionId(data.sessionId)
          loadChatSessions()
        }
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickQuestions = {
    en: [
      "How to register an FIR?",
      "What are tenant rights in India?",
      "How to draft a rent agreement?",
      "Property registration process"
    ],
    hi: [
      "FIR कैसे दर्ज करें?",
      "किराया अनुबंध कैसे बनाएं?",
      "संपत्ति पंजीकरण प्रक्रिया",
      "उपभोक्ता अधिकार क्या हैं?"
    ],
    ta: [
      "FIR எப்படி பதிவு செய்வது?",
      "வாடகை ஒப்பந்தம் எப்படி உருவாக்குவது?",
      "சொத்து பதிவு செயல்முறை",
      "நுகர்வோர் உரிமைகள் என்ன?"
    ]
  }

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Head>
        <title>Chat - VakeelGPT</title>
      </Head>

      <ChatLayout 
        user={user} 
        onLogout={logout}
        onLanguageChange={setLanguage}
        language={language}
        sessions={chatSessions}
        onNewSession={createNewSession}
        onLoadSession={loadChatSession}
        currentSessionId={currentSessionId}
      >
        <div className="flex flex-col h-full">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                language={language}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {(quickQuestions[language] || quickQuestions.en).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={language === 'hi' ? 'अपना प्रश्न लिखें...' : 
                           language === 'ta' ? 'உங்கள் கேள்வியை எழுதுங்கள்...' :
                           language === 'te' ? 'మీ ప్రశ్నను రాయండి...' :
                           language === 'bn' ? 'আপনার প্রশ্ন লিখুন...' :
                           'Type your legal question...'}
                className="input-field flex-1"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </ChatLayout>
    </>
  )

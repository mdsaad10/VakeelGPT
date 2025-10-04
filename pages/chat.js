import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ChatLayout from '@/components/ChatLayout'
import MessageBubble from '@/components/MessageBubble'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Chat({ userContext }) {
  const { user, logout } = userContext
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [language, setLanguage] = useState('en')
  const [chatSessions, setChatSessions] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

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
  }, [user, router, language])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
}
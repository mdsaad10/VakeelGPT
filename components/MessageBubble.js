import { useState } from 'react'

export default function MessageBubble({ message, language }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const formatContent = (content) => {
    // Simple formatting for legal documents
    return content
      .split('\n')
      .map((line, index) => {
        // Handle headers (lines that are all caps or start with numbers)
        if (line.match(/^[A-Z\s\d]+$/) && line.trim().length > 0 && line.trim().length < 50) {
          return <div key={index} className="font-bold mt-3 mb-1">{line}</div>
        }
        
        // Handle numbered sections
        if (line.match(/^\d+\./)) {
          return <div key={index} className="font-medium mt-2 mb-1">{line}</div>
        }
        
        // Handle bullet points
        if (line.match(/^[•\-\*]/)) {
          return <div key={index} className="ml-4">{line}</div>
        }
        
        // Regular paragraphs
        if (line.trim()) {
          return <div key={index} className="mb-2">{line}</div>
        }
        
        return <div key={index} className="h-2"></div>
      })
  }

  const getLanguageClass = () => {
    switch (language) {
      case 'hi': return 'font-hindi'
      case 'ta': return 'font-tamil'
      case 'te': return 'font-telugu'
      case 'bn': return 'font-bengali'
      default: return ''
    }
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${getLanguageClass()} ${
        message.role === 'user' 
          ? 'chat-message-user' 
          : message.isError 
            ? 'bg-red-100 text-red-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-xs mr-auto'
            : 'chat-message-assistant'
      }`}>
        <div className="whitespace-pre-wrap">
          {message.role === 'assistant' && !message.isError ? (
            <div className="prose prose-sm max-w-none">
              {formatContent(message.content)}
            </div>
          ) : (
            message.content
          )}
        </div>
        
        {/* Message Actions */}
        {message.role === 'assistant' && !message.isError && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            
            <button
              onClick={copyToClipboard}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
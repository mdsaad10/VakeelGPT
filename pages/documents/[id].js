import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ChatLayout from '@/components/ChatLayout'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DocumentEditor({ userContext }) {
  const { user, logout } = userContext
  const router = useRouter()
  const { id: documentId } = router.query
  const [document, setDocument] = useState(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [review, setReview] = useState(null)
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    if (documentId) {
      loadDocument()
    }
  }, [user, router, documentId])

  const loadDocument = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}`)
      const data = await response.json()

      if (data.success) {
        setDocument(data.document)
        setContent(data.document.content)
        setTitle(data.document.title)
        setLanguage(data.document.language || 'en')
      } else {
        router.push('/documents')
      }
    } catch (error) {
      console.error('Error loading document:', error)
      router.push('/documents')
    } finally {
      setLoading(false)
    }
  }

  const saveDocument = async () => {
    try {
      setSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          status: 'draft'
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local document state
        setDocument(prev => ({
          ...prev,
          title,
          content,
          updated_at: new Date().toISOString()
        }))
        
        // Show success message briefly
        setSaving('saved')
        setTimeout(() => setSaving(false), 2000)
      }
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document. Please try again.')
    } finally {
      if (saving !== 'saved') {
        setSaving(false)
      }
    }
  }

  const reviewDocument = async () => {
    try {
      setReviewing(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      })

      const data = await response.json()

      if (data.success) {
        setReview(data.review)
      }
    } catch (error) {
      console.error('Error reviewing document:', error)
      alert('Failed to review document. Please try again.')
    } finally {
      setReviewing(false)
    }
  }

  const markAsCompleted = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setDocument(prev => ({
          ...prev,
          status: 'completed'
        }))
      }
    } catch (error) {
      console.error('Error marking document as completed:', error)
      alert('Failed to update document status. Please try again.')
    }
  }

  const downloadDocument = () => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!user) {
    return <LoadingSpinner />
  }

  if (loading) {
    return (
      <ChatLayout user={user} onLogout={logout}>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
      </ChatLayout>
    )
  }

  if (!document) {
    return (
      <ChatLayout user={user} onLogout={logout}>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Document not found</h2>
            <button
              onClick={() => router.push('/documents')}
              className="btn-primary"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </ChatLayout>
    )
  }

  return (
    <>
      <Head>
        <title>{title} - VakeelGPT</title>
      </Head>

      <ChatLayout 
        user={user} 
        onLogout={logout}
        onLanguageChange={setLanguage}
        language={language}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/documents')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    placeholder="Document title..."
                  />
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      document.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.status === 'completed' ? 'Completed' : 'Draft'}
                    </span>
                    <span>{document.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span>•</span>
                    <span>Updated {new Date(document.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={reviewDocument}
                  disabled={reviewing}
                  className="btn-outline text-sm px-3 py-1"
                >
                  {reviewing ? 'Reviewing...' : 'AI Review'}
                </button>
                
                <button
                  onClick={saveDocument}
                  disabled={saving}
                  className={`btn-secondary text-sm px-3 py-1 ${
                    saving === 'saved' ? 'bg-green-100 text-green-800' : ''
                  }`}
                >
                  {saving === 'saved' ? '✓ Saved' : saving ? 'Saving...' : 'Save'}
                </button>
                
                {document.status === 'draft' && (
                  <button
                    onClick={markAsCompleted}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Mark Complete
                  </button>
                )}
                
                <button
                  onClick={downloadDocument}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Editor */}
            <div className="flex-1 p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                placeholder="Start typing your document content..."
              />
            </div>

            {/* Review Panel */}
            {review && (
              <div className="w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">AI Review</h3>
                  <button
                    onClick={() => setReview(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="prose prose-sm">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {review}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ChatLayout>
    </>
  )
}
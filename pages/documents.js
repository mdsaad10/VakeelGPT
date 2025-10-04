import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import MainHeader from '@/components/MainHeader'
import CreateDocumentModal from '@/components/CreateDocumentModal'
import DocumentCard from '@/components/DocumentCard'

export default function Documents({ userContext }) {
  const { user, login, logout } = userContext
  const router = useRouter()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    if (!user) {
      // Auto-login for demo
      handleAutoLogin()
    } else {
      loadDocuments()
    }
  }, [user])

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
      setLoading(false)
    }
  }

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/user/${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const documentTypes = [
    { id: 'all', name: 'All Documents', icon: '📄' },
    { id: 'contract', name: 'Contracts', icon: '📝' },
    { id: 'agreement', name: 'Agreements', icon: '🤝' },
    { id: 'policy', name: 'Policies', icon: '📋' },
    { id: 'notice', name: 'Notices', icon: '📢' },
    { id: 'letter', name: 'Letters', icon: '✉️' },
    { id: 'other', name: 'Other', icon: '📁' }
  ]

  const filteredDocuments = selectedType === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedType)

  if (!user && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Documents - VakeelGPT</title>
        <meta name="description" content="Draft, review, and manage legal documents with AI assistance" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <MainHeader user={user} onLogin={login} onLogout={logout} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Legal Documents</h1>
                <p className="mt-2 text-gray-600">
                  Create, manage, and review legal documents with AI assistance
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Document
                </button>
              </div>
            </div>
          </div>

          {/* Document Type Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {documentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="text-sm font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Create New</h3>
              </div>
              <p className="text-gray-600 mb-4">Draft a new legal document with AI assistance</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-outline w-full"
              >
                Start Creating
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Review Document</h3>
              </div>
              <p className="text-gray-600 mb-4">Upload and review existing documents</p>
              <button className="btn-outline w-full">
                Upload & Review
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
              </div>
              <p className="text-gray-600 mb-4">Browse ready-to-use legal templates</p>
              <button className="btn-outline w-full">
                Browse Templates
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedType === 'all' ? 'All Documents' : `${documentTypes.find(t => t.id === selectedType)?.name}`}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredDocuments.length} documents)
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedType === 'all' 
                    ? "You haven't created any documents yet. Get started by creating your first document."
                    : `No ${documentTypes.find(t => t.id === selectedType)?.name.toLowerCase()} found.`
                  }
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onDownload={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Document Modal */}
        <CreateDocumentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          userId={user?.id}
          onDocumentCreated={(newDoc) => {
            setDocuments(prev => [newDoc, ...prev])
            setShowCreateModal(false)
          }}
        />
      </div>
    </>
  )
}
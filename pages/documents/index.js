import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ChatLayout from '@/components/ChatLayout'
import DocumentCard from '@/components/DocumentCard'
import CreateDocumentModal from '@/components/CreateDocumentModal'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Documents({ userContext }) {
  const { user, logout } = userContext
  const router = useRouter()
  const [documents, setDocuments] = useState([])
  const [documentTypes, setDocumentTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    loadDocuments()
    loadDocumentTypes()
  }, [user, router])

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

  const loadDocumentTypes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/types/available`)
      const data = await response.json()

      if (data.success) {
        setDocumentTypes(data.documentTypes)
      }
    } catch (error) {
      console.error('Error loading document types:', error)
    }
  }

  const handleCreateDocument = async (documentData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...documentData,
          userId: user.id,
          language
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowCreateModal(false)
        loadDocuments()
        
        // Navigate to the document editor
        router.push(`/documents/${data.documentId}`)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error creating document:', error)
      alert('Failed to create document. Please try again.')
    }
  }

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        loadDocuments()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true
    if (filter === 'drafts') return doc.status === 'draft'
    if (filter === 'completed') return doc.status === 'completed'
    return doc.type === filter
  })

  const documentCategories = [
    { id: 'all', name: 'All Documents', count: documents.length },
    { id: 'drafts', name: 'Drafts', count: documents.filter(d => d.status === 'draft').length },
    { id: 'completed', name: 'Completed', count: documents.filter(d => d.status === 'completed').length },
    ...documentTypes.map(type => ({
      id: type.id,
      name: type.name,
      count: documents.filter(d => d.type === type.id).length
    }))
  ]

  if (!user) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Head>
        <title>Documents - VakeelGPT</title>
      </Head>

      <ChatLayout 
        user={user} 
        onLogout={logout}
        onLanguageChange={setLanguage}
        language={language}
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Documents</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary text-sm px-3 py-1"
              >
                + New
              </button>
            </div>

            <div className="space-y-1">
              {documentCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filter === category.id 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {filter === 'all' ? 'All Documents' : 
                 documentCategories.find(c => c.id === filter)?.name || 'Documents'}
              </h1>
              <p className="text-gray-600">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? "You haven't created any documents yet." 
                    : `No documents found in ${documentCategories.find(c => c.id === filter)?.name.toLowerCase()}.`}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onDelete={handleDeleteDocument}
                    onEdit={(id) => router.push(`/documents/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Document Modal */}
        {showCreateModal && (
          <CreateDocumentModal
            documentTypes={documentTypes}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateDocument}
            language={language}
          />
        )}
      </ChatLayout>
    </>
  )
}
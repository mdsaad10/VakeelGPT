import { useRouter } from 'next/router'

export default function DocumentCard({ document, onDelete, onEdit }) {
  const router = useRouter()

  const getDocumentIcon = (type) => {
    const iconMap = {
      rent_agreement: '🏠',
      nda: '🤝',
      employment_contract: '💼',
      loan_agreement: '💰',
      partnership_deed: '🤝',
      sale_deed: '📋',
      power_of_attorney: '⚖️',
      affidavit: '📑',
      will: '📜',
      divorce_petition: '💔'
    }
    return iconMap[type] || '📄'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      <div onClick={() => onEdit(document.id)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getDocumentIcon(document.type)}</span>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {document.title}
              </h3>
              <p className="text-sm text-gray-500">
                {document.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </span>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(document.id)
                }}
                className="text-gray-400 hover:text-red-600 p-1"
                title="Delete document"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3">
            {truncateContent(document.content)}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {formatDate(document.created_at)}</span>
          <span>Modified {formatDate(document.updated_at)}</span>
        </div>
      </div>
    </div>
  )
}
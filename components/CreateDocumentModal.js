import { useState } from 'react'

export default function CreateDocumentModal({ documentTypes, onClose, onCreate, language }) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.type) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await onCreate(formData)
    } catch (error) {
      console.error('Error creating document:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

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

  const getPlaceholderText = () => {
    const placeholders = {
      en: {
        title: 'e.g., Rental Agreement for Mumbai Property',
        description: 'Describe specific requirements for your document...'
      },
      hi: {
        title: 'उदाहरण: मुंबई संपत्ति के लिए किराया समझौता',
        description: 'अपने दस्तावेज़ की विशिष्ट आवश्यकताओं का वर्णन करें...'
      },
      ta: {
        title: 'உதாரணம்: மும்பை சொத்துக்கான வாடகை ஒப்பந்தம்',
        description: 'உங்கள் ஆவணத்தின் குறிப்பிட்ட தேவைகளை விவரிக்கவும்...'
      },
      te: {
        title: 'ఉదాహరణ: ముంబై ఆస్తి కోసం అద్దె ఒప్పందం',
        description: 'మీ పత్రం యొక్క నిర్దిష్ట అవసరాలను వివరించండి...'
      },
      bn: {
        title: 'উদাহরণ: মুম্বাই সম্পত্তির জন্য ভাড়া চুক্তি',
        description: 'আপনার নথির নির্দিষ্ট প্রয়োজনীয়তা বর্ণনা করুন...'
      }
    }
    return placeholders[language] || placeholders.en
  }

  const placeholders = getPlaceholderText()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Document
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Document Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={placeholders.title}
              className="input-field"
              required
            />
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documentTypes.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.type === type.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.id}
                    checked={formData.type === type.id}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-xl mr-3">{getDocumentIcon(type.id)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{type.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{type.category}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Requirements
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={placeholders.description}
              rows={4}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Provide specific details to customize your document
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.title || !formData.type}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Document'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
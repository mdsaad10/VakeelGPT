# VakeelGPT v2.0 🏛️

> Your Indian Legal AI Assistant powered by DigitalOcean's ecosystem

VakeelGPT is a comprehensive legal AI assistant designed specifically for Indian law. It provides legal guidance in simple terms, drafts documents, and supports multiple Indian languages - all powered by DigitalOcean's Gradient AI and infrastructure.

## 🌟 Features

### Core Capabilities
- **💬 Legal Chat Assistant**: Get answers to Indian legal questions in simple language
- **📝 Document Drafting**: AI-powered creation of legal documents (NDAs, rent agreements, contracts, etc.)
- **🌐 Multilingual Support**: Available in English, Hindi, Tamil, Telugu, and Bengali
- **📊 Chat History**: Persistent conversation storage with organized sessions
- **🔍 Document Management**: Create, edit, review, and organize legal documents
- **🤖 AI Review**: Get AI-powered feedback on your drafted documents

### Technical Features
- **⚡ Real-time Chat**: Instant responses using DigitalOcean Gradient AI
- **🔐 User Authentication**: Secure user profiles and data storage
- **📱 Responsive Design**: Mobile-first UI built with TailwindCSS
- **🗄️ PostgreSQL Database**: Managed database on DigitalOcean
- **🚀 Auto-deployment**: Ready for DigitalOcean App Platform

## 🏗️ Architecture

### Backend Stack
- **Node.js + Express**: RESTful API server
- **DigitalOcean Gradient AI**: `deepseek-r1-distill-llama-70b` model
- **PostgreSQL**: Managed database for data persistence
- **JWT Authentication**: Secure user sessions

### Frontend Stack
- **Next.js**: React-based frontend framework
- **TailwindCSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-optimized interface

### Database Schema
```sql
-- Users table
users (id, name, email, language, password_hash, created_at, updated_at)

-- Chat sessions
chat_sessions (id, user_id, title, created_at, updated_at)

-- Chat messages
chats (id, user_id, message, response, language, timestamp, session_id, message_type)

-- Documents
documents (id, user_id, title, type, content, language, status, created_at, updated_at)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (DigitalOcean Managed Database recommended)
- DigitalOcean Gradient AI API key

### 1. Clone and Install
```bash
git clone <repository-url>
cd VakeelGPT-v2
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:

```env
# Database Configuration (DigitalOcean Managed Database)
DATABASE_URL=postgresql://username:password@host:port/vakeelgpt_db
DB_HOST=your-do-db-host
DB_PORT=25060
DB_NAME=vakeelgpt_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# DigitalOcean Gradient AI Configuration
GRADIENT_AI_API_KEY=your-gradient-ai-api-key
GRADIENT_AI_ENDPOINT=https://api.gradient.ai/v1
MODEL_NAME=deepseek-r1-distill-llama-70b

# JWT Secret
JWT_SECRET=your-super-secure-jwt-secret-key

# Server Configuration
PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Setup
```bash
# Initialize database tables
npm run setup-db
```

### 4. Development
```bash
# Start both frontend and backend
npm run dev

# Or run separately:
npm run dev:server  # Backend on port 3001
npm run dev:client  # Frontend on port 3000
```

### 5. Production Build
```bash
npm run build
npm start
```

## 🔧 DigitalOcean Deployment

### App Platform Deployment
1. **Create App**: Connect your GitHub repository to DigitalOcean App Platform
2. **Configure Environment**: Set environment variables in App Platform dashboard
3. **Database**: Create a DigitalOcean Managed PostgreSQL database
4. **Auto-deploy**: Push to main branch for automatic deployment

### Manual Deployment (Droplet)
```bash
# Install dependencies on Ubuntu droplet
sudo apt update
sudo apt install nodejs npm postgresql-client

# Clone and setup
git clone <your-repo>
cd VakeelGPT-v2
npm install
npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start npm --name "vakeelgpt" -- start
pm2 startup
pm2 save
```

## 📋 API Endpoints

### Chat Endpoints
- `POST /api/chat` - Send message to AI
- `GET /api/chat/history/:userId` - Get chat history
- `GET /api/chat/sessions/:userId` - Get chat sessions
- `POST /api/chat/sessions` - Create new session
- `DELETE /api/chat/sessions/:sessionId` - Delete session

### Document Endpoints
- `GET /api/documents/user/:userId` - Get user documents
- `POST /api/documents/draft` - Create new document
- `GET /api/documents/:documentId` - Get specific document
- `PUT /api/documents/:documentId` - Update document
- `POST /api/documents/:documentId/review` - AI review document
- `DELETE /api/documents/:documentId` - Delete document
- `GET /api/documents/types/available` - Get document types

### User Endpoints
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile/:userId` - Update profile
- `GET /api/users/stats/:userId` - Get user statistics

## 🌐 Supported Languages

- **English**: Full feature support
- **हिंदी (Hindi)**: Complete translation and AI responses
- **தமிழ் (Tamil)**: Native language support
- **తెలుగు (Telugu)**: Regional language integration
- **বাংলা (Bengali)**: Comprehensive Bengali support

## 📚 Document Types Supported

### Property Documents
- Rent/Lease Agreements
- Sale Deeds
- Property Transfer Documents

### Business Documents
- Non-Disclosure Agreements (NDAs)
- Partnership Deeds
- Employment Contracts

### Legal Documents
- Power of Attorney
- Affidavits
- Legal Notices
- Wills/Testaments

### Family Law
- Divorce Petitions
- Marriage Certificates
- Adoption Papers

## 🛡️ Security Features

- **JWT Authentication**: Secure user sessions
- **Input Validation**: Sanitized user inputs
- **Environment Variables**: Secure configuration management
- **CORS Protection**: Cross-origin request security
- **SQL Injection Prevention**: Parameterized queries

## 🔍 Usage Examples

### Legal Questions
```
User: "How to register an FIR in India?"
VakeelGPT: Provides step-by-step process with relevant sections of Indian Penal Code
```

### Document Drafting
```
User: Creates rent agreement for Mumbai property
VakeelGPT: Generates complete legal document with Indian law compliance
```

### Multilingual Support
```
User (Hindi): "मुझे किराया अनुबंध बनाना है"
VakeelGPT: Complete response and document generation in Hindi
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 Legal Disclaimer

VakeelGPT provides general legal information for educational purposes only. It is not a substitute for professional legal advice. Always consult with a qualified lawyer for specific legal matters.

## 📞 Support

For issues and questions:
- Create GitHub Issues for bugs
- Check documentation for common problems
- Contact support for DigitalOcean specific issues

## 🎯 Roadmap

- [ ] Voice input/output support
- [ ] Advanced document templates
- [ ] Integration with Indian legal databases
- [ ] Mobile app development
- [ ] Lawyer consultation booking
- [ ] Legal case tracking

## 📊 Performance

- **Response Time**: < 2 seconds average
- **Uptime**: 99.9% availability target
- **Scalability**: Horizontal scaling on DigitalOcean
- **Languages**: 5+ Indian languages supported

---

**Built with ❤️ for the Indian legal community**

Powered by DigitalOcean's ecosystem - Gradient AI, Managed Databases, and App Platform.
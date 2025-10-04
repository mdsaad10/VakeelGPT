# Contributing to VakeelGPT

Thank you for your interest in contributing to VakeelGPT! We welcome contributions from the community to help improve our Indian Legal AI Assistant.

## 🚀 Quick Start

1. **Fork the repository**
   ```bash
   git clone https://github.com/mdsaad10/VakeelGPT.git
   cd VakeelGPT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   - Copy `.env.example` to `.env`
   - Add your DigitalOcean credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- DigitalOcean account (for AI services)
- PostgreSQL (optional - has mock mode)

### Environment Variables
Create a `.env` file with:
```
GRADIENT_AI_API_KEY=your_gradient_token
GRADIENT_AI_ENDPOINT=your_gradient_endpoint
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
```

### Project Structure
```
VakeelGPT-v2/
├── components/          # React components
├── pages/              # Next.js pages
├── server/             # Express.js backend
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── scripts/        # Database setup
├── styles/             # CSS/Tailwind styles
└── utils/              # Utility functions
```

## 📝 Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Coding Standards
- Use functional components with hooks
- Follow JavaScript ES6+ standards
- Use meaningful variable and function names
- Write clear comments for complex logic
- Follow existing file and folder structure

## 🐛 Bug Reports

When filing bug reports, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, Node.js version, browser
6. **Screenshots**: If applicable

### Bug Report Template
```markdown
**Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
Add screenshots if applicable.

**Environment:**
- OS: [e.g. Windows 11]
- Node.js: [e.g. 18.17.0]
- Browser: [e.g. Chrome 118]
```

## ✨ Feature Requests

We welcome feature requests! Please include:

1. **Use Case**: Why this feature would be useful
2. **Description**: Detailed description of the feature
3. **Examples**: Examples of how it would work
4. **Implementation Ideas**: If you have technical suggestions

## 🔀 Pull Requests

### Before Submitting
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Update documentation if needed
6. Commit with clear messages

### PR Guidelines
- **Title**: Clear, descriptive title
- **Description**: Explain what changes you made and why
- **Testing**: Describe how you tested the changes
- **Breaking Changes**: Note any breaking changes
- **Screenshots**: Include before/after screenshots for UI changes

### PR Template
```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## 📋 Development Process

### Workflow
1. **Issue First**: Create or find an issue to work on
2. **Branch**: Create a feature branch
3. **Develop**: Make your changes
4. **Test**: Ensure everything works
5. **Submit**: Create a pull request
6. **Review**: Address feedback
7. **Merge**: Celebrate! 🎉

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(chat): add multilingual support
fix(auth): resolve login timeout issue
docs(readme): update installation steps
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🏗️ Architecture

### Frontend (Next.js)
- **Pages**: Route components in `/pages`
- **Components**: Reusable UI components in `/components`
- **Styles**: Tailwind CSS for styling
- **State**: React hooks for state management

### Backend (Express.js)
- **Routes**: API endpoints in `/server/routes`
- **Services**: Business logic in `/server/services`
- **Database**: PostgreSQL with mock mode fallback
- **AI**: DigitalOcean Gradient AI integration

## 🌍 Internationalization

We support multiple Indian languages:
- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Bengali (bn)

When adding new features:
1. Add English text first
2. Add translation keys to language files
3. Test with different languages
4. Consider right-to-left languages

## 🔒 Security

- Never commit API keys or secrets
- Use environment variables for configuration
- Sanitize user inputs
- Follow OWASP security guidelines
- Report security issues privately

## 📞 Community

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and community chat
- **Email**: contact@vakeelgpt.com

## 🎉 Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Invited to our contributor Discord

## 📜 Legal

By contributing, you agree that:
- Your contributions will be licensed under MIT License
- You have the right to contribute the code
- You grant us rights to use your contributions

---

Thank you for helping make VakeelGPT better! 🙏

For questions, reach out via GitHub issues or email us at contribute@vakeelgpt.com.
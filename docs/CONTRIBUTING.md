
# Contributing to PromptVault

Thank you for your interest in contributing to PromptVault! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Types of Contributions
- 🐛 **Bug Reports**: Report issues you've encountered
- ✨ **Feature Requests**: Suggest new features or improvements
- 📝 **Documentation**: Improve documentation and guides
- 🔧 **Code Contributions**: Fix bugs or implement new features
- 🎨 **UI/UX Improvements**: Enhance user interface and experience
- 🧪 **Testing**: Add or improve tests

## 🚀 Getting Started

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/promptvault.git
cd promptvault
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### 3. Create a Branch
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b bugfix/issue-description
```

## 📋 Development Guidelines

### Code Style
We use ESLint and Prettier for code formatting:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### TypeScript Standards
- Use strict TypeScript configuration
- Define interfaces for all props and data structures
- Avoid `any` types - use proper typing
- Use type guards for runtime type checking

```typescript
// Good
interface PromptData {
  id: string;
  title: string;
  content: string;
}

// Bad
const promptData: any = { ... };
```

### Component Guidelines
- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing
- Implement error boundaries where appropriate

```typescript
// Component example
interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onEdit,
  onDelete
}) => {
  // Component logic
};
```

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── PromptCard.tsx  # Feature-specific components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── __tests__/          # Test files
```

## 🧪 Testing

### Writing Tests
- Write unit tests for utilities and hooks
- Write integration tests for components
- Write E2E tests for critical user flows

```typescript
// Unit test example
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-01');
    expect(formatDate(date)).toBe('Jan 1, 2024');
  });
});
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🗄️ Database Changes

### Schema Migrations
For database schema changes:

1. Create SQL migration files
2. Test migrations on a copy of production data
3. Document the changes in the PR

```sql
-- Example migration
-- Add new column to prompts table
ALTER TABLE public.prompts 
ADD COLUMN difficulty_level TEXT DEFAULT 'intermediate';

-- Create index for new column
CREATE INDEX idx_prompts_difficulty_level 
ON public.prompts(difficulty_level);
```

### RLS Policies
When adding new tables or modifying access patterns:

```sql
-- Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON public.new_table
  FOR SELECT USING (auth.uid() = user_id);
```

## 📝 Commit Guidelines

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(auth): add Google OAuth integration
fix(prompts): resolve search pagination issue
docs(api): update authentication documentation
test(components): add tests for PromptCard component
```

## 🔄 Pull Request Process

### Before Submitting
1. **Update your branch**: Rebase on the latest main branch
2. **Run tests**: Ensure all tests pass
3. **Check linting**: Fix any linting issues
4. **Update documentation**: Update relevant documentation

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process
1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Reviewer tests the changes locally
4. **Approval**: PR approved and merged by maintainer

## 🐛 Bug Reports

### Bug Report Template
When reporting bugs, please include:

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 1.0.0]

**Screenshots**
If applicable, add screenshots

**Additional Context**
Any other relevant information
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this work?

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Mockups, examples, or related issues
```

## 📚 Documentation

### Documentation Guidelines
- Write clear, concise documentation
- Include code examples where helpful
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

### Documentation Structure
- **README.md**: Project overview and quick start
- **docs/**: Detailed documentation
- **API.md**: API reference
- **USER_GUIDE.md**: User-facing documentation
- **TECHNICAL.md**: Technical implementation details

## 🏆 Recognition

### Contributors
We recognize contributors in:
- **README.md**: Contributor list
- **CHANGELOG.md**: Release notes
- **Discord**: Contributor role and recognition
- **GitHub**: Contributor badge

### Maintainer Path
Active contributors may be invited to become maintainers:
- Consistent, quality contributions
- Helpful in code reviews
- Active in community discussions
- Demonstrates good judgment

## 💬 Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussions
- **Discord**: Real-time chat and support
- **Email**: security@promptvault.com for security issues

### Code of Conduct
We are committed to providing a welcoming and inclusive environment:

- **Be respectful**: Treat everyone with respect
- **Be constructive**: Provide helpful feedback
- **Be collaborative**: Work together towards common goals
- **Be patient**: Help newcomers learn and grow

## 📊 Project Roadmap

### Current Priorities
1. **Phase 6**: Analytics & Performance Dashboard
2. **Phase 7**: Enterprise & Security Features
3. **Phase 8**: Advanced Template System
4. **Mobile Optimization**: PWA features
5. **Performance**: Optimization and scaling

### How to Align Contributions
- Check the current roadmap and priorities
- Discuss major features before implementation
- Look for issues labeled `good first issue` or `help wanted`
- Ask maintainers about feature alignment

## 🔒 Security

### Reporting Security Issues
**Do not report security vulnerabilities through public GitHub issues.**

Instead, email us at: security@promptvault.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

### Security Review Process
- We aim to respond within 48 hours
- We'll work with you to understand and fix the issue
- We'll coordinate disclosure timing
- We'll credit you for the discovery (if desired)

## 🎓 Learning Resources

### Technologies Used
- **React**: [React Documentation](https://react.dev/)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Tailwind CSS**: [Tailwind Documentation](https://tailwindcss.com/docs)

### Helpful Guides
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Git Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## ❓ FAQ

**Q: How do I get my development environment set up?**
A: Follow the [Installation Guide](./INSTALLATION.md) for detailed setup instructions.

**Q: What should I work on as a first contribution?**
A: Look for issues labeled `good first issue` or `help wanted`. These are specifically chosen for newcomers.

**Q: How do I propose a major feature?**
A: Open a GitHub Discussion or issue to discuss the feature before implementation.

**Q: Can I contribute if I'm new to React/TypeScript?**
A: Absolutely! We welcome contributors of all skill levels. Start with documentation or small bug fixes.

**Q: How long does it take for PRs to be reviewed?**
A: We aim to review PRs within 2-3 business days, though complex changes may take longer.

---

Thank you for contributing to PromptVault! Your help makes this project better for everyone. 🚀

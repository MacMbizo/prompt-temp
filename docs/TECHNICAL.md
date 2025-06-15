# PromptVault Technical Documentation

## 🏗️ Architecture Overview

PromptVault is built as a modern Single Page Application (SPA) with a serverless backend architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Supabase API  │    │  PostgreSQL DB  │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ Supabase Auth   │              │
         └──────────────►│  (Identity)     │──────────────┘
                        └─────────────────┘
```

## 💻 Frontend Architecture

### Technology Stack
- **React 18**: Component-based UI library with concurrent features
- **TypeScript**: Static type checking for enhanced developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library with consistent design

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── Header.tsx       # Application header
│   ├── PromptCard.tsx   # Individual prompt display
│   └── ...
├── contexts/            # React contexts for state management
│   └── AuthContext.tsx  # Authentication state
├── hooks/               # Custom React hooks
│   ├── usePrompts.ts    # Prompt management hook
│   ├── useAuth.ts       # Authentication hook
│   └── ...
├── pages/               # Page components
│   ├── Index.tsx        # Main dashboard
│   ├── Automation.tsx   # AI automation hub
│   └── ...
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
└── lib/                 # Utility functions and constants
```

### Component Architecture
- **Atomic Design**: Components built using atomic design principles
- **Composition Pattern**: Components composed of smaller, reusable parts
- **Prop Drilling Avoidance**: Context and custom hooks for state management
- **TypeScript Interfaces**: Strict typing for all component props

### State Management
- **React Context**: Authentication and global state
- **Custom Hooks**: Encapsulated business logic
- **React Query**: Server state management and caching
- **Local State**: Component-specific state with useState/useReducer

## 🔗 Backend Architecture

### Supabase Services
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: JWT-based auth with multiple providers
- **Storage**: File upload and management
- **Edge Functions**: Serverless functions for custom logic
- **Real-time**: WebSocket connections for live updates

### Database Design

#### Core Tables
```sql
-- Users and profiles
profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP
);

-- Main prompts table
prompts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  platforms TEXT[],
  variables JSONB,
  is_template BOOLEAN DEFAULT FALSE,
  folder_id UUID REFERENCES folders(id),
  is_community BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  usage_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  average_rating DECIMAL,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Folder organization
folders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id),
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community ratings
prompt_ratings (
  id UUID PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id),
  user_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
prompt_copies (
  id UUID PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id),
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Indexes and Performance
```sql
-- Performance indexes
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_updated_at ON prompts(updated_at);
CREATE INDEX idx_prompts_is_community ON prompts(is_community);
CREATE INDEX idx_prompts_search ON prompts USING GIN(to_tsvector('english', title || ' ' || description || ' ' || content));
```

### Row Level Security (RLS)
```sql
-- Users can only see their own prompts and public community prompts
CREATE POLICY "Users can view own and community prompts" ON prompts
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (is_community = true AND status = 'active')
  );

-- Users can only create prompts for themselves
CREATE POLICY "Users can create own prompts" ON prompts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only update their own prompts
CREATE POLICY "Users can update own prompts" ON prompts
  FOR UPDATE USING (user_id = auth.uid());
```

## 🔐 Security Implementation

### Authentication Flow
1. **Email/Password**: Standard email verification flow
2. **JWT Tokens**: Secure token-based authentication
3. **Session Management**: Automatic token refresh
4. **Password Security**: Encrypted storage with Supabase Auth

### Authorization Patterns
- **Row Level Security**: Database-level access control
- **API Authorization**: Middleware for route protection
- **Client-Side Guards**: Protected routes and components
- **Role-Based Access**: Future implementation for team features

### Data Protection
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via Supabase
- **XSS Protection**: Content sanitization and CSP headers
- **CSRF Protection**: Token-based request validation

## 📊 Performance Optimization

### Frontend Performance
- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Tree shaking and minification
- **Asset Optimization**: Image compression and lazy loading
- **Caching Strategy**: Service worker for offline functionality

### Database Performance
- **Query Optimization**: Efficient SQL queries with proper indexes
- **Connection Pooling**: Supabase handles connection management
- **Real-time Optimization**: Selective subscriptions to reduce load
- **Caching Layer**: React Query for client-side caching

### API Performance
- **Rate Limiting**: Protection against abuse
- **Response Compression**: Gzip compression for responses
- **CDN Distribution**: Global content delivery
- **Monitoring**: Performance tracking and alerting

## 🧪 Testing Strategy

### Unit Testing
```typescript
// Example test with Jest and React Testing Library
import { render, screen } from '@testing-library/react';
import { PromptCard } from '@/components/PromptCard';

test('renders prompt card with title', () => {
  const mockPrompt = {
    id: '1',
    title: 'Test Prompt',
    description: 'Test description',
    // ... other props
  };
  
  render(<PromptCard prompt={mockPrompt} />);
  expect(screen.getByText('Test Prompt')).toBeInTheDocument();
});
```

### Integration Testing
- **API Testing**: Supabase client integration tests
- **Database Testing**: Schema and RLS policy tests
- **Authentication Testing**: Auth flow validation
- **Component Integration**: Multi-component interaction tests

### End-to-End Testing
```typescript
// Example Playwright test
import { test, expect } from '@playwright/test';

test('user can create a prompt', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="add-prompt"]');
  await page.fill('[data-testid="prompt-title"]', 'New Test Prompt');
  await page.fill('[data-testid="prompt-content"]', 'This is a test prompt');
  await page.click('[data-testid="save-prompt"]');
  
  await expect(page.locator('text=New Test Prompt')).toBeVisible();
});
```

## 🚀 Deployment & DevOps

### Build Process
```yaml
# GitHub Actions workflow
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

### Environment Configuration
```typescript
// Environment variables
interface Config {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  APP_ENV: 'development' | 'staging' | 'production';
}

export const config: Config = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
};
```

### Monitoring & Observability
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: Web Vitals and custom metrics
- **Analytics**: User behavior tracking
- **Logging**: Structured logging for debugging

## 🔧 Development Workflow

### Code Quality
```json
// ESLint configuration
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Git Workflow
1. **Feature Branches**: All features developed in separate branches
2. **Pull Requests**: Code review required before merging
3. **Conventional Commits**: Standardized commit messages
4. **Semantic Versioning**: Automated version management

### Development Environment Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📈 Scalability Considerations

### Database Scaling
- **Read Replicas**: For handling increased read load
- **Partitioning**: Table partitioning for large datasets
- **Archiving**: Moving old data to separate storage
- **Indexing Strategy**: Optimized indexes for query patterns

### Application Scaling
- **CDN Distribution**: Global content delivery
- **Horizontal Scaling**: Multiple application instances
- **Caching Layers**: Redis for session and data caching
- **Load Balancing**: Request distribution across instances

### Performance Monitoring
```typescript
// Performance tracking
export const trackPerformance = (metricName: string, value: number) => {
  if ('performance' in window) {
    performance.mark(`${metricName}-${value}`);
  }
  
  // Send to analytics service
  analytics.track('Performance Metric', {
    metric: metricName,
    value,
    timestamp: Date.now()
  });
};
```

## 🔄 API Rate Limiting

### Implementation
```sql
-- Rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  user_id UUID,
  action_type TEXT,
  limit_count INTEGER,
  window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM rate_limits
  WHERE user_id = $1
    AND action_type = $2
    AND created_at > NOW() - INTERVAL '1 second' * window_seconds;
  
  RETURN current_count < limit_count;
END;
$$ LANGUAGE plpgsql;
```

### Rate Limit Tiers
- **Anonymous Users**: 100 requests/hour
- **Authenticated Users**: 1000 requests/hour
- **Premium Users**: 5000 requests/hour
- **API Access**: Custom limits based on plan

## 🔍 Search Implementation

### Full-Text Search
```sql
-- Full-text search function
CREATE OR REPLACE FUNCTION search_prompts(
  search_query TEXT,
  user_id UUID
) RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  content TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.content,
    ts_rank(
      to_tsvector('english', p.title || ' ' || p.description || ' ' || p.content),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM prompts p
  WHERE (
    p.user_id = search_prompts.user_id OR 
    (p.is_community = true AND p.status = 'active')
  )
  AND to_tsvector('english', p.title || ' ' || p.description || ' ' || p.content) 
      @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

### Search Features
- **Fuzzy Matching**: Typo-tolerant search
- **Semantic Search**: AI-powered semantic understanding
- **Faceted Search**: Category and tag filtering
- **Search Analytics**: Track popular search terms

## 🔧 Maintenance & Support

### Database Maintenance
```sql
-- Periodic cleanup of old data
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS VOID AS $$
BEGIN
  -- Archive old deleted prompts
  INSERT INTO prompts_archive 
  SELECT * FROM prompts 
  WHERE status = 'deleted' AND updated_at < NOW() - INTERVAL '30 days';
  
  -- Remove archived prompts from main table
  DELETE FROM prompts 
  WHERE status = 'deleted' AND updated_at < NOW() - INTERVAL '30 days';
  
  -- Update usage statistics
  REFRESH MATERIALIZED VIEW prompt_usage_stats;
END;
$$ LANGUAGE plpgsql;
```

### Backup Strategy
- **Automated Backups**: Daily full database backups
- **Point-in-Time Recovery**: Transaction log backups
- **Cross-Region Replication**: Disaster recovery setup
- **Backup Testing**: Regular restore testing

### Support Tools
- **Admin Dashboard**: Internal tools for support team
- **User Analytics**: Usage patterns and behavior analysis
- **Error Reporting**: Automated error alerts and tracking
- **Performance Monitoring**: Real-time system health monitoring

---

This technical documentation provides a comprehensive overview of PromptVault's architecture, implementation details, and operational considerations.

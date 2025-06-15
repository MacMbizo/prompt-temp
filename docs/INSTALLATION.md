
# PromptVault Installation Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase account** (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/promptvault.git
cd promptvault
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Setup

### Supabase Project Creation
1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Fill in project details and wait for setup completion
5. Go to Settings > API to get your project URL and anon key

### Database Schema Setup
Run the following SQL commands in the Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create folders table
CREATE TABLE public.folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id),
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create prompts table
CREATE TABLE public.prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  variables JSONB DEFAULT '[]',
  is_template BOOLEAN DEFAULT FALSE,
  folder_id UUID REFERENCES public.folders(id),
  is_community BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  usage_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  average_rating DECIMAL,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create prompt_ratings table
CREATE TABLE public.prompt_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(prompt_id, user_id)
);

-- Create prompt_copies table
CREATE TABLE public.prompt_copies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### Database Functions
```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating updated_at on prompts
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
```

### Row Level Security Policies
```sql
-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Folders policies
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own folders" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own folders" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- Prompts policies
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own and community prompts" ON public.prompts
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_community = true AND status = 'active')
  );

CREATE POLICY "Users can create own prompts" ON public.prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON public.prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON public.prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Ratings policies
ALTER TABLE public.prompt_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings" ON public.prompt_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings" ON public.prompt_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.prompt_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON public.prompt_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Copies policies
ALTER TABLE public.prompt_copies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own copies" ON public.prompt_copies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create copies" ON public.prompt_copies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX idx_prompts_category ON public.prompts(category);
CREATE INDEX idx_prompts_status ON public.prompts(status);
CREATE INDEX idx_prompts_updated_at ON public.prompts(updated_at DESC);
CREATE INDEX idx_prompts_is_community ON public.prompts(is_community) WHERE is_community = true;
CREATE INDEX idx_prompts_search ON public.prompts USING GIN(to_tsvector('english', title || ' ' || description || ' ' || content));
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_prompt_ratings_prompt_id ON public.prompt_ratings(prompt_id);
CREATE INDEX idx_prompt_copies_prompt_id ON public.prompt_copies(prompt_id);
```

## 🔐 Authentication Setup

### Supabase Auth Configuration
1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the following settings:

#### Site URL
```
http://localhost:5173
```

#### Redirect URLs
```
http://localhost:5173/**
```

#### Email Templates (Optional)
Customize the email templates for:
- Confirmation emails
- Password reset emails
- Email change confirmations

### Authentication Providers
Enable the providers you want to support:
- Email/Password (enabled by default)
- Google OAuth
- GitHub OAuth
- Discord OAuth

## 🎨 UI Configuration

### Tailwind CSS Setup
The project comes pre-configured with Tailwind CSS. The configuration is in `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### shadcn/ui Components
All UI components are pre-installed. To add new components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

## 📝 Development Configuration

### TypeScript Configuration
The project uses strict TypeScript configuration in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🧪 Testing Setup

### Test Configuration
Install testing dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### Vitest Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File (`src/test/setup.ts`)
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}))
```

### Sample Test
```typescript
// src/components/__tests__/PromptCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PromptCard } from '@/components/PromptCard'

const mockPrompt = {
  id: '1',
  title: 'Test Prompt',
  description: 'Test description',
  content: 'Test content',
  category: 'Test',
  tags: ['test'],
  platforms: ['ChatGPT'],
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  user_id: '1',
  variables: [],
  is_template: false,
  folder_id: null,
  is_community: false,
  copy_count: 0,
  average_rating: null,
  rating_count: 0,
  is_featured: false,
  status: 'active',
  usage_count: 0
}

test('renders prompt card', () => {
  render(<PromptCard prompt={mockPrompt} />)
  expect(screen.getByText('Test Prompt')).toBeInTheDocument()
})
```

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options

#### Vercel Deployment
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel --prod`
3. Set environment variables in Vercel dashboard

#### Netlify Deployment
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables in Netlify dashboard

#### Custom Server Deployment
```bash
# Build the application
npm run build

# Serve with a static file server
npm install -g serve
serve -s dist -l 3000
```

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🔧 Troubleshooting

### Common Issues

#### Supabase Connection Issues
- Verify your Supabase URL and anon key
- Check if RLS policies are correctly set up
- Ensure your domain is added to Supabase Auth settings

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npx vite --force
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript dependencies
npm update @types/react @types/react-dom typescript
```

### Development Tips
- Use `npm run dev` for development with hot reload
- Use browser dev tools for debugging
- Check Supabase logs for database issues
- Use React Developer Tools for component debugging

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## 🆘 Getting Help

If you encounter issues during installation:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our Discord community for real-time help

---

**Congratulations!** You now have PromptVault running locally. Check out the [User Guide](./USER_GUIDE.md) to learn how to use all the features.

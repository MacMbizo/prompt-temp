import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock AuthContext to ensure AuthContext.Provider is defined
vi.mock('@/contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AuthContext: {
      Provider: ({ children, value }) => {
        // Provide a default value for AuthContextType to prevent useAuth from throwing
        const defaultValue = value || {
          session: null,
          user: null,
          signIn: vi.fn(),
          signOut: vi.fn(),
          signUp: vi.fn(),
          loading: false
        };
        // Use React context API to provide the value
        return (
          <actual.AuthContext.Provider value={defaultValue}>
            {children}
          </actual.AuthContext.Provider>
        );
      },
    },
  };
});

import { AuthContext } from '@/contexts/AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PromptCard } from '../PromptCard';
import { usePromptCopy } from '@/hooks/usePromptCopy';
import { Prompt } from '@/integrations/supabase/types';

// Mock dependencies
vi.mock('@/hooks/usePromptCopy', () => ({
  usePromptCopy: vi.fn(() => ({
    selectedPlatform: 'ChatGPT',
    setSelectedPlatform: vi.fn(),
    handleCopy: vi.fn()
  })),
  AVAILABLE_PLATFORMS: [
    'ChatGPT',
    'Claude',
    'Gemini',
    'GPT-4',
    'Midjourney',
    'DALL-E',
    'Stable Diffusion',
    'Perplexity',
    'GitHub Copilot',
    'Notion AI'
  ]
}));

// Mock other hooks and components
vi.mock('@/components/PromptCardDropdown', () => ({
  PromptCardDropdown: () => <div data-testid="prompt-card-dropdown">Dropdown</div>
}));

vi.mock('@/components/PromptCardBadges', () => ({
  PromptCardBadges: () => <div data-testid="prompt-card-badges">Badges</div>
}));

vi.mock('@/components/PromptCardHeader', () => ({
  PromptCardHeader: () => <div data-testid="prompt-card-header">Header</div>
}));

vi.mock('@/components/RatingComponent', () => ({
  RatingComponent: () => <div data-testid="rating-component">Rating</div>
}));

vi.mock('@/components/TemplateVariableFiller', () => ({
  TemplateVariableFiller: ({ onCopy }: { onCopy: () => void }) => (
    <div data-testid="template-variable-filler" onClick={onCopy}>Template Filler</div>
  )
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('PromptCard', () => {
  const mockPrompt: Prompt = {
    id: 'test-prompt-id',
    title: 'Test Prompt',
    description: 'Test description',
    prompt_text: 'Test content',
    category: 'Test',
    tags: ['test'],
    platforms: ['ChatGPT'],
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    user_id: 'test-user-id',
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
  };

  let mockHandleCopy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleCopy = vi.fn();
    (usePromptCopy as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      selectedPlatform: 'ChatGPT',
      setSelectedPlatform: vi.fn(),
      handleCopy: mockHandleCopy
    });
  });

  it('renders the prompt card with correct information', () => {
    render(
      <AuthContext.Provider value={{ session: null, user: null, signIn: vi.fn(), signOut: vi.fn(), signUp: vi.fn() }}>
        <PromptCard prompt={mockPrompt} />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-card-header')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-card-badges')).toBeInTheDocument();
    expect(screen.getByTestId('rating-component')).toBeInTheDocument();
  });

  it('calls handleCopy when copy button is clicked', async () => {
    render(
      <AuthContext.Provider value={{ session: null, user: null, signIn: vi.fn(), signOut: vi.fn(), signUp: vi.fn() }}>
        <PromptCard prompt={mockPrompt} />
      </AuthContext.Provider>
    );
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(mockHandleCopy).toHaveBeenCalledWith(
        mockPrompt,
        mockPrompt.prompt_text,
        expect.any(Function)
      );
    });
  });

  it('renders template variable filler for prompts with variables', () => {
    const promptWithVariables = {
      ...mockPrompt,
      is_template: true,
      variables: [
        { name: 'variable1', description: 'Test variable', type: 'text' as const }
      ]
    };
    
    render(
      <AuthContext.Provider value={{ session: null, user: null, signIn: vi.fn(), signOut: vi.fn(), signUp: vi.fn() }}>
        <PromptCard prompt={promptWithVariables} />
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('template-variable-filler')).toBeInTheDocument();
  });

  it('calls handleCopy when template variable filler triggers onCopy', async () => {
    const promptWithVariables = {
      ...mockPrompt,
      is_template: true,
      variables: [
        { name: 'variable1', description: 'Test variable', type: 'text' as const }
      ]
    };
    
    render(
      <AuthContext.Provider value={{ session: null, user: null, signIn: vi.fn(), signOut: vi.fn(), signUp: vi.fn() }}>
        <PromptCard prompt={promptWithVariables} />
      </AuthContext.Provider>
    );
    
    const templateFiller = screen.getByTestId('template-variable-filler');
    fireEvent.click(templateFiller);
    
    await waitFor(() => {
      expect(mockHandleCopy).toHaveBeenCalled();
    });
  });

  it('displays platform selection dropdown', () => {
    render(
      <AuthContext.Provider value={{ session: null, user: null, signIn: vi.fn(), signOut: vi.fn(), signUp: vi.fn() }}>
        <PromptCard prompt={mockPrompt} />
      </AuthContext.Provider>
    );
    const platformSelect = screen.getByLabelText('Platform');
    expect(platformSelect).toBeInTheDocument();
  });

  it('shows usage statistics', () => {
    const promptWithStats = {
      ...mockPrompt,
      copy_count: 10,
      usage_count: 5
    };
    
    render(
      <AuthContext.Provider value={{ session: null, user: null, signIn: vi.fn(), signOut: vi.fn(), signUp: vi.fn() }}>
        <PromptCard prompt={promptWithStats} />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('10')).toBeInTheDocument(); // Copy count
    expect(screen.getByText('5')).toBeInTheDocument(); // Usage count
  });
});
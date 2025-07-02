import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usePromptCopy } from '../usePromptCopy';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useReputation } from '@/hooks/useReputation';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

const mockUpdateReputation = vi.fn(() => Promise.resolve());
vi.mock('@/hooks/useReputation', () => ({
  useReputation: vi.fn(() => ({
    updateReputation: mockUpdateReputation
  }))
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(() => Promise.resolve())
  }
});

describe('usePromptCopy', () => {
  const mockPrompt = {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty selectedPlatform', () => {
    const { result } = renderHook(() => usePromptCopy());
    
    expect(result.current.selectedPlatform).toBe('');
  });

  it('should update selectedPlatform when setSelectedPlatform is called', () => {
    const { result } = renderHook(() => usePromptCopy());
    
    act(() => {
      result.current.setSelectedPlatform('ChatGPT');
    });
    
    expect(result.current.selectedPlatform).toBe('ChatGPT');
  });

  it('should copy text to clipboard and update copy history when handleCopy is called', async () => {
    const { result } = renderHook(() => usePromptCopy());
    // Use the globally mocked updateReputation
    // const updateReputationMock = useReputation().updateReputation; // No longer needed as we use the global mock directly
    const mockContent = 'Test content to copy';
    const mockOnCopySuccess = vi.fn();
    
    act(() => {
      result.current.setSelectedPlatform('ChatGPT');
    });
    
    await act(async () => {
      await result.current.handleCopy(mockPrompt, mockContent, mockOnCopySuccess);
    });
    
    // Verify clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockContent);
    
    // Verify Supabase insert was called
    expect(supabase.from).toHaveBeenCalledWith('copy_history');
    expect(supabase.from().insert).toHaveBeenCalledWith({
      user_id: 'test-user-id',
      prompt_id: 'test-prompt-id',
      platform_used: 'ChatGPT'
    });
    
    // Verify reputation update was called
    expect(mockUpdateReputation).toHaveBeenCalledWith(1, 'Used a prompt');
    
    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Prompt copied to clipboard!');
    
    // Verify onCopySuccess callback was called
    expect(mockOnCopySuccess).toHaveBeenCalled();
  });

  it('should show error toast when clipboard copy fails', async () => {
    const { result } = renderHook(() => usePromptCopy());
    const mockContent = 'Test content to copy';
    
    // Mock clipboard API to throw an error
    navigator.clipboard.writeText = vi.fn(() => Promise.reject(new Error('Clipboard error')));
    
    await act(async () => {
      await result.current.handleCopy(mockPrompt, mockContent);
    });
    
    // Verify error toast was shown
    expect(toast.error).toHaveBeenCalledWith('Failed to copy prompt');
  });

  it('should not update copy history if user is not logged in', async () => {
    // Mock useAuth to return null user
    useAuth.mockReturnValueOnce({ user: null });
    
    const { result } = renderHook(() => usePromptCopy());
    const mockContent = 'Test content to copy';
    
    await act(async () => {
      await result.current.handleCopy(mockPrompt, mockContent);
    });
    
    // Verify clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockContent);
    
    // Verify Supabase insert was NOT called
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should not update copy history if no platform is selected', async () => {
    const { result } = renderHook(() => usePromptCopy());
    const mockContent = 'Test content to copy';
    
    // Don't set a platform
    
    await act(async () => {
      await result.current.handleCopy(mockPrompt, mockContent);
    });
    
    // Verify clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockContent);
    
    // Verify Supabase insert was NOT called
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
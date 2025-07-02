import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateVariableFiller } from '../TemplateVariableFiller';
import { PromptVariable } from '@/integrations/supabase/types';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TemplateVariableFiller', () => {
  const mockPrompt = {
    prompt_text: 'This is a test prompt with {variable1} and {variable2}.',
    title: 'Test Prompt',
    variables: [
      { name: 'variable1', type: 'text', description: 'First variable' },
      { name: 'variable2', type: 'text', description: 'Second variable' },
    ],
  };

  const onCloseMock = vi.fn();
  const onCopyMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCloseMock}
        promptText={mockPrompt.prompt_text}
        variables={mockPrompt.variables}
        onCopy={onCopyMock}
      />
    );
    expect(screen.getByText('Fill Template Variables')).toBeInTheDocument();
    expect(screen.getByText('Template Variable Filler')).toBeInTheDocument();
  });

  it('updates the preview when variables are filled', async () => {
    render(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCloseMock}
        promptText={mockPrompt.prompt_text}
        variables={mockPrompt.variables}
        onCopy={onCopyMock}
      />
    );

    const variable1Input = screen.getByPlaceholderText('Enter variable1');
    const variable2Input = screen.getByPlaceholderText('Enter variable2');

    await userEvent.type(variable1Input, 'value1');
    await userEvent.type(variable2Input, 'value2');

    expect(screen.getByDisplayValue('This is a test prompt with value1 and value2.')).toBeInTheDocument();
  });

  it('calls onCopy with the filled prompt when copy button is clicked', async () => {
    render(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCloseMock}
        promptText={mockPrompt.prompt_text}
        variables={mockPrompt.variables}
        onCopy={onCopyMock}
      />
    );

    const variable1Input = screen.getByPlaceholderText('Enter variable1');
    await userEvent.type(variable1Input, 'test_value');

    const copyButton = screen.getByRole('button', { name: /Copy Generated Prompt/i });
    await userEvent.click(copyButton);

    expect(onCopyMock).toHaveBeenCalledWith('This is a test prompt with test_value and {variable2}.');
    expect(toast.success).toHaveBeenCalledWith('Generated prompt copied to clipboard!');
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('handles variables with default values', () => {
    const promptWithDefaults = {
      prompt_text: 'Hello {name}, your age is {age}.',
      title: 'Prompt with Defaults',
      variables: [
        { name: 'name', type: 'text', defaultValue: 'John Doe' },
        { name: 'age', type: 'number', defaultValue: '30' },
      ],
    };

    render(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCloseMock}
        promptText={promptWithDefaults.prompt_text}
        variables={promptWithDefaults.variables}
        onCopy={onCopyMock}
      />
    );

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello John Doe, your age is 30.')).toBeInTheDocument();
  });

  it('handles empty variables array', () => {
    const promptNoVariables = {
      prompt_text: 'This prompt has no variables.',
      title: 'No Variables Prompt',
      variables: [],
    };

    render(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCopyMock}
        promptText={promptNoVariables.prompt_text}
        variables={promptNoVariables.variables}
        onCopy={onCopyMock}
      />
    );

    expect(screen.queryByText('Template Variables')).toBeInTheDocument();
    expect(screen.getByText(/This prompt doesn't have any variables to fill./)).toBeInTheDocument();
    expect(screen.getByDisplayValue('This prompt has no variables.')).toBeInTheDocument();
  });

  it('resets inputs when the dialog is opened with a new prompt', async () => {
    const initialPrompt = {
      prompt_text: 'Initial {var}.',
      title: 'Initial Prompt',
      variables: [{ name: 'var', type: 'text', defaultValue: 'default' }],
    };

    const newPrompt = {
      prompt_text: 'New {newVar}.',
      title: 'New Prompt',
      variables: [{ name: 'newVar', type: 'text', defaultValue: 'newDefault' }],
    };

    const { rerender } = render(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCloseMock}
        promptText={initialPrompt.prompt_text}
        variables={initialPrompt.variables}
        onCopy={onCopyMock}
      />
    );

    // Fill initial variable
    await userEvent.type(screen.getByPlaceholderText('Enter var'), 'filled');
    expect(screen.getByDisplayValue('Initial filled.')).toBeInTheDocument();

    // Re-render with new prompt (simulating dialog re-opening with new data)
    rerender(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCloseMock}
        promptText={newPrompt.prompt_text}
        variables={newPrompt.variables}
        onCopy={onCopyMock}
      />
    );

    // Expect new prompt's default value to be present and old value gone
    expect(screen.getByDisplayValue('New newDefault.')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Initial filled.')).not.toBeInTheDocument();
  });

  it('handles select type variables', async () => {
    const promptWithSelect = {
      prompt_text: 'Choose: {option}.',
      title: 'Select Prompt',
      variables: [
        { name: 'option', type: 'select', options: ['Option A', 'Option B'] },
      ],
    };

    render(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCloseMock}
        promptText={promptWithSelect.prompt_text}
        variables={promptWithSelect.variables}
        onCopy={onCopyMock}
      />
    );

    const selectTrigger = screen.getByRole('combobox');
    await userEvent.click(selectTrigger);

    const optionB = screen.getByText('Option B');
    await userEvent.click(optionB);

    expect(screen.getByDisplayValue('Choose: Option B.')).toBeInTheDocument();
  });

  it('handles number type variables', async () => {
    const promptWithNumber = {
      prompt_text: 'Number: {num}.',
      title: 'Number Prompt',
      variables: [
        { name: 'num', type: 'number', defaultValue: '10' },
      ],
    };

    render(
      <TemplateVariableFiller
        isOpen={true}
        onClose={onCloseMock}
        promptText={promptWithNumber.prompt_text}
        variables={promptWithNumber.variables}
        onCopy={onCopyMock}
      />
    );

    const numberInput = screen.getByPlaceholderText('Enter a number');
    expect(numberInput).toHaveValue(10);

    await userEvent.clear(numberInput);
    await userEvent.type(numberInput, '42');

    expect(screen.getByDisplayValue('Number: 42.')).toBeInTheDocument();
  });
});
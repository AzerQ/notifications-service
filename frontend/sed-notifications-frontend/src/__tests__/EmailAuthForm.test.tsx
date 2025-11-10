import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmailAuthForm } from '../NotificationsBar/Auth/EmailAuthForm';

// Mock the apiClient
jest.mock('../services/apiClient', () => ({
  createApiClient: jest.fn(() => ({
    sendEmailCode: jest.fn(),
    loginByEmail: jest.fn()
  }))
}));

describe('EmailAuthForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders email input form initially', () => {
    render(
      <EmailAuthForm
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('email-auth-form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-code-button')).toBeInTheDocument();
    expect(screen.getByText('Авторизация по почте')).toBeInTheDocument();
  });

  test('shows validation error for empty email', async () => {
    render(
      <EmailAuthForm
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    const sendButton = screen.getByTestId('send-code-button');
    fireEvent.click(sendButton);

    // Button should be disabled when email is empty
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when email is entered', () => {
    render(
      <EmailAuthForm
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByTestId('email-input');
    const sendButton = screen.getByTestId('send-code-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(sendButton).not.toBeDisabled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <EmailAuthForm
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByLabelText('Отмена');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('shows code verification form after sending code', async () => {
    const { createApiClient } = require('../services/apiClient');
    const mockApiClient = {
      sendEmailCode: jest.fn().mockResolvedValue({ id: 'test-id', message: 'Code sent' }),
      loginByEmail: jest.fn()
    };
    createApiClient.mockReturnValue(mockApiClient);

    render(
      <EmailAuthForm
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByTestId('email-input');
    const sendButton = screen.getByTestId('send-code-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockApiClient.sendEmailCode).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(screen.getByTestId('code-input')).toBeInTheDocument();
      expect(screen.getByTestId('verify-code-button')).toBeInTheDocument();
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });
  });

  test('limits code input to 6 digits', async () => {
    const { createApiClient } = require('../services/apiClient');
    const mockApiClient = {
      sendEmailCode: jest.fn().mockResolvedValue({ id: 'test-id', message: 'Code sent' }),
      loginByEmail: jest.fn()
    };
    createApiClient.mockReturnValue(mockApiClient);

    render(
      <EmailAuthForm
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
      />
    );

    // First, send code to get to the code verification step
    const emailInput = screen.getByTestId('email-input');
    const sendButton = screen.getByTestId('send-code-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByTestId('code-input')).toBeInTheDocument();
    });

    const codeInput = screen.getByTestId('code-input');
    
    // Test that only digits are accepted
    fireEvent.change(codeInput, { target: { value: 'abc123def456' } });
    expect(codeInput).toHaveValue('123456');
    
    // Test that it's limited to 6 characters
    fireEvent.change(codeInput, { target: { value: '123456789' } });
    expect(codeInput).toHaveValue('123456');
  });
});
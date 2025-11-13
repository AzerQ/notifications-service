import React, { useState, useEffect } from 'react';
import { EmailCodeModal } from './EmailCodeModal';
import { useNotificationContext } from './NotificationContext';

/**
 * Wrapper component that encapsulates email authentication modal logic
 * Automatically shows/hides the modal based on authentication state
 * No props required - just drop it into your component tree
 */
export const EmailAuthWrapper: React.FC = () => {
  const { authentication } = useNotificationContext();
  const [showModal, setShowModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');

  // Show modal when email authentication is required
  useEffect(() => {
    if (authentication.authState.requiresEmailCode || authentication.authState.requiresEmailInput) {
      setShowModal(true);
    }
  }, [authentication.authState.requiresEmailCode, authentication.authState.requiresEmailInput]);

  const handleVerifyEmailCode = async (verification: { id: string; code: string }) => {
    try {
      console.log('[EmailAuthWrapper] Verifying email code...');
      await authentication.verifyEmailCode(verification);
      console.log('[EmailAuthWrapper] Verification successful!');
      setShowModal(false);
    } catch (error) {
      console.error('[EmailAuthWrapper] Email verification failed:', error);
      // Error is handled by the authentication hook and passed to modal via props
    }
  };

  const handleResendCode = async (email: string) => {
    try {
      setCurrentEmail(email);
      await authentication.sendEmailCode(email);
      console.log('[EmailAuthWrapper] Code resent successfully');
    } catch (error) {
      console.error('[EmailAuthWrapper] Failed to resend code:', error);
      // Error is handled by the authentication hook
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    authentication.clearError();
  };

  return (
    <EmailCodeModal
      isOpen={showModal}
      challengeId={authentication.authState.emailChallengeId || ''}
      challengeMessage={authentication.authState.emailChallengeMessage || undefined}
      email={currentEmail}
      error={authentication.authState.error}
      onVerify={handleVerifyEmailCode}
      onResendCode={handleResendCode}
      onClose={handleCloseModal}
      requiresEmailInput={authentication.authState.requiresEmailInput}
    />
  );
};
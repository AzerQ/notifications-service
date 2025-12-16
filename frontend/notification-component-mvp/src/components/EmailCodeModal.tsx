import React, { useState, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import type { EmailCodeVerification } from '../services/authenticationService';
import styles from './EmailCodeModal.module.css';

interface EmailCodeModalProps {
  isOpen: boolean;
  challengeId: string;
  challengeMessage?: string;
  email?: string;
  error?: string | null;
  onVerify: (verification: EmailCodeVerification) => Promise<void>;
  onResendCode: (email: string) => Promise<void>;
  onClose: () => void;
  requiresEmailInput?: boolean;
}

/**
 * Modal for entering email verification code
 * Supports two modes:
 * 1. Email known - just enter code
 * 2. Email unknown - enter email first, then code
 */
export const EmailCodeModal: React.FC<EmailCodeModalProps> = ({
  isOpen,
  challengeId,
  challengeMessage,
  email,
  error,
  onVerify,
  onResendCode,
  onClose,
  requiresEmailInput = false,
}) => {
  const [code, setCode] = useState('');
  const [localEmail, setLocalEmail] = useState(email || '');
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>(
    requiresEmailInput && !challengeId ? 'email' : 'code'
  );

  // Debug logging
  useEffect(() => {
    console.log('[EmailCodeModal] Props updated:', {
      isOpen,
      challengeId,
      email,
      isVerifying,
      error,
      requiresEmailInput,
      step,
    });
  }, [isOpen, challengeId, email, isVerifying, error, requiresEmailInput, step]);

  // Update step when challengeId changes
  useEffect(() => {
    if (challengeId) {
      setStep('code');
    }
  }, [challengeId]);

  // Update local email when prop changes
  useEffect(() => {
    if (email) {
      setLocalEmail(email);
    }
  }, [email]);

  if (!isOpen) return null;

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!localEmail || !localEmail.includes('@')) {
      return;
    }

    setIsResending(true);
    try {
      await onResendCode(localEmail);
      setStep('code');
      setCode('');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setIsVerifying(true);
    e.preventDefault();

    if (step === 'email') {
      await handleSendCode();
      return;
    }

    if (code.trim().length === 6 && challengeId) {
      await onVerify({ id: challengeId, code: code.trim() });
      setIsVerifying(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setCode('');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <Mail className={styles.icon} />
            </div>
            <h2 className={styles.headerTitle}>
              {step === 'email' ? 'Введите вашу электронную почту' : 'Проверка электронной почты'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Закрыть"
          >
            <X className={styles.closeIcon} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {step === 'email' ? (
            /* Step 1: Enter Email */
            <>
              <p className={styles.description}>
                Аутентификация Windows не удалась. Пожалуйста, введите вашу электронную почту для
                получения кода проверки.
              </p>

              <form onSubmit={handleSendCode} className={styles.form}>
                <div className={styles.formGroup}>
                  <label
                    htmlFor="email"
                    className={styles.label}
                  >
                    Адрес электронной почты
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={localEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    className={styles.input}
                    placeholder="ваша.почта@example.com"
                    required
                    autoFocus
                    disabled={isResending}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className={styles.error}>
                    <p className={styles.errorText}>{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={onClose}
                    className={styles.cancelButton}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isResending || !localEmail || !localEmail.includes('@')}
                    className={styles.submitButton}
                  >
                    {isResending ? 'Отправка...' : 'Отправить код'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Step 2: Enter Code */
            <>
              <p className={styles.description}>
                {challengeMessage ||
                  'Код проверки отправлен на вашу электронную почту. Пожалуйста, введите его ниже для продолжения.'}
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Email display */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Адрес электронной почты
                  </label>
                  <div className={styles.emailDisplay}>
                    <span>{localEmail}</span>
                    {requiresEmailInput && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className={styles.changeButton}
                      >
                        Изменить
                      </button>
                    )}
                  </div>
                </div>

                {/* Code input */}
                <div className={styles.formGroup}>
                  <label
                    htmlFor="code"
                    className={styles.label}
                  >
                    Код проверки
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`${styles.input} ${styles.codeInput}`}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoComplete="off"
                    autoFocus
                  />
                  <p className={styles.inputHint}>
                    Введите 6-значный код из вашей электронной почты
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className={styles.error}>
                    <p className={styles.errorText}>{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className={styles.actionsSpaceBetween}>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isResending || !localEmail}
                    className={styles.resendButton}
                  >
                    {isResending ? 'Отправка...' : 'Отправить код повторно'}
                  </button>

                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={onClose}
                      className={styles.cancelButton}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifying || code.length !== 6}
                      className={styles.submitButton}
                    >
                      {isVerifying ? 'Проверка...' : 'Проверить'}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

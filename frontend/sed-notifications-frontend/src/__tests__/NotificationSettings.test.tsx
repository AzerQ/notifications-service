import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationSettings } from '../NotificationsBar/NotificationSettings';
import { UserNotificationSettings, NotificationEventSetting } from '../NotificationsBar/types';

const mockUserSettings: UserNotificationSettings = {
  userId: 'test-user',
  lastUpdated: '2024-01-01T00:00:00.000Z',
  eventSettings: [
    {
      eventId: 'document_created',
      eventName: 'Создание документа',
      eventDescription: 'Уведомление о создании нового документа',
      personalSettings: [
        { channel: 'email', enabled: true },
        { channel: 'push', enabled: true },
        { channel: 'inApp', enabled: true },
        { channel: 'sms', enabled: false }
      ],
      substituteSettings: [
        { channel: 'email', enabled: true },
        { channel: 'push', enabled: false },
        { channel: 'inApp', enabled: true },
        { channel: 'sms', enabled: false }
      ]
    },
    {
      eventId: 'task_assigned',
      eventName: 'Назначение задачи',
      eventDescription: 'Уведомление о назначении новой задачи',
      personalSettings: [
        { channel: 'email', enabled: true },
        { channel: 'push', enabled: true },
        { channel: 'inApp', enabled: true },
        { channel: 'sms', enabled: false }
      ],
      substituteSettings: [
        { channel: 'email', enabled: false },
        { channel: 'push', enabled: false },
        { channel: 'inApp', enabled: true },
        { channel: 'sms', enabled: false }
      ]
    }
  ]
};

const mockGetUserSettings = jest.fn();
const mockSaveUserSettings = jest.fn();
const mockOnClose = jest.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  getUserSettings: mockGetUserSettings,
  saveUserSettings: mockSaveUserSettings
};

describe('NotificationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserSettings.mockResolvedValue(mockUserSettings);
    mockSaveUserSettings.mockResolvedValue(undefined);
  });

  it('should render settings modal when open', async () => {
    render(<NotificationSettings {...defaultProps} />);

    expect(screen.getByTestId('notification-settings-overlay')).toBeInTheDocument();
    expect(screen.getByText('Настройки уведомлений')).toBeInTheDocument();

    // Ждем загрузки настроек
    await waitFor(() => {
      expect(screen.getByText('Создание документа')).toBeInTheDocument();
      expect(screen.getByText('Назначение задачи')).toBeInTheDocument();
    });
  });

  it('should not render when closed', () => {
    render(<NotificationSettings {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('notification-settings-overlay')).not.toBeInTheDocument();
  });

  it('should load settings on open', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetUserSettings).toHaveBeenCalledTimes(1);
    });
  });

  it('should display loading state', () => {
    mockGetUserSettings.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<NotificationSettings {...defaultProps} />);

    expect(screen.getByText('Загрузка настроек...')).toBeInTheDocument();
  });

  it('should display error state and allow retry', async () => {
    mockGetUserSettings.mockRejectedValue(new Error('Network error'));

    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки настроек')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Повторить попытку');
    fireEvent.click(retryButton);

    expect(mockGetUserSettings).toHaveBeenCalledTimes(2);
  });

  it('should close modal when close button is clicked', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Создание документа')).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId('notification-settings-close-button');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when backdrop is clicked', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Создание документа')).toBeInTheDocument();
    });

    const backdrop = screen.getByTestId('notification-settings-backdrop');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when Escape key is pressed', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Создание документа')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should toggle channel settings', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Создание документа')).toBeInTheDocument();
    });

    // Находим все чекбоксы для Email в личных настройках
    const emailCheckboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    const personalEmailCheckbox = emailCheckboxes.find(checkbox => {
      const label = checkbox.parentElement?.textContent;
      return label?.includes('Email') && checkbox.checked;
    });

    expect(personalEmailCheckbox).toBeInTheDocument();
    expect(personalEmailCheckbox).toBeChecked();

    // Переключаем чекбокс
    fireEvent.click(personalEmailCheckbox!);

    expect(personalEmailCheckbox).not.toBeChecked();
  });

  it('should save settings when save button is clicked', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Создание документа')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveUserSettings).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should show saving state', async () => {
    mockSaveUserSettings.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Создание документа')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    expect(screen.getByText('Сохранение...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSaveUserSettings).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle save error', async () => {
    mockSaveUserSettings.mockRejectedValue(new Error('Save error'));

    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Создание документа')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Сохранить');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Ошибка сохранения настроек')).toBeInTheDocument();
    });

    // В случае ошибки окно не должно закрываться
    expect(screen.getByTestId('notification-settings-overlay')).toBeInTheDocument();
  });

  it('should display event descriptions when available', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Уведомление о создании нового документа')).toBeInTheDocument();
      expect(screen.getByText('Уведомление о назначении новой задачи')).toBeInTheDocument();
    });
  });

  it('should display personal and substitute setting groups', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getAllByText('Для себя')).toHaveLength(2); // Для каждого события
      expect(screen.getAllByText('По замещению')).toHaveLength(2); // Для каждого события
    });
  });

  it('should display last updated time', async () => {
    render(<NotificationSettings {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Последнее обновление:/)).toBeInTheDocument();
    });
  });
});
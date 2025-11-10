import { 
  tryExecuteAppAction, 
  executeNotificationAction, 
  registerActionHandler 
} from '../NotificationsBar/notificationsActions';
import { ToastConfig } from '../NotificationsBar/types';

// Очищаем обработчики перед каждым тестом
const originalHandlers = new Map();

describe('notificationsActions', () => {
  let mockShowToast: jest.Mock;
  let mockOnActionComplete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowToast = jest.fn();
    mockOnActionComplete = jest.fn();
    
    // Очищаем console.error для тестов
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerActionHandler', () => {
    it('должен регистрировать обработчик действия', () => {
      const mockHandler = jest.fn();
      
      registerActionHandler('testAction', mockHandler);
      
      // Тестируем что обработчик был зарегистрирован
      const [success] = tryExecuteAppAction('appactions://testAction');
      expect(success).toBe(true);
    });

    it('должен позволять перезаписывать обработчики', () => {
      const firstHandler = jest.fn();
      const secondHandler = jest.fn();
      
      registerActionHandler('testAction', firstHandler);
      registerActionHandler('testAction', secondHandler);
      
      tryExecuteAppAction('appactions://testAction');
      
      expect(firstHandler).not.toHaveBeenCalled();
      expect(secondHandler).toHaveBeenCalled();
    });
  });

  describe('tryExecuteAppAction', () => {
    beforeEach(() => {
      // Регистрируем тестовый обработчик
      registerActionHandler('testAction', (params) => {
        // Обработчик для тестов
      });
    });

    it('должен успешно выполнять зарегистрированное действие', () => {
      const [success, actionName] = tryExecuteAppAction('appactions://testAction');
      
      expect(success).toBe(true);
      expect(actionName).toBe('testAction');
    });

    it('должен возвращать ошибку для незарегистрированного действия', () => {
      const [success, message] = tryExecuteAppAction('appactions://unknownAction');
      
      expect(success).toBe(false);
      expect(message).toBe('Действие не найдено!');
    });

    it('должен возвращать ошибку для неправильного формата URL', () => {
      const [success, message] = tryExecuteAppAction('https://example.com');
      
      expect(success).toBe(false);
      expect(message).toBe('Ошибка при выполнении действия!');
    });

    it('должен передавать параметры обработчику', () => {
      const mockHandler = jest.fn();
      registerActionHandler('testActionWithParams', mockHandler);
      
      tryExecuteAppAction('appactions://testActionWithParams?param1=value1&param2=value2');
      
      expect(mockHandler).toHaveBeenCalledWith({
        param1: 'value1',
        param2: 'value2',
      });
    });

    it('должен декодировать URL-кодированные параметры', () => {
      const mockHandler = jest.fn();
      registerActionHandler('testActionEncoded', mockHandler);
      
      tryExecuteAppAction('appactions://testActionEncoded?message=Hello%20World&id=123');
      
      expect(mockHandler).toHaveBeenCalledWith({
        message: 'Hello World',
        id: '123',
      });
    });

    it('должен обрабатывать действие без параметров', () => {
      const mockHandler = jest.fn();
      registerActionHandler('simpleAction', mockHandler);
      
      tryExecuteAppAction('appactions://simpleAction');
      
      expect(mockHandler).toHaveBeenCalledWith({});
    });

    it('должен обрабатывать параметры без значений', () => {
      const mockHandler = jest.fn();
      registerActionHandler('emptyParamAction', mockHandler);
      
      tryExecuteAppAction('appactions://emptyParamAction?param1=&param2=value');
      
      expect(mockHandler).toHaveBeenCalledWith({
        param1: '',
        param2: 'value',
      });
    });

    it('должен логировать ошибки в консоль', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      
      tryExecuteAppAction('invalid-url');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error executing action:',
        expect.any(Error)
      );
    });
  });

  describe('executeNotificationAction', () => {
    beforeEach(() => {
      registerActionHandler('successAction', () => {
        // Успешное действие
      });
    });

    it('должен показывать toast успеха при успешном выполнении', () => {
      executeNotificationAction(
        'appactions://successAction',
        "123",
        true,
        mockOnActionComplete,
        mockShowToast
      );

      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Успех',
        message: 'Действие "successAction" выполнено успешно',
        type: 'success',
      });
    });

    it('должен вызывать onActionComplete при успешном выполнении и markAsRead=true', () => {
      executeNotificationAction(
        'appactions://successAction',
        "123",
        true,
        mockOnActionComplete,
        mockShowToast
      );

      expect(mockOnActionComplete).toHaveBeenCalledWith(123);
    });

    it('не должен вызывать onActionComplete когда markAsRead=false', () => {
      executeNotificationAction(
        'appactions://successAction',
        "123",
        false,
        mockOnActionComplete,
        mockShowToast
      );

      expect(mockOnActionComplete).not.toHaveBeenCalled();
    });

    it('должен показывать toast ошибки при неуспешном выполнении', () => {
      executeNotificationAction(
        'appactions://unknownAction',
        "123",
        true,
        mockOnActionComplete,
        mockShowToast
      );

      expect(mockShowToast).toHaveBeenCalledWith({
        title: 'Ошибка',
        message: 'Действие не найдено!',
        type: 'error',
      });
    });

    it('не должен вызывать onActionComplete при ошибке', () => {
      executeNotificationAction(
        'appactions://unknownAction',
        "123",
        true,
        mockOnActionComplete,
        mockShowToast
      );

      expect(mockOnActionComplete).not.toHaveBeenCalled();
    });

    it('должен обрабатывать случай когда onActionComplete не предоставлен', () => {
      expect(() => {
        executeNotificationAction(
          'appactions://successAction',
          "123",
          true,
          null as any,
          mockShowToast
        );
      }).not.toThrow();
    });

    it('должен передавать правильный notificationId', () => {
      const testId = 456;
      
      executeNotificationAction(
        'appactions://successAction',
        testId.toString(),
        true,
        mockOnActionComplete,
        mockShowToast
      );

      expect(mockOnActionComplete).toHaveBeenCalledWith(testId);
    });

    it('должен работать с разными типами toast конфигураций', () => {
      const testToast = jest.fn();
      
      executeNotificationAction(
        'appactions://successAction',
        "123",
        true,
        mockOnActionComplete,
        testToast
      );

      expect(testToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.any(String),
          message: expect.any(String),
          type: 'success',
        })
      );
    });
  });

  describe('интеграционные тесты', () => {
    it('должен выполнять полный цикл регистрации и выполнения действия', () => {
      const mockHandler = jest.fn();
      const actionName = 'integrationTestAction';
      
      // Регистрируем действие
      registerActionHandler(actionName, mockHandler);
      
      // Выполняем действие
      executeNotificationAction(
        `appactions://${actionName}?param=test`,
        "999",
        true,
        mockOnActionComplete,
        mockShowToast
      );

      // Проверяем что все работает
      expect(mockHandler).toHaveBeenCalledWith({ param: 'test' });
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success',
          title: 'Успех',
        })
      );
      expect(mockOnActionComplete).toHaveBeenCalledWith(999);
    });

    it('должен обрабатывать сложные параметры действий', () => {
      const mockHandler = jest.fn();
      registerActionHandler('complexAction', mockHandler);
      
      executeNotificationAction(
        'appactions://complexAction?docId=12345&userId=67890&action=approve&comment=Looks%20good',
        "111",
        true,
        mockOnActionComplete,
        mockShowToast
      );

      expect(mockHandler).toHaveBeenCalledWith({
        docId: '12345',
        userId: '67890',
        action: 'approve',
        comment: 'Looks good',
      });
    });
  });
});
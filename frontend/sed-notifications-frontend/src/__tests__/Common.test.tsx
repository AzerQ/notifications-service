import { 
  getTypeIcon, 
  getTypeColorClass, 
  formatDate 
} from '../NotificationsBar/Common';

describe('Common utilities', () => {
  describe('getTypeIcon', () => {
    it('должен возвращать правильную иконку для типа document', () => {
      const icon = getTypeIcon('document');
      expect(icon).toBeDefined();
      expect(icon.props.className).toContain('w-5 h-5');
    });

    it('должен возвращать правильную иконку для типа task', () => {
      const icon = getTypeIcon('task');
      expect(icon).toBeDefined();
      expect(icon.props.className).toContain('w-5 h-5');
    });

    it('должен возвращать правильную иконку для типа system', () => {
      const icon = getTypeIcon('system');
      expect(icon).toBeDefined();
      expect(icon.props.className).toContain('w-5 h-5');
    });

    it('должен возвращать иконку по умолчанию для неизвестного типа', () => {
      const icon = getTypeIcon('unknown' as any);
      expect(icon).toBeDefined();
      expect(icon.props.className).toContain('w-5 h-5');
    });
  });

  describe('getTypeColorClass', () => {
    it('должен возвращать правильные классы для типа document', () => {
      const classes = getTypeColorClass('document');
      expect(classes).toBe('bg-blue-100 text-blue-800 border-blue-200');
    });

    it('должен возвращать правильные классы для типа task', () => {
      const classes = getTypeColorClass('task');
      expect(classes).toBe('bg-green-100 text-green-800 border-green-200');
    });

    it('должен возвращать правильные классы для типа system', () => {
      const classes = getTypeColorClass('system');
      expect(classes).toBe('bg-purple-100 text-purple-800 border-purple-200');
    });

    it('должен возвращать классы по умолчанию для неизвестного типа', () => {
      const classes = getTypeColorClass('unknown' as any);
      expect(classes).toBe('bg-gray-100 text-gray-800 border-gray-200');
    });

    it('должен возвращать классы по умолчанию для other типа', () => {
      const classes = getTypeColorClass('other');
      expect(classes).toBe('bg-gray-100 text-gray-800 border-gray-200');
    });
  });

  describe('formatDate', () => {
    it('должен форматировать дату в правильном формате', () => {
      const dateString = '2024-01-15T10:30:00';
      const formatted = formatDate(dateString);
      
      // Проверяем, что результат содержит ожидаемые элементы даты и времени
      expect(formatted).toMatch(/\d{2}\.\d{2}\.2024/); // дата в формате дд.мм.гггг
      expect(formatted).toMatch(/\d{2}:\d{2}/); // время в формате чч:мм
    });

    it('должен корректно обрабатывать полуночь', () => {
      const dateString = '2024-01-15T00:00:00';
      const formatted = formatDate(dateString);
      
      expect(formatted).toMatch(/\d{2}\.\d{2}\.2024/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('должен корректно обрабатывать полдень', () => {
      const dateString = '2024-01-15T12:00:00';
      const formatted = formatDate(dateString);
      
      expect(formatted).toMatch(/\d{2}\.\d{2}\.2024/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('должен корректно обрабатывать конец дня', () => {
      const dateString = '2024-01-15T23:59:00';
      const formatted = formatDate(dateString);
      
      expect(formatted).toMatch(/\d{2}\.\d{2}\.2024/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('должен корректно обрабатывать различные месяцы', () => {
      const testCases = [
        { input: '2024-01-01T12:00:00', pattern: /\d{2}\.\d{2}\.2024/ },
        { input: '2024-06-15T12:00:00', pattern: /\d{2}\.\d{2}\.2024/ },
        { input: '2024-12-31T12:00:00', pattern: /\d{2}\.\d{2}\.2024/ },
      ];

      testCases.forEach(({ input, pattern }) => {
        const formatted = formatDate(input);
        expect(formatted).toMatch(pattern);
        expect(formatted).toMatch(/\d{2}:\d{2}/);
      });
    });

    it('должен корректно обрабатывать високосный год', () => {
      const dateString = '2024-02-29T12:00:00'; // 2024 - високосный год
      const formatted = formatDate(dateString);
      
      expect(formatted).toMatch(/\d{2}\.\d{2}\.2024/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('должен корректно обрабатывать разные годы', () => {
      const testCases = [
        { input: '2023-01-15T12:00:00', pattern: /\d{2}\.\d{2}\.2023/ },
        { input: '2024-01-15T12:00:00', pattern: /\d{2}\.\d{2}\.2024/ },
        { input: '2025-01-15T12:00:00', pattern: /\d{2}\.\d{2}\.2025/ },
      ];

      testCases.forEach(({ input, pattern }) => {
        const formatted = formatDate(input);
        expect(formatted).toMatch(pattern);
        expect(formatted).toMatch(/\d{2}:\d{2}/);
      });
    });

    it('должен корректно обрабатывать UTC время', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const formatted = formatDate(dateString);
      
      // Результат может варьироваться в зависимости от часового пояса
      expect(formatted).toMatch(/\d{2}\.\d{2}\.2024/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('должен корректно обрабатывать время с миллисекундами', () => {
      const dateString = '2024-01-15T10:30:00.123Z';
      const formatted = formatDate(dateString);
      
      expect(formatted).toMatch(/\d{2}\.\d{2}\.2024/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('должен корректно обрабатывать неправильный формат даты', () => {
      const invalidDate = 'invalid-date';
      
      expect(() => formatDate(invalidDate)).not.toThrow();
      
      const formatted = formatDate(invalidDate);
      // Invalid Date может отображаться по-разному в разных браузерах
      expect(formatted).toMatch(/Invalid Date|Invalid|NaN/i);
    });
  });

  describe('edge cases', () => {
    it('все функции должны быть экспортированы', () => {
      expect(getTypeIcon).toBeDefined();
      expect(getTypeColorClass).toBeDefined();
      expect(formatDate).toBeDefined();
    });

    it('getTypeIcon должен возвращать React элемент', () => {
      const icon = getTypeIcon('document');
      expect(icon).toHaveProperty('type');
      expect(icon).toHaveProperty('props');
    });

    it('getTypeColorClass должен возвращать строку с CSS классами', () => {
      const classes = getTypeColorClass('document');
      expect(typeof classes).toBe('string');
      expect(classes.split(' ')).toHaveLength(3); // bg-, text-, border-
    });

    it('formatDate должен принимать строку и возвращать строку', () => {
      const result = formatDate('2024-01-15T10:30:00');
      expect(typeof result).toBe('string');
    });
  });

  describe('consistency tests', () => {
    const allTypes: Array<'document' | 'task' | 'system' | 'other'> = ['document', 'task', 'system', 'other'];

    it('все типы должны иметь иконки', () => {
      allTypes.forEach(type => {
        const icon = getTypeIcon(type);
        expect(icon).toBeDefined();
        expect(icon.props.className).toContain('w-5 h-5');
      });
    });

    it('все типы должны иметь цветовые классы', () => {
      allTypes.forEach(type => {
        const classes = getTypeColorClass(type);
        expect(classes).toBeDefined();
        expect(classes).toContain('bg-');
        expect(classes).toContain('text-');
        expect(classes).toContain('border-');
      });
    });

    it('цветовые схемы должны быть последовательными', () => {
      allTypes.forEach(type => {
        const classes = getTypeColorClass(type);
        const parts = classes.split(' ');
        
        // Извлекаем цвет из классов
        const bgColor = parts[0].replace('bg-', '').replace('-100', '');
        const textColor = parts[1].replace('text-', '').replace('-800', '');
        const borderColor = parts[2].replace('border-', '').replace('-200', '');
        
        // Все три класса должны использовать один цвет
        expect(textColor).toBe(bgColor);
        expect(borderColor).toBe(bgColor);
      });
    });
  });
});
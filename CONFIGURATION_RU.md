# Руководство по конфигурации

Этот документ описывает параметры конфигурации для сервиса уведомлений (Backend API) и компонента уведомлений (Frontend).

## 🖥️ Конфигурация Backend API

Конфигурация бэкенда находится в файле `backend/src/NotificationService.Api/appsettings.json`.

### 1. Общие настройки
- `urls`: Адрес и порт, на которых работает сервис (по умолчанию: `http://*:5093`).
- `EnableSwaggerUI`: Флаг для включения/выключения интерфейса документации Swagger.

### 2. База данных
- `ConnectionStrings:Notifications`: Строка подключения к SQLite (по умолчанию: `Data Source=notifications.db`).

### 3. JWT Аутентификация
- `JwtSettings:SecretKey`: **Обязательно**. Секретный ключ для подписи JWT-токенов.
- `JwtSettings:Issuer`: Издатель токена.
- `JwtSettings:Audience`: Целевая аудитория токена.
- `JwtSettings:AccessTokenExpirationMinutes`: Время жизни токена доступа.
- `JwtSettings:RefreshTokenExpirationHours`: Время жизни токена обновления.

### 4. Электронная почта (SMTP)
- `Email:SmtpHost`: Адрес SMTP-сервера.
- `Email:SmtpPort`: Порт SMTP-сервера (например, 587).
- `Email:EnableSsl`: Использовать ли SSL/TLS.
- `Email:UserName`: Имя пользователя SMTP.
- `Email:Password`: Пароль SMTP.
- `Email:FromAddress`: Адрес электронной почты отправителя.

### 5. Очистка уведомлений
- `NotificationCleanup:Enabled`: Включить автоматическое удаление старых уведомлений.
- `NotificationCleanup:RetentionDays`: Количество дней хранения уведомлений.
- `NotificationCleanup:Schedule`: Cron-выражение для задачи очистки (по умолчанию: `0 0 2 * * ?` - каждый день в 2 часа ночи).

---

## 🌐 Конфигурация Frontend компонента

Фронтенд-компонент настраивается с помощью переменных окружения (Vite) на этапе сборки. Создайте файл `.env` в директории `frontend/notification-component-mvp/` на основе `.env.example`.

### Переменные окружения (.env)

| Переменная | Описание | Пример |
|------------|----------|---------|
| `VITE_API_URL` | Базовый URL для Backend API | `https://api.example.com` |
| `VITE_SIGNALR_URL` | URL для хаба SignalR | `https://api.example.com/notificationHub` |
| `VITE_ENABLED_AUTH_METHODS` | Включенные методы аутентификации (через запятую) | `windows,email` |
| `VITE_ICONS_THEME` | Тема иконок (`light` или `dark`) | `light` |
| `VITE_STYLES_PATH` | Путь к стилям для изоляции в Shadow DOM | `/styles/custom.css` |

### Важные примечания
- **User ID**: Идентификатор пользователя не требуется указывать в конфигурации. Он автоматически извлекается из JWT-токена на стороне бэкенда.
- **Сборка**: Эти переменные внедряются во время сборки. Если вы измените их, необходимо пересобрать фронтенд-приложение.

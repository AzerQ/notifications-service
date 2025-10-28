# Руководство по интеграции

Полное руководство по интеграции и встраиванию сервиса уведомлений в существующее приложение.

## Содержание

1. [Встраивание Backend API](#встраивание-backend-api)
2. [Интеграция Frontend компонентов](#интеграция-frontend-компонентов)
3. [Конфигурация](#конфигурация)
4. [Развертывание](#развертывание)
5. [Примеры интеграции](#примеры-интеграции)

---

## Встраивание Backend API

### Вариант 1: Standalone сервис

Запустите сервис уведомлений как отдельный микросервис.

#### Установка и запуск

```bash
# Клонировать репозиторий
git clone https://github.com/AzerQ/notifications-service.git
cd notifications-service/backend

# Сборка
dotnet build

# Запуск
dotnet run --project src/NotificationService.Api
```

API будет доступен на `http://localhost:5000`

#### Docker развертывание

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/NotificationService.Api/NotificationService.Api.csproj", "src/NotificationService.Api/"]
COPY ["src/NotificationService.Application/NotificationService.Application.csproj", "src/NotificationService.Application/"]
COPY ["src/NotificationService.Domain/NotificationService.Domain.csproj", "src/NotificationService.Domain/"]
COPY ["src/NotificationService.Infrastructure/NotificationService.Infrastructure.csproj", "src/NotificationService.Infrastructure/"]
COPY ["src/NotificationService.TestHandlers/NotificationService.TestHandlers.csproj", "src/NotificationService.TestHandlers/"]

RUN dotnet restore "src/NotificationService.Api/NotificationService.Api.csproj"
COPY . .
WORKDIR "/src/src/NotificationService.Api"
RUN dotnet build "NotificationService.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "NotificationService.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "NotificationService.Api.dll"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  notifications-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__Notifications=Data Source=/app/data/notifications.db
      - Email__SmtpHost=${SMTP_HOST}
      - Email__SmtpPort=${SMTP_PORT}
      - Email__UserName=${SMTP_USERNAME}
      - Email__Password=${SMTP_PASSWORD}
    volumes:
      - notification-data:/app/data

volumes:
  notification-data:
```

Запуск:

```bash
docker-compose up -d
```

### Вариант 2: Интеграция в существующий проект

Добавьте проекты сервиса уведомлений в ваше существующее .NET решение.

#### Шаг 1: Добавление проектов

```bash
# Добавить проекты в ваше решение
dotnet sln YourSolution.sln add path/to/NotificationService.Domain/NotificationService.Domain.csproj
dotnet sln YourSolution.sln add path/to/NotificationService.Application/NotificationService.Application.csproj
dotnet sln YourSolution.sln add path/to/NotificationService.Infrastructure/NotificationService.Infrastructure.csproj
```

#### Шаг 2: Добавление ссылок

В вашем API проекте:

```xml
<ItemGroup>
  <ProjectReference Include="path\to\NotificationService.Application\NotificationService.Application.csproj" />
  <ProjectReference Include="path\to\NotificationService.Infrastructure\NotificationService.Infrastructure.csproj" />
</ItemGroup>
```

#### Шаг 3: Регистрация сервисов

В вашем `Program.cs`:

```csharp
using NotificationService.Api.DI;
using NotificationService.Application.Extensions;

var builder = WebApplication.CreateBuilder(args);

// ... ваши существующие сервисы ...

// Добавить сервисы уведомлений
builder.Services.AddNotificationApplicationServices(builder.Configuration);

// Добавить обработчики уведомлений
builder.Services.AddNotificationsServiceModule(
    builder.Configuration,
    typeof(YourNotificationHandlers.NotificationServicesRegister).Assembly
);

var app = builder.Build();

// ... настройка middleware ...

// Маппинг SignalR Hub (опционально)
app.MapHub<NotificationHub>("/notificationHub");

app.Run();
```

#### Шаг 4: Конфигурация

Добавьте в `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Notifications": "Data Source=notifications.db"
  },
  "Email": {
    "SmtpHost": "smtp.example.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "UserName": "your-email@example.com",
    "Password": "your-password",
    "FromAddress": "notifications@example.com",
    "FromName": "My App Notifications"
  },
  "TemplateOptions": {
    "TemplatesBasePath": "Templates"
  }
}
```

### Вариант 3: NuGet пакет (если опубликован)

```bash
# Установить NuGet пакеты
dotnet add package NotificationService.Application
dotnet add package NotificationService.Infrastructure
```

---

## Интеграция Frontend компонентов

### React приложение

#### Установка

Если frontend компонент опубликован как npm пакет:

```bash
npm install sed-notifications-frontend
# или
yarn add sed-notifications-frontend
```

Если используете локально:

```bash
cd frontend/sed-notifications-frontend
npm install
npm run build

# В вашем проекте
npm install ../path/to/sed-notifications-frontend
```

#### Базовая интеграция

```typescript
import React from 'react';
import { NotificationCenterWithStore, ToastProvider } from 'sed-notifications-frontend';
import 'sed-notifications-frontend/dist/index.css'; // Импорт стилей

function App() {
  return (
    <ToastProvider>
      <div className="app">
        <header>
          <h1>My Application</h1>
          
          {/* Компонент уведомлений */}
          <NotificationCenterWithStore 
            userId="current-user-id"
            signalRUrl="http://localhost:5000/notificationHub"
            apiBaseUrl="http://localhost:5000/api"
          />
        </header>
        
        <main>
          {/* Ваше приложение */}
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
```

#### Продвинутая интеграция

Создайте обертку для кастомизации:

```typescript
// components/NotificationCenter.tsx
import React, { useState, useEffect } from 'react';
import { 
  NotificationBell, 
  NotificationList,
  useNotificationFilters,
  useSignalR
} from 'sed-notifications-frontend';
import { fetchUserNotifications } from './api/notifications';

interface NotificationCenterProps {
  userId: string;
  signalRUrl: string;
}

export function NotificationCenter({ userId, signalRUrl }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const { applyFilters, filterByType } = useNotificationFilters();
  
  // Подключение к SignalR
  const { connect, onNotificationReceived } = useSignalR(signalRUrl);
  
  useEffect(() => {
    // Загрузка уведомлений
    fetchUserNotifications(userId).then(setNotifications);
    
    // Подключение к SignalR
    connect();
    
    // Обработка новых уведомлений
    onNotificationReceived((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
  }, [userId]);
  
  const filteredNotifications = applyFilters(notifications);
  const unreadCount = filteredNotifications.filter(n => !n.read).length;
  
  return (
    <div className="notification-center">
      <NotificationBell 
        unreadCount={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
      />
      
      {isOpen && (
        <div className="notification-dropdown">
          <NotificationList 
            notifications={filteredNotifications}
            onNotificationClick={(n) => handleNotificationClick(n)}
            onMarkAsRead={(n) => handleMarkAsRead(n)}
          />
        </div>
      )}
    </div>
  );
}
```

### Angular приложение

#### Создание Angular сервиса

```typescript
// services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:5000/api';
  private hubUrl = 'http://localhost:5000/notificationHub';
  private connection: signalR.HubConnection;
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.initializeSignalR();
  }
  
  private async initializeSignalR() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();
    
    this.connection.on('ReceiveNotification', (notification: Notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
    });
    
    await this.connection.start();
  }
  
  getUserNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiUrl}/notification/by-user/${userId}`
    );
  }
  
  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/notification/${notificationId}/mark-read`,
      {}
    );
  }
}
```

#### Создание компонента

```typescript
// components/notification-center/notification-center.component.ts
import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css']
})
export class NotificationCenterComponent implements OnInit {
  notifications$ = this.notificationService.notifications$;
  isOpen = false;
  unreadCount = 0;
  
  constructor(private notificationService: NotificationService) {}
  
  ngOnInit() {
    this.notificationService.getUserNotifications('current-user-id')
      .subscribe(notifications => {
        this.updateNotifications(notifications);
      });
    
    this.notifications$.subscribe(notifications => {
      this.unreadCount = notifications.filter(n => !n.read).length;
    });
  }
  
  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  
  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe();
  }
}
```

### Vue.js приложение

#### Создание Vuex store

```typescript
// store/notifications.ts
import { defineStore } from 'pinia';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    connection: null as signalR.HubConnection | null,
  }),
  
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
  },
  
  actions: {
    async initializeSignalR(hubUrl: string) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .build();
      
      this.connection.on('ReceiveNotification', (notification: Notification) => {
        this.notifications.unshift(notification);
      });
      
      await this.connection.start();
    },
    
    async fetchNotifications(userId: string) {
      const response = await axios.get(
        `http://localhost:5000/api/notification/by-user/${userId}`
      );
      this.notifications = response.data;
    },
    
    async markAsRead(notificationId: string) {
      await axios.put(
        `http://localhost:5000/api/notification/${notificationId}/mark-read`
      );
      
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
  },
});
```

#### Создание компонента

```vue
<!-- components/NotificationCenter.vue -->
<template>
  <div class="notification-center">
    <button @click="toggleDropdown" class="notification-bell">
      <i class="bell-icon"></i>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>
    
    <div v-if="isOpen" class="notification-dropdown">
      <div class="notification-header">
        <h3>Notifications</h3>
        <button @click="markAllAsRead">Mark all as read</button>
      </div>
      
      <div class="notification-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['notification-item', { unread: !notification.read }]"
          @click="handleNotificationClick(notification)"
        >
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
          <span class="date">{{ formatDate(notification.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotificationStore } from '../store/notifications';

const store = useNotificationStore();
const isOpen = ref(false);

const notifications = computed(() => store.notifications);
const unreadCount = computed(() => store.unreadCount);

onMounted(async () => {
  await store.initializeSignalR('http://localhost:5000/notificationHub');
  await store.fetchNotifications('current-user-id');
});

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function handleNotificationClick(notification) {
  if (!notification.read) {
    store.markAsRead(notification.id);
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}
</script>
```

---

## Конфигурация

### Backend конфигурация

#### Переменные окружения

```bash
# .env файл для production
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__Notifications=Data Source=/app/data/notifications.db

# Email настройки
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__EnableSsl=true
Email__UserName=your-email@gmail.com
Email__Password=your-app-password
Email__FromAddress=notifications@yourapp.com
Email__FromName=Your App Notifications

# SignalR настройки (опционально)
SignalR__AllowedOrigins=https://yourapp.com,https://www.yourapp.com
```

#### CORS настройка

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://yourapp.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials(); // Для SignalR
    });
});

// ...

app.UseCors("AllowFrontend");
```

### Frontend конфигурация

#### Environment файлы

```typescript
// .env.development
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SIGNALR_HUB_URL=http://localhost:5000/notificationHub

// .env.production
REACT_APP_API_BASE_URL=https://api.yourapp.com/api
REACT_APP_SIGNALR_HUB_URL=https://api.yourapp.com/notificationHub
```

#### Использование в коде

```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const SIGNALR_HUB_URL = process.env.REACT_APP_SIGNALR_HUB_URL;

<NotificationCenterWithStore 
  userId={currentUserId}
  signalRUrl={SIGNALR_HUB_URL}
  apiBaseUrl={API_BASE_URL}
/>
```

---

## Развертывание

### Вариант 1: Развертывание на Azure

#### Azure App Service

```bash
# Создать App Service
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name notification-service-api \
  --runtime "DOTNET|8.0"

# Развернуть приложение
az webapp deployment source config-zip \
  --resource-group myResourceGroup \
  --name notification-service-api \
  --src backend.zip
```

#### Azure SignalR Service

```csharp
// Program.cs
builder.Services.AddSignalR()
    .AddAzureSignalR(builder.Configuration["Azure:SignalR:ConnectionString"]);
```

### Вариант 2: Развертывание на AWS

#### Elastic Beanstalk

```bash
# Инициализация
eb init -p "64bit Amazon Linux 2 v2.3.0 running .NET Core" notification-service

# Создать окружение
eb create notification-service-prod

# Развернуть
eb deploy
```

### Вариант 3: Kubernetes

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notification-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: notification-service
  template:
    metadata:
      labels:
        app: notification-service
    spec:
      containers:
      - name: notification-api
        image: your-registry/notification-service:latest
        ports:
        - containerPort: 5000
        env:
        - name: ConnectionStrings__Notifications
          valueFrom:
            secretKeyRef:
              name: notification-secrets
              key: db-connection
        - name: Email__SmtpHost
          valueFrom:
            configMapKeyRef:
              name: notification-config
              key: smtp-host

---
apiVersion: v1
kind: Service
metadata:
  name: notification-service
spec:
  selector:
    app: notification-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

Развертывание:

```bash
kubectl apply -f kubernetes/deployment.yaml
```

---

## Примеры интеграции

### Полный пример: E-commerce приложение

#### Backend интеграция

```csharp
// Services/OrderService.cs
public class OrderService
{
    private readonly INotificationCommandService _notificationService;
    
    public async Task<Order> CreateOrderAsync(CreateOrderDto dto)
    {
        // Создать заказ
        var order = await _orderRepository.CreateAsync(dto);
        
        // Отправить уведомление
        await _notificationService.ProcessNotificationRequestAsync(new NotificationRequest
        {
            Route = "OrderCreated",
            Channel = "Email,Push",
            Parameters = new Dictionary<string, object>
            {
                ["CustomerId"] = order.CustomerId,
                ["OrderNumber"] = order.OrderNumber,
                ["OrderTotal"] = order.Total,
                ["ItemCount"] = order.Items.Count
            }
        });
        
        return order;
    }
}
```

#### Frontend интеграция

```typescript
// App.tsx
import React from 'react';
import { NotificationCenterWithStore, ToastProvider } from 'sed-notifications-frontend';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();
  
  return (
    <ToastProvider>
      <div className="app">
        <nav>
          <Logo />
          <Menu />
          {user && (
            <NotificationCenterWithStore 
              userId={user.id}
              signalRUrl={process.env.REACT_APP_SIGNALR_HUB_URL}
              apiBaseUrl={process.env.REACT_APP_API_BASE_URL}
            />
          )}
        </nav>
        
        <Routes>
          {/* Ваши маршруты */}
        </Routes>
      </div>
    </ToastProvider>
  );
}
```

### Пример: Task management система

```typescript
// hooks/useTaskNotifications.ts
import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { useToast } from 'sed-notifications-frontend';

export function useTaskNotifications() {
  const { notifications } = useNotificationStore();
  const { showToast } = useToast();
  
  useEffect(() => {
    // Фильтровать уведомления о задачах
    const taskNotifications = notifications.filter(n => 
      n.type === 'TaskAssigned' || n.type === 'TaskCompleted'
    );
    
    // Показать toast для новых уведомлений
    taskNotifications.forEach(notification => {
      if (!notification.read) {
        showToast({
          title: notification.title,
          message: notification.content,
          type: 'info',
          duration: 5000,
        });
      }
    });
  }, [notifications]);
}
```

---

## Troubleshooting

### Backend проблемы

**Проблема:** Уведомления не отправляются

**Решение:**
1. Проверьте логи: `dotnet run --project src/NotificationService.Api`
2. Убедитесь, что SMTP настройки корректны
3. Проверьте, что получатель имеет email

**Проблема:** SignalR не подключается

**Решение:**
1. Проверьте CORS настройки
2. Убедитесь, что Hub URL корректен
3. Проверьте логи браузера на ошибки

### Frontend проблемы

**Проблема:** Компоненты не отображаются

**Решение:**
1. Убедитесь, что CSS импортирован
2. Проверьте версию React (требуется 18+)
3. Проверьте console на ошибки

---

## Следующие шаги

1. Протестируйте интеграцию в development окружении
2. Настройте production конфигурацию
3. Разверните на выбранной платформе
4. Настройте мониторинг и логирование
5. Проведите load testing

Для дополнительной помощи обращайтесь к [документации](./README.md) или создавайте issue в репозитории.

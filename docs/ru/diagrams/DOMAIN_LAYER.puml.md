@startuml Domain Layer
!theme plain
skinparam backgroundColor #FEFEFE
skinparam classBackgroundColor #E8F5E9
skinparam classBorderColor #2E7D32

title Domain Layer - Core Business Logic

package "Models" {
    class Notification {
        - Id: Guid
        - Title: string
        - Message: string
        - Route: string
        - CreatedAt: DateTime
        - Recipient: User
        - Template: NotificationTemplate
        - Metadata: List<NotificationMetadataField>
        - DeliveryChannelsState: List<NotificationChannelDeliveryStatus>
    }

    class User {
        - Id: Guid
        - Username: string
        - Email: string
        - PhoneNumber: string?
        - DeviceToken: string?
    }

    class NotificationTemplate {
        - Id: Guid
        - Name: string
        - Subject: string
        - Content: string
    }

    class NotificationMetadataField {
        - Id: Guid
        - Key: string
        - Value: string
        - Description: string?
    }

    class NotificationChannelDeliveryStatus {
        - Id: Guid
        - NotificationChannel: enum
        - DeliveryStatus: enum
    }

    class UserRoutePreference {
        - Id: Guid
        - UserId: Guid
        - Route: string
        - IsEnabled: bool
    }
}

package "Enums" {
    enum NotificationChannel {
        Email
        Sms
        Push
    }

    enum NotificationDeliveryStatus {
        Pending
        Sent
        Failed
        Skipped
    }
}

package "Interfaces" {
    interface INotificationRepository {
        + GetNotificationByIdAsync(id): Task<Notification?>
        + GetNotificationsForUserAsync(userId): Task<IReadOnlyCollection<Notification>>
        + GetNotificationsByStatusAsync(status): Task<IReadOnlyCollection<Notification>>
        + SaveNotificationsAsync(notifications): Task
        + UpdateNotificationsAsync(notifications): Task
    }

    interface IUserRepository {
        + GetUserByIdAsync(id): Task<User?>
        + GetAllUsersAsync(): Task<IReadOnlyCollection<User>>
        + SaveUsersAsync(users): Task
    }

    interface ITemplateRepository {
        + GetTemplateByNameAsync(name): Task<NotificationTemplate?>
        + GetAllTemplatesAsync(): Task<IReadOnlyCollection<NotificationTemplate>>
    }

    interface IEmailProvider {
        + SendEmailAsync(to, subject, body): Task<bool>
    }

    interface ISmsProvider {
        + SendSmsAsync(phoneNumber, message): Task<bool>
    }

    interface IPushNotificationProvider {
        + SendPushNotificationAsync(deviceToken, title, body): Task<bool>
    }

    interface INotificationRouteConfiguration {
        + RouteName: string
        + TemplateName: string
        + DefaultChannels: NotificationChannel[]
    }
}

Notification --> User
Notification --> NotificationTemplate
Notification --> NotificationMetadataField
Notification --> NotificationChannelDeliveryStatus
NotificationChannelDeliveryStatus --> NotificationChannel
NotificationChannelDeliveryStatus --> NotificationDeliveryStatus
UserRoutePreference --> User

@enduml

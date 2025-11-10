import {InAppNotificationData} from './NotificationsBar/types'
import {registerActionHandler} from "./NotificationsBar/notificationsActions";

// Mock data with actions
export const mockNotifications: InAppNotificationData[] = [
    {
        id: "1",
        title: 'Новый входящий документ',
        type: 'document',
        subType: 'Входящий документ',
        content: 'Поступил новый входящий документ от ООО "ТехноСервис"',
        author: 'Иван Петров',
        date: '2024-01-15T10:30:00',
        read: false,
        receiverId: 'user-764',
        url: '/documents/12345',
        actions: [
            {
                name: 'approve',
                label: 'Согласовать',
                url: 'appactions://approveDocument?docId=12345&userId=764'
            },
            {
                name: 'reject',
                label: 'Отклонить',
                url: 'appactions://rejectDocument?docId=12345&userId=764'
            }
        ],
        hashtags: ['документ', 'согласование', 'входящий'],
        parameters: [
            {
                key: 'documentNumber',
                value: 'ВХ-12345',
                description: 'Номер входящего документа'
            },
            {
                key: 'organizationName',
                value: 'ООО "ТехноСервис"',
                description: 'Наименование организации-отправителя'
            }
        ]
    },
    {
        id: "2",
        title: 'Задание на согласование',
        type: 'task',
        subType: 'Задание на согласование',
        content: 'Требуется ваше согласование по проекту приказа №45',
        author: 'Мария Сидорова',
        date: '2024-01-15T09:15:00',
        read: true,
        receiverId: 'user-764',
        url: '/tasks/67890',
        actions: [
            {
                name: 'completeTask',
                label: 'Выполнить задание',
                url: 'appactions://completeTask?taskId=67890&status=approved'
            }
        ],
        hashtags: ['задание', 'приказ', 'согласование'],
        parameters: [
            {
                key: 'taskId',
                value: '67890',
                description: 'Идентификатор задания'
            },
            {
                key: 'orderNumber',
                value: '№45',
                description: 'Номер приказа'
            },
            {
                key: 'priority',
                value: 'высокий',
                description: 'Приоритет задания'
            }
        ]
    },
    {
        id: "3",
        title: 'Системное обновление',
        type: 'system',
        subType: 'Системное уведомление',
        content: 'Планируется техническое обслуживание системы 16.01.2024 с 22:00 до 02:00',
        author: 'Система',
        date: '2024-01-14T18:00:00',
        read: false,
        receiverId: 'user-764',
        url: '/system/maintenance',
        actions: []
    },
    {
        id: "4",
        title: 'Служебная записка',
        type: 'document',
        subType: 'Служебная записка',
        content: 'Подана служебная записка на командировку в Москву',
        author: 'Алексей Козлов',
        date: '2024-01-14T16:45:00',
        read: false,
        receiverId: 'user-764',
        url: '/documents/54321',
        actions: [
            {
                name: 'signDocument',
                label: 'Подписать',
                url: 'appactions://signDocument?docId=54321&type=travel'
            },
            {
                name: 'requestInfo',
                label: 'Запросить информацию',
                url: 'appactions://requestAdditionalInfo?docId=54321'
            }
        ]
    },
    {
        id: "5",
        title: 'Встреча с клиентом',
        type: 'other',
        subType: 'Плановая встреча',
        content: 'Запланирована встреча с представителями компании "Ромашка" для обсуждения нового контракта',
        author: 'Ольга Новикова',
        date: '2024-01-15T14:00:00',
        read: false,
        receiverId: 'user-764',
        url: '/meetings/98765',
        actions: [
            {
                name: 'acceptMeeting',
                label: 'Принять приглашение',
                url: 'appactions://acceptMeeting?meetingId=98765'
            },
            {
                name: 'declineMeeting',
                label: 'Отклонить приглашение',
                url: 'appactions://declineMeeting?meetingId=98765'
            }
        ]
    },
    {
        id: "6",
        title: 'Напоминание о дедлайне',
        type: 'other',
        subType: 'Напоминание',
        content: 'Завтра истекает срок сдачи квартального отчета',
        author: 'Система',
        date: '2024-01-15T11:30:00',
        read: true,
        receiverId: 'user-764',
        url: '/reminders/11111',
        actions: [
            {
                name: 'postponeReminder',
                label: 'Отложить',
                url: 'appactions://postponeReminder?reminderId=11111'
            }
        ]
    },
    {
        id: "7",
        title: 'Новый проект',
        type: 'task',
        subType: 'Проект',
        content: 'Вам назначен новый проект "Модернизация CRM системы"',
        author: 'Елена Волкова',
        date: '2024-01-14T15:20:00',
        read: false,
        receiverId: 'user-764',
        url: '/projects/22222',
        actions: [
            {
                name: 'acceptProject',
                label: 'Принять проект',
                url: 'appactions://acceptProject?projectId=22222'
            },
            {
                name: 'declineProject',
                label: 'Отклонить проект',
                url: 'appactions://declineProject?projectId=22222'
            }
        ]
    },
    {
        id: "8",
        title: 'Договор на подпись',
        type: 'document',
        subType: 'Договор',
        content: 'Готов к подписанию договор с ООО "СтройМастер" на поставку оборудования',
        author: 'Дмитрий Соколов',
        date: '2024-01-13T13:45:00',
        read: false,
        receiverId: 'user-764',
        url: '/documents/33333',
        actions: [
            {
                name: 'signDocument',
                label: 'Подписать',
                url: 'appactions://signDocument?docId=33333&type=contract'
            },
            {
                name: 'viewDocument',
                label: 'Просмотреть',
                url: 'appactions://viewDocument?docId=33333'
            }
        ]
    },
    {
        id: "9",
        title: 'Изменение в расписании',
        type: 'system',
        subType: 'Изменение расписания',
        content: 'Встреча с руководством перенесена на 15:00',
        author: 'Система',
        date: '2024-01-15T09:00:00',
        read: true,
        receiverId: 'user-764',
        url: '/schedule/44444',
        actions: [
            {
                name: 'confirmSchedule',
                label: 'Подтвердить',
                url: 'appactions://confirmSchedule?scheduleId=44444'
            }
        ]
    },
    {
        id: "10",
        title: 'Запрос на отпуск',
        type: 'document',
        subType: 'Заявление',
        content: 'Подано заявление на отпуск с 25 января по 5 февраля',
        author: 'Анна Морозова',
        date: '2024-01-12T16:30:00',
        read: false,
        receiverId: 'user-764',
        url: '/documents/55555',
        actions: [
            {
                name: 'approveRequest',
                label: 'Утвердить',
                url: 'appactions://approveRequest?requestId=55555'
            },
            {
                name: 'rejectRequest',
                label: 'Отклонить',
                url: 'appactions://rejectRequest?requestId=55555'
            }
        ]
    },
    {
        id: "11",
        title: 'Техническая проблема',
        type: 'system',
        subType: 'Ошибка системы',
        content: 'Обнаружена проблема с доступом к серверу баз данных',
        author: 'ИТ-отдел',
        date: '2024-01-15T08:45:00',
        read: false,
        receiverId: 'user-764',
        url: '/issues/66666',
        actions: [
            {
                name: 'acknowledgeIssue',
                label: 'Принять к сведению',
                url: 'appactions://acknowledgeIssue?issueId=66666'
            }
        ]
    },
    {
        id: "12",
        title: 'Счет на оплату',
        type: 'document',
        subType: 'Счет',
        content: 'Поступил счет от поставщика "ПромТехника" на сумму 125 000 руб.',
        author: 'Бухгалтерия',
        date: '2024-01-14T11:20:00',
        read: false,
        receiverId: 'user-764',
        url: '/documents/77777',
        actions: [
            {
                name: 'payInvoice',
                label: 'Оплатить',
                url: 'appactions://payInvoice?invoiceId=77777'
            },
            {
                name: 'reviewInvoice',
                label: 'Проверить',
                url: 'appactions://reviewInvoice?invoiceId=77777'
            }
        ]
    },
    {
        id: "13",
        title: 'Обучение персонала',
        type: 'task',
        subType: 'Обучение',
        content: 'Запланировано обучение по работе с новой системой документооборота',
        author: 'HR отдел',
        date: '2024-01-15T12:00:00',
        read: true,
        receiverId: 'user-764',
        url: '/training/88888',
        actions: [
            {
                name: 'registerTraining',
                label: 'Записаться',
                url: 'appactions://registerTraining?trainingId=88888'
            }
        ]
    },
    {
        id: "14",
        title: 'Ежедневный отчет',
        type: 'other',
        subType: 'Напоминание',
        content: 'Не забудьте отправить ежедневный отчет о проделанной работе',
        author: 'Система',
        date: '2024-01-15T17:30:00',
        read: false,
        receiverId: 'user-764',
        url: '/reminders/99999',
        actions: [
            {
                name: 'sendReport',
                label: 'Отправить отчет',
                url: 'appactions://sendReport?reportId=99999'
            }
        ]
    },
    {
        id: "15",
        title: 'Проверка безопасности',
        type: 'system',
        subType: 'Безопасность',
        content: 'Требуется смена пароля для доступа к системе',
        author: 'Система безопасности',
        date: '2024-01-14T14:15:00',
        read: false,
        receiverId: 'user-764',
        url: '/security/10101',
        actions: [
            {
                name: 'changePassword',
                label: 'Сменить пароль',
                url: 'appactions://changePassword?userId=764'
            }
        ]
    },
    {
        id: "16",
        title: 'Новый заказ',
        type: 'document',
        subType: 'Заказ',
        content: 'Поступил новый заказ от клиента "Альфа" на поставку продукции',
        author: 'Отдел продаж',
        date: '2024-01-15T10:00:00',
        read: false,
        receiverId: 'user-764',
        url: '/orders/20202',
        actions: [
            {
                name: 'processOrder',
                label: 'Обработать',
                url: 'appactions://processOrder?orderId=20202'
            },
            {
                name: 'delegateOrder',
                label: 'Делегировать',
                url: 'appactions://delegateOrder?orderId=20202'
            }
        ]
    },
    {
        id: "17",
        title: 'Видео-конференция',
        type: 'other',
        subType: 'Онлайн-встреча',
        content: 'Запланирована видео-конференция с партнерами из г. Санкт-Петербург',
        author: 'Сергей Васильев',
        date: '2024-01-16T11:00:00',
        read: false,
        receiverId: 'user-764',
        url: '/meetings/30303',
        actions: [
            {
                name: 'joinMeeting',
                label: 'Присоединиться',
                url: 'appactions://joinMeeting?meetingId=30303'
            },
            {
                name: 'rescheduleMeeting',
                label: 'Перенести',
                url: 'appactions://rescheduleMeeting?meetingId=30303'
            }
        ]
    },
    {
        id: "18",
        title: 'Резервное копирование',
        type: 'system',
        subType: 'Обслуживание',
        content: 'Завершено резервное копирование данных за январь',
        author: 'Система',
        date: '2024-01-15T20:00:00',
        read: true,
        receiverId: 'user-764',
        url: '/backup/40404',
        actions: []
    },
    {
        id: "19",
        title: 'Отзыв о работе',
        type: 'document',
        subType: 'Отзыв',
        content: 'Получен положительный отзыв от клиента ООО "ТехноСтрой" о выполненной работе',
        author: 'Мария Иванова',
        date: '2024-01-14T09:30:00',
        read: false,
        receiverId: 'user-764',
        url: '/reviews/50505',
        actions: [
            {
                name: 'viewReview',
                label: 'Просмотреть отзыв',
                url: 'appactions://viewReview?reviewId=50505'
            },
            {
                name: 'shareReview',
                label: 'Поделиться',
                url: 'appactions://shareReview?reviewId=50505'
            }
        ]
    }
];


// Register some example action handlers
registerActionHandler('approveDocument', (params) => {
    console.log(`Document ${params.docId} approved by user ${params.userId}`);
});

registerActionHandler('rejectDocument', (params) => {
    console.log(`Document ${params.docId} rejected by user ${params.userId}`);
});

registerActionHandler('completeTask', (params) => {
    console.log(`Task ${params.taskId} completed with status: ${params.status}`);
});

registerActionHandler('signDocument', (params) => {
    console.log(`Document ${params.docId} signed (type: ${params.type})`);
});

registerActionHandler('requestAdditionalInfo', (params) => {
    console.log(`Additional info requested for document ${params.docId}`);
});

registerActionHandler('acceptMeeting', (params) => {
    console.log(`Meeting ${params.meetingId} accepted`);
});

registerActionHandler('declineMeeting', (params) => {
    console.log(`Meeting ${params.meetingId} declined`);
});

registerActionHandler('postponeReminder', (params) => {
    console.log(`Reminder ${params.reminderId} postponed`);
});

registerActionHandler('acceptProject', (params) => {
    console.log(`Project ${params.projectId} accepted`);
});

registerActionHandler('declineProject', (params) => {
    console.log(`Project ${params.projectId} declined`);
});

registerActionHandler('viewDocument', (params) => {
    console.log(`Document viewed ${params.docId}`);
});

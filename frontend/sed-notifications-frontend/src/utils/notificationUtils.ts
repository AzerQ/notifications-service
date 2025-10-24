import React from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  FileText,
  Info,
  XCircle,
  User,
  Settings,
  Mail,
  Calendar,
  Shield,
  Zap
} from 'lucide-react';
import { NotificationType } from '../NotificationsBar/types';

export interface IconConfig {
  icon: React.ComponentType<any>;
  className: string;
}

export interface TypeIconMapping {
  [key: string]: {
    default: IconConfig;
    subtypes?: {
      [subtype: string]: IconConfig;
    };
  };
}

// Конфигурация иконок для разных типов и подтипов уведомлений
export const ICON_MAPPING: TypeIconMapping = {
  system: {
    default: { icon: Settings, className: 'text-gray-500' },
    subtypes: {
      update: { icon: Zap, className: 'text-blue-500' },
      maintenance: { icon: Settings, className: 'text-orange-500' },
      security: { icon: Shield, className: 'text-red-500' }
    }
  },
  task: {
    default: { icon: CheckCircle, className: 'text-blue-500' },
    subtypes: {
      deadline: { icon: Calendar, className: 'text-red-500' },
      assignment: { icon: FileText, className: 'text-blue-500' },
      approval: { icon: CheckCircle, className: 'text-green-500' },
      'Задание на согласование': { icon: CheckCircle, className: 'text-green-500' },
      'Обучение': { icon: FileText, className: 'text-purple-500' }
    }
  },
  document: {
    default: { icon: FileText, className: 'text-blue-500' },
    subtypes: {
      'Входящий документ': { icon: FileText, className: 'text-blue-500' },
      'Служебная записка': { icon: FileText, className: 'text-orange-500' },
      'Договор': { icon: FileText, className: 'text-green-500' },
      'Счет': { icon: FileText, className: 'text-yellow-500' },
      'Заказ': { icon: FileText, className: 'text-purple-500' }
    }
  },
  message: {
    default: { icon: Mail, className: 'text-blue-500' },
    subtypes: {
      direct: { icon: User, className: 'text-purple-500' },
      group: { icon: Mail, className: 'text-blue-500' }
    }
  },
  alert: {
    default: { icon: AlertCircle, className: 'text-yellow-500' },
    subtypes: {
      warning: { icon: AlertCircle, className: 'text-yellow-500' },
      error: { icon: XCircle, className: 'text-red-500' },
      success: { icon: CheckCircle, className: 'text-green-500' },
      info: { icon: Info, className: 'text-blue-500' }
    }
  },
  other: {
    default: { icon: Bell, className: 'text-gray-500' },
    subtypes: {
      'Напоминание': { icon: Calendar, className: 'text-yellow-500' },
      'Плановая встреча': { icon: Calendar, className: 'text-blue-500' },
      'Онлайн-встреча': { icon: Calendar, className: 'text-green-500' }
    }
  }
};

// Цветовые схемы для типов уведомлений
export const TYPE_COLOR_MAPPING: { [key in NotificationType]: string } = {
  document: 'bg-blue-100 text-blue-800 border-blue-200',
  task: 'bg-green-100 text-green-800 border-green-200',
  system: 'bg-purple-100 text-purple-800 border-purple-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
};

/**
 * Получить иконку для типа и подтипа уведомления
 */
export const getNotificationIcon = (
  type: string, 
  subtype?: string, 
  size: 'sm' | 'md' | 'lg' = 'md'
): React.ReactElement => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const mapping = ICON_MAPPING[type];
  if (!mapping) {
    const IconComponent = Bell;
    const className = sizeClasses[size] + ' text-gray-500 flex-shrink-0';
    return React.createElement(IconComponent, { className });
  }

  let config = mapping.default;
  if (subtype && mapping.subtypes?.[subtype]) {
    config = mapping.subtypes[subtype];
  }

  const IconComponent = config.icon;
  const className = sizeClasses[size] + ' ' + config.className + ' flex-shrink-0';
  return React.createElement(IconComponent, { className });
};

/**
 * Получить цветовые классы для типа уведомления
 */
export const getNotificationTypeColorClass = (type: NotificationType): string => {
  return TYPE_COLOR_MAPPING[type] || TYPE_COLOR_MAPPING.other;
};

/**
 * Форматирование даты для отображения
 */
export const formatNotificationDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Форматирование времени в относительном формате (например, "2 часа назад")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'только что';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ч назад`;
  } else if (diffInDays < 7) {
    return `${diffInDays} д назад`;
  } else {
    return formatNotificationDate(dateString);
  }
};
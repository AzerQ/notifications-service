// Вспомогательные функции
import {NotificationType} from "./types";
import {AlertCircle, Bell, CheckCircle, FileText} from "lucide-react";

export const getTypeIcon = (type: NotificationType) => {
    switch (type) {
        case 'document':
            return <FileText className="w-5 h-5" />;
        case 'task':
            return <CheckCircle className="w-5 h-5" />;
        case 'system':
            return <AlertCircle className="w-5 h-5" />;
        default:
            return <Bell className="w-5 h-5" />;
    }
};

export const getTypeColorClass = (type: NotificationType): string => {
    switch (type) {
        case 'document':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'task':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'system':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
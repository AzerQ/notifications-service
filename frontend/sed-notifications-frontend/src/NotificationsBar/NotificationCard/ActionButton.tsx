// Action Button Component
import React from "react";
import {ToastConfig} from "../types";
import {executeNotificationAction} from "../notificationsActions";
import {NotificationAction} from '../types';

export const ActionButton: React.FC<{
    action: NotificationAction;
    variant?: 'primary' | 'secondary';
    notificationId: number;
    onActionComplete: (id: number) => void;
    showToast: (toast: ToastConfig) => void;

}> = ({action, variant = 'secondary', notificationId, onActionComplete, showToast}) => {
    const handleClick = () => {
        executeNotificationAction(action.url, notificationId, true, onActionComplete, showToast);
    };

    const baseClasses = "px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200";

    const variantClasses = variant === 'primary'
        ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2";

    return (
        <button
            onClick={handleClick}
            className={`${baseClasses} ${variantClasses}`}
        >
            {action.label}
        </button>
    );
};
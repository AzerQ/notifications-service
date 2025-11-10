// Компоненты
import React from "react";
import {InAppNotificationData, ToastConfig} from "../types";
import {Calendar, Eye, EyeOff, User} from "lucide-react";
import {NotificationActionsDropdown} from "./NotificationActionsDropdown";
import {ActionButton} from "./ActionButton";
import {formatNotificationDate, getNotificationTypeColorClass, getNotificationIcon} from "../../utils/notificationUtils";

export const NotificationCard: React.FC<{
    notification: InAppNotificationData;
    onToggleRead: (id: string) => void;
    onToggleStar: (id: string) => void;
    onActionComplete: (id: string) => void;
    showToast: (toast: ToastConfig) => void;
    onNotificationClick?: (id: string) => void;
}> = ({notification, onToggleRead, onToggleStar, onActionComplete, showToast, onNotificationClick}) => {
    const handleNotificationClick = () => {
        if (!notification.read) {
            onNotificationClick?.call(null,notification.id);
        }
    };

    const hasAdditionalActions = notification.actions && notification.actions.length > 0;

    return (
        <div
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer ${
                notification.read ? 'bg-white border-gray-200' : 'bg-blue-100 border-blue-300'
            }`}
            onClick={handleNotificationClick}
            data-testid="notification-card"
            data-notification-id={notification.id}
            data-notification-type={notification.type}
            data-notification-subtype={notification.subType}
            data-notification-read={notification.read}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                    <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getNotificationTypeColorClass(notification.type || '')}`}
                        data-testid="notification-card-icon"
                    >
                        {getNotificationIcon(notification.type || '', notification.subType || '', 'md', notification.icon)}
                    </div>
                    <div className="flex-1 min-w-0" data-testid="notification-card-content">
                        <div className="flex items-center justify-between mb-2" data-testid="notification-card-header">
                            <h3 className={`font-semibold text-gray-900 ${!notification.read ? 'font-bold' : ''}`} data-testid="notification-card-title">
                                {notification.title}
                            </h3>
                            <div className="flex items-center space-x-2" data-testid="notification-card-actions">
                                {hasAdditionalActions && (
                                    <NotificationActionsDropdown
                                        actions={notification.actions || []}
                                        notificationId={notification.id}
                                        onActionComplete={onActionComplete}
                                        showToast={showToast}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 mb-2" data-testid="notification-card-type">
              <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getNotificationTypeColorClass(notification.type || '')}`}
                  data-testid="notification-card-subtype-badge"
              >
                {notification.subType || ''}
              </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2" data-testid="notification-card-description">
                            {notification.content}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500" data-testid="notification-card-footer">
                            <div className="flex items-center space-x-4" data-testid="notification-card-metadata">
                                <div className="flex items-center space-x-1" data-testid="notification-card-author">
                                    <User className="w-3 h-3"/>
                                    <span>{notification.author || ''}</span>
                                </div>
                                <div className="flex items-center space-x-1" data-testid="notification-card-date">
                                    <Calendar className="w-3 h-3"/>
                                    <span>{formatNotificationDate(notification.date)}</span>
                                </div>
                            </div>

                        </div>

                        {/* Additional action buttons for mobile/small screens */}
                        {hasAdditionalActions && (
                            <div className="mt-3 flex flex-wrap gap-2 md:hidden" data-testid="notification-card-mobile-actions">
                                {(notification.actions || []).slice(0, 2).map((action, index) => (
                                    <ActionButton
                                        key={index}
                                        action={action}
                                        variant="secondary"
                                        notificationId={notification.id}
                                        onActionComplete={onActionComplete}
                                        showToast={showToast}
                                    />
                                ))}
                                {(notification.actions || []).length > 2 && (
                                    <button
                                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        data-testid="notification-card-more-actions-button"
                                    >
                                        +{(notification.actions || []).length - 2}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4" data-testid="notification-card-side-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleRead(notification.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title={notification.read ? 'Отметить как непрочитанное' : 'Отметить как прочитанное'}
                        data-testid="notification-card-read-toggle-button"
                    >
                        {notification.read ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                </div>
            </div>

            {/* Additional action buttons for desktop */}
            {hasAdditionalActions && (
                <div className="mt-4 hidden md:flex flex-wrap gap-2" data-testid="notification-card-desktop-actions">
                    {(notification.actions || []).map((action, index) => (
                        <ActionButton
                            key={index}
                            action={action}
                            variant="secondary"
                            notificationId={notification.id}
                            onActionComplete={onActionComplete}
                            showToast={showToast}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
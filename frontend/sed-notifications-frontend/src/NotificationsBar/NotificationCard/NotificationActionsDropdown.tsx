// Notification Actions Dropdown
import React, {useEffect, useRef, useState} from "react";
import {NotificationAction, ToastConfig} from "../types";
import {MoreHorizontal} from "lucide-react";
import {executeNotificationAction} from "../notificationsActions";

export const NotificationActionsDropdown: React.FC<{
    actions: NotificationAction[];
    notificationId: string;
    onActionComplete: (id: string) => void;
    showToast: (toast: ToastConfig) => void;
}> = ({actions, notificationId, onActionComplete, showToast}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (actions.length === 0) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="Дополнительные действия"
            >
                <MoreHorizontal className="w-4 h-4"/>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    executeNotificationAction(action.url, notificationId, true, onActionComplete, showToast);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
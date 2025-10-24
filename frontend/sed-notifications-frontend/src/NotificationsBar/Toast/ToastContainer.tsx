// Toast Container Component - single fixed container with stacked toasts
import React from "react";
import {ToastNotification} from "./ToastNotification";
import {Toast} from "../types";

export const ToastContainer: React.FC<{
    toasts: Toast[];
    position: 'top' | 'bottom';
    onClose: (id: number) => void;
}> = ({toasts, position, onClose}) => {
    if (toasts.length === 0) return null;

    const containerClasses = position === 'top'
        ? 'fixed top-4 right-4 z-50'
        : 'fixed bottom-4 right-4 z-50';

    return (
        <div className={containerClasses} data-testid="toast-container" data-position={position}>
            {toasts.map(toast => (
                <ToastNotification
                    key={toast.id}
                    {...toast}
                    onClose={onClose}
                />
            ))}
        </div>
    );
};
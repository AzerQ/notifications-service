// Toast Provider Component
import React, {useRef, useState} from "react";
import {ToastContainer} from "./ToastContainer";
import {Toast, ToastConfig} from "../types";

export const ToastProvider: React.FC<{
    children: (props: {
        showToast: (toast: ToastConfig) => void;
        testToasts: () => void;
        togglePosition: () => void;
        position: 'top' | 'bottom';
    }) => React.ReactNode
}> = ({children}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastIdRef = useRef(0);
    const [position, setPosition] = useState<'top' | 'bottom'>('top');

    const showToast = (toastConfig: ToastConfig) => {
        const id = toastIdRef.current++;
        setToasts(prev => [...prev, {...toastConfig, id}]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const testToasts = () => {
        showToast({
            title: 'Успех!',
            message: 'Документ успешно согласован',
            type: 'success',
            actionUrl: 'https://google.com'
        });

        setTimeout(() => {
            showToast({
                title: 'Предупреждение',
                message: 'Срок выполнения задания истекает через 2 часа',
                type: 'warning'
            });
        }, 1000);

        setTimeout(() => {
            showToast({
                title: 'Ошибка',
                message: 'Не удалось подключиться к серверу',
                type: 'error'
            });
        }, 2000);

        setTimeout(() => {
            showToast({
                title: 'Информация',
                message: 'Новое системное обновление доступно',
                type: 'info'
            });
        }, 3000);
    };

    const togglePosition = () => {
        setPosition(prev => prev === 'top' ? 'bottom' : 'top');
    };

    return (
        <div className="relative">
            {children({showToast, testToasts, togglePosition, position})}
            <ToastContainer
                toasts={toasts}
                position={position}
                onClose={removeToast}
            />
        </div>
    );
};
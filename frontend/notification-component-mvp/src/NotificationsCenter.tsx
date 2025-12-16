import React from "react";
import {useNotificationStore} from "./hooks/useNotificationStore.ts";
import {config, NotificationComponent} from "./index.ts";
import {NotificationProvider} from "./components/NotificationContext.tsx";
import ReactDOM from "react-dom/client";

export const NotificationsCenter: React.FC = () => {
    const { store, authentication, isStoreInitialized } = useNotificationStore(config);
    return (
        <NotificationProvider value={{ store, authentication, isStoreInitialized }}>
            <NotificationComponent
                showPreferencesButton={true}
            />
        </NotificationProvider>
    );
};

export function RenderNotificationsCenter(cssSelector: string) {
    const container = document.querySelector(cssSelector) as HTMLElement;
    ReactDOM.createRoot(container).render(
        <React.StrictMode>
            <NotificationsCenter />
        </React.StrictMode>,
    );
}
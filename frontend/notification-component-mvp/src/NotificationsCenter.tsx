import React from "react";
import {useNotificationStore} from "./hooks/useNotificationStore.ts";
import {config, NotificationComponent} from "./index.ts";
import {NotificationProvider} from "./components/NotificationContext.tsx";
import ReactDOM from "react-dom/client";
import CSSWrapper from "./CSSWrapper.tsx";

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

export function RenderNotificationsCenter(cssSelector: string,  useShadowDom: bool = true) {
    const container = document.querySelector(cssSelector) as HTMLElement;
    const stylesPath: string = location.origin + import.meta.env.VITE_STYLES_PATH;

    ReactDOM.createRoot(container).render(
        <React.StrictMode>
            {
                useShadowDom ?
                    <CSSWrapper cssHref={stylesPath}>
                        <NotificationsCenter />
                    </CSSWrapper> :
                    <NotificationsCenter />
            }
            </React.StrictMode>
        ,
    );
}
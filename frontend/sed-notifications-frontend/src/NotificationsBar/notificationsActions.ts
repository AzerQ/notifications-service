// Action handlers registry
import { ToastConfig } from "./types";

const actionHandlers = new Map<
  string,
  (params: Record<string, string>) => void
>();

// Register default action handlers
export const registerActionHandler = (
  actionName: string,
  handler: (params: Record<string, string>) => void
) => {
  actionHandlers.set(actionName, handler);
};

export const tryExecuteAppAction = (url: string): [boolean, string] => {
  try {
    if (!url.startsWith("appactions://")) {
      throw new Error("Invalid action URL format");
    }

    const urlWithoutProtocol = url.replace("appactions://", "");
    const [actionName, paramsString] = urlWithoutProtocol.split("?");

    if (!actionHandlers.has(actionName)) {
      return [false, "Действие не найдено!"];
    }

    const params: Record<string, string> = {};
    if (paramsString) {
      paramsString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      });
    }

    const handler = actionHandlers.get(actionName)!;
    handler(params);
    return [true, actionName];
  } catch (error) {
    console.error("Error executing action:", error);
    return [false, "Ошибка при выполнении действия!"];
  }
};

// Execute action with automatic read marking
export const executeNotificationAction = (
  url: string,
  notificationId: string,
  markAsRead: boolean,
  onActionComplete: (id: string) => void,
  showToast: (toast: ToastConfig) => void
) => {
  const [success, actionName] = tryExecuteAppAction(url);
  if (success) {
    // Show success toast
    showToast({
      title: "Успех",
      message: `Действие "${actionName}" выполнено успешно`,
      type: "success",
    });
    // Mark notification as read after successful action execution
    if (markAsRead && onActionComplete) {
      onActionComplete(notificationId);
    }
  } else {
    showToast({
      title: "Ошибка",
      message: actionName,
      type: "error",
    });
  }
};

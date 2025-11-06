import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/RootStore';
import { notificationApi } from '../services/api';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const SendNotificationForm: React.FC = observer(() => {
  const { authStore } = useStores();
  const [notificationType, setNotificationType] = useState('UserRegistered');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authStore.user) return;

    setSending(true);
    setMessage(null);

    try {
      let parameters: any = {};

      switch (notificationType) {
        case 'UserRegistered':
          parameters = {
            UserId: authStore.user.id,
            WelcomeMessage: `Welcome ${authStore.user.name}! You've successfully registered.`
          };
          break;
        case 'OrderCreated':
          parameters = {
            CustomerId: authStore.user.id,
            OrderNumber: `ORD-${Date.now()}`,
            OrderTotal: 299.99,
            ItemCount: 3
          };
          break;
        case 'TaskAssigned':
          parameters = {
            AssigneeId: authStore.user.id,
            AssignerId: authStore.user.id,
            TaskTitle: 'Review notification showcase',
            TaskDescription: 'Please review the new notification showcase application',
            Priority: 'High',
            DueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          };
          break;
      }

      const routesMap = new Map<string, string>(
        [
          ["UserRegistered","User/UserRegistered"],
          ["OrderCreated","Order/OrderCreated"],
          ["TaskAssigned","Task/TaskAssigned"],
        ]
      ) 
      await notificationApi.send({
        route: routesMap.get(notificationType) ?? "User/UserRegistered",
        data: parameters
      });

      setMessage({ type: 'success', text: 'Notification sent successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send notification' });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notification Type
        </label>
        <select
          className="input"
          value={notificationType}
          onChange={(e) => setNotificationType(e.target.value)}
        >
          <option value="UserRegistered">User Registered</option>
          <option value="OrderCreated">Order Created</option>
          <option value="TaskAssigned">Task Assigned</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select a notification template to test
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center space-x-2 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">About this notification:</h4>
        <p className="text-sm text-blue-800">
          {notificationType === 'UserRegistered' && 'Sends a welcome notification to a newly registered user.'}
          {notificationType === 'OrderCreated' && 'Sends an order confirmation with order details.'}
          {notificationType === 'TaskAssigned' && 'Notifies a user about a newly assigned task.'}
        </p>
      </div>

      <button
        type="submit"
        className="btn-primary w-full flex items-center justify-center space-x-2"
        disabled={sending}
      >
        <Send className="w-5 h-5" />
        <span>{sending ? 'Sending...' : 'Send Notification'}</span>
      </button>
    </form>
  );
});

export default SendNotificationForm;

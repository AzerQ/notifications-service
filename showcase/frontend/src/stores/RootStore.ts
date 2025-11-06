import React from 'react';
import { AuthStore } from './AuthStore';
import { NotificationStore } from './NotificationStore';
import { setupAuthInterceptor } from '../services/api';

export class RootStore {
  authStore: AuthStore;
  notificationStore: NotificationStore;

  constructor() {
    this.authStore = new AuthStore();
    this.notificationStore = new NotificationStore();
    
    // Настраиваем интерсептор аутентификации после создания authStore
    setupAuthInterceptor(this.authStore);
  }
}

const rootStore = new RootStore();

const StoreContext = React.createContext(rootStore);

export const useStores = () => React.useContext(StoreContext);

export default rootStore;

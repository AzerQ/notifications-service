import React from 'react';
import { AuthStore } from './AuthStore';
import { NotificationStore } from './NotificationStore';

export class RootStore {
  authStore: AuthStore;
  notificationStore: NotificationStore;

  constructor() {
    this.authStore = new AuthStore();
    this.notificationStore = new NotificationStore();
  }
}

const rootStore = new RootStore();

const StoreContext = React.createContext(rootStore);

export const useStores = () => React.useContext(StoreContext);

export default rootStore;

import React, {useMemo, useState} from 'react';
import { Search, RefreshCw} from 'lucide-react';
import { observer } from 'mobx-react-lite';
import {NotificationFilters} from "./NotificationFilters";
import {NotificationSort} from "./NotificationSort";
import {Filters, Preset, ToastConfig, SortOption} from "./types";
import {ToastProvider} from "./Toast/ToastProvider";
import {InAppNotificationData} from './types';
import {NotificationCard} from "./NotificationCard/NotificationCard";
import {Pagination} from "./Pagination";
import { useNotificationStore } from '../store/NotificationStoreContext';

export const NotificationsBar: React.FC<{
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
}> = observer(({
  showFilters = true,
  showSearch = true,
  showPagination = true
}) => {
  const store = useNotificationStore();
  
  return (
    <ToastProvider>
      {({ showToast }) => (
        <NotificationsBarContent
          showToast={showToast}
          store={store}
          showFilters={showFilters}
          showSearch={showSearch}
          showPagination={showPagination}
        />
      )}
    </ToastProvider>
  );
});

const NotificationsBarContent: React.FC<{
  showToast: (toast: ToastConfig) => void;
  store: any;
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
}> = observer(({
  showToast,
  store,
  showFilters = true,
  showSearch = true,
  showPagination = true
}) => {
  const [filters, setFilters] = useState<Filters>({
    type: '',
    subtype: '',
    status: '',
    author: ''
  });
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'date',
    order: 'desc'
  });
  const [presets, setPresets] = useState<Preset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const toggleRead = async (id: string) => {
    await store.markAsRead(id);
  };

  const markNotificationAsRead = async (id: string) => {
    await store.markAsRead(id);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleReload = async () => {
    if (isReloading || !store.reloadNotifications) return;
    
    setIsReloading(true);
    try {
      await store.reloadNotifications();
      showToast({
        title: 'Успех',
        message: 'Уведомления перезагружены',
        type: 'success'
      });
    } catch (error) {
      showToast({
        title: 'Ошибка',
        message: 'Ошибка при перезагрузке уведомлений',
        type: 'error'
      });
    } finally {
      setIsReloading(false);
    }
  };

  const savePreset = (presetName: string) => {
    const newPreset: Preset = { name: presetName, filters: { ...filters, search: searchTerm } };
    setPresets(prev => [...prev, newPreset]);
    showToast({
      title: 'Успех',
      message: `Пресет "${presetName}" сохранен`,
      type: 'success'
    });
  };

  const applyPreset = (preset: Preset) => {
    setFilters(preset.filters);
    setSearchTerm(preset.filters.search || '');
  };

  const filteredNotifications = useMemo(() => {
    const notifications = store.notifications || [];
    
    // Apply filters
    const filtered = notifications.filter((notification: InAppNotificationData) => {
      // Apply search filter
      if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !notification.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply type filter
      if (filters.type && notification.type !== filters.type) {
        return false;
      }
      
      // Apply subtype filter
      if (filters.subtype && notification.subType !== filters.subtype) {
        return false;
      }
      
      // Apply status filter
      if (filters.status === 'unread' && notification.read) {
        return false;
      }
      if (filters.status === 'read' && !notification.read) {
        return false;
      }
      
      // Apply author filter
      if (filters.author && (notification.author || '') !== filters.author) {
        return false;
      }
      
      return true;
    });

    // Apply sorting
    return filtered.sort((a: InAppNotificationData, b: InAppNotificationData) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortOption.field) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = (a.author || '').toLowerCase();
          bValue = (b.author || '').toLowerCase();
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOption.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [store.notifications, filters, searchTerm, sortOption]);

  const unreadCount = (store.notifications || []).filter((n: InAppNotificationData) => !n.read).length;

  // Component for rendering notifications list
  const NotificationsList: React.FC<{
    notifications: InAppNotificationData[];
    title?: string;
    emptyMessage?: string;
  }> = ({ notifications, title, emptyMessage }) => (
    <div className="mb-8" data-testid="notifications-list" data-section={title?.includes('Избранные') ? 'starred' : 'regular'}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center" data-testid="notifications-list-title">
          {title}
          <span className="ml-2 bg-gray-100 text-gray-600 text-sm font-medium px-2.5 py-0.5 rounded-full" data-testid="notifications-list-count">
            {notifications.length}
          </span>
        </h2>
      )}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" data-testid="notifications-list-grid">
        {notifications.length === 0 ? (
          emptyMessage && (
            <div className="col-span-full text-center py-8" data-testid="notifications-list-empty">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          )
        ) : (
          notifications.map(notification => (
            <div key={notification.id} className="h-full" data-testid="notifications-list-item">
              <NotificationCard
                notification={notification}
                onToggleRead={toggleRead}
                onToggleStar={toggleRead}
                onActionComplete={markNotificationAsRead}
                showToast={showToast}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col" data-testid="notifications-bar">
      {/* Controls Section */}
      <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0" data-testid="notifications-bar-controls">
        {/* Search Bar */}
        <div className="mb-4" data-testid="notifications-bar-search-section">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск по уведомлениям..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="notifications-bar-search-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between" data-testid="notifications-bar-actions">
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full" data-testid="notifications-bar-unread-count">
                {unreadCount} непрочитанных
              </span>
            )}
          </div>
          <button
            onClick={handleReload}
            disabled={isReloading || store.isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            data-testid="notifications-bar-reload-button"
            title="Перезагрузить уведомления"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Обновить</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <NotificationFilters
            notifications={store.notifications || []}
            filters={filters}
            onFilterChange={handleFilterChange}
            onSavePreset={openModal}
            presets={presets}
            onApplyPreset={applyPreset}
            isModalOpen={isModalOpen}
            onModalOpen={openModal}
            onModalClose={closeModal}
            onModalSave={savePreset}
          />

          <NotificationSort
            sortOption={sortOption}
            onSortChange={handleSortChange}
          />
        </div>
      )}

      {/* Notifications Content */}
      <div className="flex-1 overflow-y-auto p-6" data-testid="notifications-bar-content">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12" data-testid="notifications-bar-empty-state">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Уведомления не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить фильтры или выполнить поиск</p>
          </div>
        ) : (
          <NotificationsList
            notifications={filteredNotifications}
            title="📋 Уведомления"
          />
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
        <Pagination
          currentPage={store.currentPage}
          totalPages={store.totalPages}
          pageSize={store.pageSize}
          onPageChange={store.setPage.bind(store)}
          onPageSizeChange={store.setPageSize.bind(store)}
          isLoading={store.isLoading}
        />
      )}
    </div>
  );
});

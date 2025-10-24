/**
 * Hook for dynamic notification filtering
 * Provides a flexible API for filtering notifications without hardcoded filters
 */

import { useState, useMemo } from 'react';
import { BaseNotification } from '../models/Notification';
import {
  NotificationFilter,
  filterNotifications,
  searchNotifications,
  filterByType,
  filterByAuthor,
  filterByHashtag,
  filterByDateRange,
  filterByReadStatus
} from '../models/NotificationFilter';

export interface UseNotificationFiltersOptions {
  initialFilters?: NotificationFilter[];
  initialSearchText?: string;
}

export interface UseNotificationFiltersReturn {
  // Current filters
  filters: NotificationFilter[];
  searchText: string;
  
  // Filter actions
  addFilter: (filter: NotificationFilter) => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;
  setSearchText: (text: string) => void;
  
  // Helper methods for common filters
  filterByType: (type: string) => void;
  filterByAuthor: (author: string) => void;
  filterByHashtag: (hashtag: string) => void;
  filterByDateRange: (from?: string, to?: string) => void;
  filterByReadStatus: (read: boolean) => void;
  
  // Apply filters to notifications
  applyFilters: (notifications: BaseNotification[]) => BaseNotification[];
}

/**
 * Hook for managing dynamic notification filters
 */
export function useNotificationFilters(
  options: UseNotificationFiltersOptions = {}
): UseNotificationFiltersReturn {
  const [filters, setFilters] = useState<NotificationFilter[]>(
    options.initialFilters || []
  );
  const [searchText, setSearchTextState] = useState<string>(
    options.initialSearchText || ''
  );

  // Add a new filter
  const addFilter = (filter: NotificationFilter) => {
    setFilters(prev => [...prev, filter]);
  };

  // Remove a filter by index
  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters([]);
    setSearchTextState('');
  };

  // Helper methods for common filter types
  const addTypeFilter = (type: string) => {
    addFilter(filterByType(type));
  };

  const addAuthorFilter = (author: string) => {
    addFilter(filterByAuthor(author));
  };

  const addHashtagFilter = (hashtag: string) => {
    addFilter(filterByHashtag(hashtag));
  };

  const addDateRangeFilter = (from?: string, to?: string) => {
    addFilter(filterByDateRange(from, to));
  };

  const addReadStatusFilter = (read: boolean) => {
    addFilter(filterByReadStatus(read));
  };

  // Apply all filters and search to notifications
  const applyFilters = useMemo(
    () => (notifications: BaseNotification[]): BaseNotification[] => {
      // First apply filters
      let filtered = filterNotifications(notifications, filters);
      
      // Then apply search
      if (searchText.trim()) {
        filtered = searchNotifications(filtered, searchText);
      }
      
      return filtered;
    },
    [filters, searchText]
  );

  return {
    filters,
    searchText,
    addFilter,
    removeFilter,
    clearFilters,
    setSearchText: setSearchTextState,
    filterByType: addTypeFilter,
    filterByAuthor: addAuthorFilter,
    filterByHashtag: addHashtagFilter,
    filterByDateRange: addDateRangeFilter,
    filterByReadStatus: addReadStatusFilter,
    applyFilters
  };
}

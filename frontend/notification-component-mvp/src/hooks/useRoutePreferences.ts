import { useCallback } from 'react';
import type { NotificationStore } from '../store/NotificationStore';
import type { UserPreferenceDto } from '../types';

/**
 * Hook for managing user route preferences
 */
export function useRoutePreferences(store: NotificationStore) {
  const handleSavePreferences = useCallback(async (preferences: UserPreferenceDto[]) => {
    try {
      await store.updatePreferences(preferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  }, [store]);

  const openModal = useCallback(() => {
    store.openPreferencesModal();
  }, [store]);

  const closeModal = useCallback(() => {
    store.closePreferencesModal();
  }, [store]);

  const toggleModal = useCallback(() => {
    store.togglePreferencesModal();
  }, [store]);

  return {
    // State
    preferences: store.preferences,
    isLoading: store.isPreferencesLoading,
    isModalOpen: store.isPreferencesModalOpen,
    
    // Actions
    savePreferences: handleSavePreferences,
    openModal,
    closeModal,
    toggleModal
  };
}
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStorageService } from './asyncStorage';
import { STORAGE_KEYS } from '../constants/api';
import { User, Course } from '../types';

class StorageService {
  // Secure Storage for sensitive data (tokens, auth)
  async setSecureToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getSecureToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }

  async removeSecureToken(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  }

  // AsyncStorage for user data (non-sensitive)
  async setUser(user: User): Promise<void> {
    const userWithoutToken = { ...user };
    delete userWithoutToken.token; // Remove token from AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userWithoutToken));
  }

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const token = await this.getSecureToken();
      
      if (userData && token) {
        const user = JSON.parse(userData);
        user.token = token; // Add token back from SecureStore
        return user;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Bookmarks (AsyncStorage - user preference data)
  async setBookmarks(courseIds: string[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(courseIds));
    // Track bookmark action for analytics
    await asyncStorageService.trackUserAction('bookmarks_updated', { count: courseIds.length });
  }

  async getBookmarks(): Promise<string[]> {
    try {
      const bookmarks = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Failed to get bookmarks:', error);
      return [];
    }
  }

  async addBookmark(courseId: string): Promise<string[]> {
    const bookmarks = await this.getBookmarks();
    if (!bookmarks.includes(courseId)) {
      bookmarks.push(courseId);
      await this.setBookmarks(bookmarks);
      await asyncStorageService.trackUserAction('course_bookmarked', { courseId });
    }
    return bookmarks;
  }

  async removeBookmark(courseId: string): Promise<string[]> {
    const bookmarks = await this.getBookmarks();
    const filtered = bookmarks.filter(id => id !== courseId);
    await this.setBookmarks(filtered);
    await asyncStorageService.trackUserAction('course_unbookmarked', { courseId });
    return filtered;
  }

  // User preferences (AsyncStorage)
  async setUserPreferences(preferences: Record<string, any>): Promise<void> {
    await asyncStorageService.setUserPreferences(preferences);
  }

  async getUserPreferences(): Promise<Record<string, any>> {
    return await asyncStorageService.getUserPreferences();
  }

  // Last login (AsyncStorage)
  async setLastLogin(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
    await asyncStorageService.trackUserAction('user_login');
  }

  async getLastLogin(): Promise<Date | null> {
    try {
      const lastLogin = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
      return lastLogin ? new Date(lastLogin) : null;
    } catch (error) {
      console.error('Failed to get last login:', error);
      return null;
    }
  }

  // Course caching (AsyncStorage)
  async cacheCourses(courses: Course[]): Promise<void> {
    await asyncStorageService.cacheCourses(courses);
  }

  async getCachedCourses(): Promise<{ courses: Course[]; timestamp: number } | null> {
    return await asyncStorageService.getCachedCourses();
  }

  // Search history (AsyncStorage)
  async saveSearchHistory(searchTerm: string): Promise<void> {
    await asyncStorageService.saveSearchHistory(searchTerm);
  }

  async getSearchHistory(): Promise<string[]> {
    return await asyncStorageService.getSearchHistory();
  }

  // Recently viewed (AsyncStorage)
  async addRecentlyViewed(courseId: string): Promise<void> {
    await asyncStorageService.addRecentlyViewed(courseId);
  }

  async getRecentlyViewed(): Promise<string[]> {
    return await asyncStorageService.getRecentlyViewed();
  }

  // App settings (AsyncStorage)
  async setAppSettings(settings: Record<string, any>): Promise<void> {
    await asyncStorageService.setAppSettings(settings);
  }

  async getAppSettings(): Promise<Record<string, any>> {
    return await asyncStorageService.getAppSettings();
  }

  // Analytics (AsyncStorage)
  async trackUserAction(action: string, data?: any): Promise<void> {
    await asyncStorageService.trackUserAction(action, data);
  }

  async getUserAnalytics(): Promise<{ actions: any[]; sessionStart: number }> {
    return await asyncStorageService.getUserAnalytics();
  }

  // Clear all data (for logout)
  async clearAll(): Promise<void> {
    try {
      // Clear SecureStore
      await this.removeSecureToken();
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
      
      // Clear additional AsyncStorage data
      await asyncStorageService.clearAll();
      
      console.log('All storage data cleared successfully');
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  // Storage info and management
  async getStorageInfo(): Promise<{
    secureStore: { hasToken: boolean };
    asyncStorage: { totalKeys: number; estimatedSize: string };
  }> {
    const token = await this.getSecureToken();
    const asyncStorageInfo = await asyncStorageService.getStorageInfo();
    
    return {
      secureStore: { hasToken: !!token },
      asyncStorage: asyncStorageInfo,
    };
  }

  // Data synchronization
  async syncData(): Promise<void> {
    try {
      // This could be used to sync data with a server
      // For now, just track the sync action
      await asyncStorageService.trackUserAction('data_sync');
      console.log('Data sync completed');
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  }

  // Export/Import functionality for backup
  async exportUserData(): Promise<string> {
    try {
      const userData = await this.getUser();
      const bookmarks = await this.getBookmarks();
      const preferences = await this.getUserPreferences();
      const settings = await this.getAppSettings();
      
      const exportData = {
        user: userData,
        bookmarks,
        preferences,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      return JSON.stringify(exportData);
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  async importUserData(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);
      
      // Validate import data
      if (!importData.version || !importData.user) {
        throw new Error('Invalid import data format');
      }
      
      // Import user data
      if (importData.user) {
        await this.setUser(importData.user);
        if (importData.user.token) {
          await this.setSecureToken(importData.user.token);
        }
      }
      
      // Import bookmarks
      if (importData.bookmarks) {
        await this.setBookmarks(importData.bookmarks);
      }
      
      // Import preferences
      if (importData.preferences) {
        await this.setUserPreferences(importData.preferences);
      }
      
      // Import settings
      if (importData.settings) {
        await this.setAppSettings(importData.settings);
      }
      
      await asyncStorageService.trackUserAction('data_imported');
      console.log('User data imported successfully');
    } catch (error) {
      console.error('Failed to import user data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();

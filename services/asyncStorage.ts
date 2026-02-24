import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageService {
  // User preferences and app settings
  async setUserPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(): Promise<Record<string, any>> {
    try {
      const preferences = await AsyncStorage.getItem('user_preferences');
      return preferences ? JSON.parse(preferences) : {};
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return {};
    }
  }

  // Course data caching
  async cacheCourses(courses: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cached_courses', JSON.stringify(courses));
      await AsyncStorage.setItem('courses_cache_time', Date.now().toString());
    } catch (error) {
      console.error('Failed to cache courses:', error);
      throw error;
    }
  }

  async getCachedCourses(): Promise<{ courses: any[]; timestamp: number } | null> {
    try {
      const courses = await AsyncStorage.getItem('cached_courses');
      const timestamp = await AsyncStorage.getItem('courses_cache_time');
      
      if (courses && timestamp) {
        return {
          courses: JSON.parse(courses),
          timestamp: parseInt(timestamp),
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to load cached courses:', error);
      return null;
    }
  }

  // Search history
  async saveSearchHistory(searchTerm: string): Promise<void> {
    try {
      const history = await this.getSearchHistory();
      const updatedHistory = [searchTerm, ...history.filter(term => term !== searchTerm)].slice(0, 10);
      await AsyncStorage.setItem('search_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
      throw error;
    }
  }

  async getSearchHistory(): Promise<string[]> {
    try {
      const history = await AsyncStorage.getItem('search_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  }

  // App usage analytics
  async trackUserAction(action: string, data?: any): Promise<void> {
    try {
      const analytics = await this.getUserAnalytics();
      analytics.actions.push({
        action,
        timestamp: Date.now(),
        data,
      });
      
      // Keep only last 100 actions
      if (analytics.actions.length > 100) {
        analytics.actions = analytics.actions.slice(-100);
      }
      
      await AsyncStorage.setItem('user_analytics', JSON.stringify(analytics));
    } catch (error) {
      console.error('Failed to track user action:', error);
    }
  }

  async getUserAnalytics(): Promise<{ actions: any[]; sessionStart: number }> {
    try {
      const analytics = await AsyncStorage.getItem('user_analytics');
      return analytics ? JSON.parse(analytics) : { actions: [], sessionStart: Date.now() };
    } catch (error) {
      console.error('Failed to load user analytics:', error);
      return { actions: [], sessionStart: Date.now() };
    }
  }

  // App settings
  async setAppSettings(settings: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save app settings:', error);
      throw error;
    }
  }

  async getAppSettings(): Promise<Record<string, any>> {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      return settings ? JSON.parse(settings) : {
        theme: 'light',
        notifications: true,
        autoPlayVideos: false,
        downloadQuality: 'medium',
      };
    } catch (error) {
      console.error('Failed to load app settings:', error);
      return {
        theme: 'light',
        notifications: true,
        autoPlayVideos: false,
        downloadQuality: 'medium',
      };
    }
  }

  // Recently viewed courses
  async addRecentlyViewed(courseId: string): Promise<void> {
    try {
      const recent = await this.getRecentlyViewed();
      const updated = [courseId, ...recent.filter(id => id !== courseId)].slice(0, 20);
      await AsyncStorage.setItem('recently_viewed', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to add recently viewed:', error);
    }
  }

  async getRecentlyViewed(): Promise<string[]> {
    try {
      const recent = await AsyncStorage.getItem('recently_viewed');
      return recent ? JSON.parse(recent) : [];
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
      return [];
    }
  }

  // Clear all AsyncStorage data (for logout)
  async clearAll(): Promise<void> {
    try {
      const keys = [
        'user_preferences',
        'cached_courses',
        'courses_cache_time',
        'search_history',
        'user_analytics',
        'app_settings',
        'recently_viewed',
      ];
      
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
      throw error;
    }
  }

  // Get storage usage info
  async getStorageInfo(): Promise<{ totalKeys: number; estimatedSize: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const totalKeys = keys.length;
      
      // Estimate size (rough calculation)
      let totalSize = 0;
      for (const key of keys.slice(0, 10)) { // Sample first 10 keys
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
      
      const estimatedSize = totalSize > 0 ? `${(totalSize * keys.length / 10 / 1024).toFixed(2)} KB` : '0 KB';
      
      return { totalKeys, estimatedSize };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalKeys: 0, estimatedSize: '0 KB' };
    }
  }
}

export const asyncStorageService = new AsyncStorageService();

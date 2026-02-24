import * as Network from 'expo-network';
import { Platform } from 'react-native';

class NetworkService {
  private listeners: ((isConnected: boolean) => void)[] = [];
  private currentStatus: boolean = true;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startMonitoring();
  }

  async checkConnection(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Basic web connectivity check
        const response = await fetch('https://api.freeapi.app/health', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        return response.ok;
      } else {
        const networkState = await Network.getNetworkStateAsync();
        return (networkState.isConnected && networkState.isInternetReachable) || false;
      }
    } catch (error) {
      console.error('Network check failed:', error);
      return false;
    }
  }

  private async monitorConnection() {
    const previousStatus = this.currentStatus;
    const currentStatus = await this.checkConnection();
    
    if (previousStatus !== currentStatus) {
      this.currentStatus = currentStatus;
      this.notifyListeners(currentStatus);
    }
  }

  private startMonitoring() {
    // Initial check
    this.checkConnection().then(isConnected => {
      this.currentStatus = isConnected;
      this.notifyListeners(isConnected);
    });

    // Set up periodic monitoring
    this.checkInterval = setInterval(() => {
      this.monitorConnection();
    }, 30000); // Check every 30 seconds
  }

  private notifyListeners(isConnected: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(isConnected);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  subscribe(listener: (isConnected: boolean) => void) {
    this.listeners.push(listener);
    
    // Immediately notify with current status
    listener(this.currentStatus);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getCurrentStatus(): boolean {
    return this.currentStatus;
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

export const networkService = new NetworkService();

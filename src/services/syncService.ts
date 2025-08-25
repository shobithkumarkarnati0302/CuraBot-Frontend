// Real-time data synchronization service
class SyncService {
  private static instance: SyncService;
  private subscribers: Map<string, Set<() => void>> = new Map();
  private refreshInterval: number | null = null;
  private isPolling = false;

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Subscribe to data changes for specific data types
  subscribe(dataType: 'patients' | 'doctors' | 'appointments', callback: () => void) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }
    this.subscribers.get(dataType)!.add(callback);

    // Start polling if not already started
    this.startPolling();

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(dataType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(dataType);
        }
      }
      
      // Stop polling if no subscribers
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    };
  }

  // Notify all subscribers of a specific data type
  private notify(dataType: 'patients' | 'doctors' | 'appointments') {
    const subscribers = this.subscribers.get(dataType);
    if (subscribers) {
      subscribers.forEach(callback => callback());
    }
  }

  // Notify all subscribers
  notifyAll() {
    this.subscribers.forEach((_, dataType) => {
      this.notify(dataType as 'patients' | 'doctors' | 'appointments');
    });
  }

  // Start periodic data refresh
  private startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.refreshInterval = setInterval(() => {
      // Notify all subscribers to refresh their data
      this.notifyAll();
    }, 30000); // Refresh every 30 seconds
  }

  // Stop periodic data refresh
  private stopPolling() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.isPolling = false;
  }

  // Manual refresh trigger
  refresh(dataType?: 'patients' | 'doctors' | 'appointments') {
    if (dataType) {
      this.notify(dataType);
    } else {
      this.notifyAll();
    }
  }

  // Cleanup on app unmount
  cleanup() {
    this.stopPolling();
    this.subscribers.clear();
  }
}

export const syncService = SyncService.getInstance();

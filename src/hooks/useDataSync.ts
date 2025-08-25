import { useEffect, useCallback, useState } from 'react';
import { syncService } from '../services/syncService';
import { dataService } from '../services/dataService';

type DataType = 'patients' | 'doctors' | 'appointments';

interface UseSyncOptions {
  refreshOnMount?: boolean;
  refreshInterval?: number;
}

export function useDataSync<T>(
  dataType: DataType,
  fetchFunction: () => Promise<T>,
  options: UseSyncOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { refreshOnMount = true } = options;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error(`Error fetching ${dataType}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, dataType]);

  // Subscribe to sync service for automatic updates
  useEffect(() => {
    const unsubscribe = syncService.subscribe(dataType, fetchData);
    
    // Initial data fetch
    if (refreshOnMount) {
      fetchData();
    }

    return unsubscribe;
  }, [dataType, fetchData, refreshOnMount]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Force refresh across all components
  const forceRefresh = useCallback(() => {
    syncService.refresh(dataType);
  }, [dataType]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
    forceRefresh
  };
}

// Specific hooks for common data types
export function usePatients() {
  return useDataSync('patients', dataService.getAllPatients);
}

export function useDoctors() {
  return useDataSync('doctors', dataService.getAllDoctors);
}

export function useAppointments() {
  return useDataSync('appointments', dataService.getAllAppointments);
}

import { useState, useEffect } from 'react';
import { fetchAllAdvisoryData } from '@/services/api';

interface AdvisoryData {
  current_weather: any;
  daily_forecast: any;
  hourly_forecast: any;
  weather_alerts: any;
  spray_window: any;
  soil_nutrient: any;
  irrigation: any;
  gdd: any;
  crop_specific_data: any;
}

export function useAdvisoryData(storeName?: string) {
  const [data, setData] = useState<AdvisoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!storeName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchAllAdvisoryData(storeName);
        setData(result as AdvisoryData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch advisory data');
        console.error('Error fetching advisory data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [storeName]);

  return { data, loading, error };
}

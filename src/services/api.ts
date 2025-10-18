// API Service for Frappe Advisory Backend
const FRAPPE_BASE_URL = import.meta.env.VITE_FRAPPE_URL || 'http://localhost:8000';

interface FrappeResponse<T> {
  message: T;
}

// Helper to make Frappe API calls
async function frappeCall<T>(method: string, args?: any): Promise<T> {
  const response = await fetch(`${FRAPPE_BASE_URL}/api/method/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    credentials: 'include', // Important for Frappe session cookies
    body: JSON.stringify(args || {}),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data: FrappeResponse<T> = await response.json();
  return data.message;
}

// Fetch all advisory data from the Store doctype
export async function fetchAllAdvisoryData(storeName: string) {
  return frappeCall('mdc.advisory.doctype.store.store.Store.fetch_all_api_data', {
    doc: storeName,
  });
}

// Individual API calls (if you need them separately)
export async function getCurrentWeather(lat: number, lon: number) {
  return frappeCall('mdc.advisory.doctype.advisory_settings.advisory_settings.get_now_forecast', {
    lat,
    lon,
  });
}

export async function getDailyForecast(lat: number, lon: number) {
  return frappeCall('mdc.advisory.doctype.advisory_settings.advisory_settings.get_daily_forecast', {
    lat,
    lon,
  });
}

export async function getHourlyForecast(lat: number, lon: number) {
  return frappeCall('mdc.advisory.doctype.advisory_settings.advisory_settings.get_hourly_forecast', {
    lat,
    lon,
  });
}

export async function getWeatherAlert(lat: number, lon: number) {
  return frappeCall('mdc.advisory.doctype.advisory_settings.advisory_settings.get_weather_alert', {
    lat,
    lon,
  });
}

export async function getSprayWindow(lat: number, lon: number) {
  return frappeCall('mdc.advisory.doctype.advisory_settings.advisory_settings.get_spray_window', {
    lat,
    lon,
  });
}

export async function getSoilNutrient(lat: number, lon: number, cropId: string, districtName?: string, variety?: string) {
  return frappeCall('mdc.advisory.doctype.advisory_settings.advisory_settings.get_soil_nutrient', {
    lat,
    lon,
    crop_id: cropId,
    district_name: districtName,
    variety,
  });
}

export async function getCropIrrigation(lat: number, lon: number, cropId: string, sowingDate: number, farmArea?: number) {
  return frappeCall('mdc.advisory.doctype.advisory_settings.advisory_settings.get_crop_irrigation', {
    lat,
    lon,
    crop_id: cropId,
    sowing_date: sowingDate,
    farm_area: farmArea,
  });
}

export async function getCropGdd(lat: number, lon: number, cropId: string, sowingDate: number, variety?: string) {
  return frappeCall('mdc.advisory.doctype.advisory_settings.advisory_settings.get_crop_gdd', {
    lat,
    lon,
    crop_id: cropId,
    sowing_date: sowingDate,
    variety,
  });
}

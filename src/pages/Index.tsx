import { useState } from "react";
import { DailyForecastCard } from "@/components/DailyForecastCard";
import { HourlyForecastCard } from "@/components/HourlyForecastCard";
import { WeatherAlertCard } from "@/components/WeatherAlertCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudSun } from "lucide-react";

// Sample data matching the API structure
const sampleDailyForecasts = [
  {
    date: "2025-09-15T00:00:00Z",
    timestamps: {
      sunrise: "2025-09-15T00:27:11Z",
      sunset: "2025-09-15T12:46:07Z",
      moonrise: null,
      moonset: "2025-09-15T08:25:49Z"
    },
    moon_phase: "Waning Crescent",
    temperature: { min: 27, max: 34 },
    humidity: { day: 71, night: 89 },
    uvi: { day: 10, night: 0 },
    wind: {
      speed: { day: 8, night: 6 },
      direction: { day: "WNW", night: "ESE" }
    },
    precipitation: {
      probability: { day: 20, night: 36 },
      amount: "0.33"
    },
    weather: {
      description: { day: "Mostly Cloudy", night: "Showers Late" }
    }
  },
  {
    date: "2025-09-16T00:00:00Z",
    timestamps: {
      sunrise: "2025-09-16T00:27:32Z",
      sunset: "2025-09-16T12:45:43Z",
      moonrise: "2025-09-16T01:15:22Z",
      moonset: "2025-09-16T09:10:15Z"
    },
    moon_phase: "New Moon",
    temperature: { min: 26, max: 32 },
    humidity: { day: 68, night: 85 },
    uvi: { day: 9, night: 0 },
    wind: {
      speed: { day: 10, night: 7 },
      direction: { day: "W", night: "SE" }
    },
    precipitation: {
      probability: { day: 45, night: 60 },
      amount: "1.20"
    },
    weather: {
      description: { day: "Scattered Showers", night: "Rain" }
    }
  }
];

const sampleHourlyForecasts = [
  {
    timestamp: "2025-09-09T06:00:00Z",
    temp: "32.00",
    feels_like: "42.00",
    pressure: "1006.50",
    humidity: 75,
    dew_point: "27.00",
    uvi: 7,
    visibility: "6.00",
    cloud_cover: 80,
    wind: { speed: 5, direction: "W" },
    precipitation: { probability: 34, type: "rain", amount: "0.00" },
    weather: { description: "Isolated T-Storms" }
  },
  {
    timestamp: "2025-09-09T07:00:00Z",
    temp: "33.00",
    feels_like: "43.00",
    pressure: "1005.50",
    humidity: 71,
    dew_point: "27.00",
    uvi: 7,
    visibility: "6.00",
    cloud_cover: 78,
    wind: { speed: 6, direction: "W" },
    precipitation: { probability: 32, type: "rain", amount: "0.10" },
    weather: { description: "Isolated T-Storms" }
  },
  {
    timestamp: "2025-09-09T08:00:00Z",
    temp: "31.00",
    feels_like: "40.00",
    pressure: "1007.00",
    humidity: 78,
    dew_point: "26.00",
    uvi: 6,
    visibility: "8.00",
    cloud_cover: 85,
    wind: { speed: 4, direction: "WSW" },
    precipitation: { probability: 28, type: "rain", amount: "0.05" },
    weather: { description: "Partly Cloudy" }
  }
];

const sampleAlert = {
  updated_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  value: 2
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-weather-sky-dark text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <CloudSun className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Weather Dashboard</h1>
              <p className="text-sm opacity-90">Comprehensive weather forecasting</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Weather Alerts */}
        <div className="mb-8 max-w-2xl mx-auto">
          <WeatherAlertCard alert={sampleAlert} />
        </div>

        {/* Forecast Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="daily">Daily Forecast</TabsTrigger>
            <TabsTrigger value="hourly">Hourly Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto">
              {sampleDailyForecasts.map((forecast, index) => (
                <DailyForecastCard key={index} forecast={forecast} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {sampleHourlyForecasts.map((forecast, index) => (
                <HourlyForecastCard key={index} forecast={forecast} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

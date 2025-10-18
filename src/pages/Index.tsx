import { useState } from "react";
import { DailyForecastCard } from "@/components/DailyForecastCard";
import { HourlyForecastCard } from "@/components/HourlyForecastCard";
import { WeatherAlertCard } from "@/components/WeatherAlertCard";
import { CropCard } from "@/components/CropCard";
import { SprayWindowCard } from "@/components/SprayWindowCard";
import { SoilNutrientCard } from "@/components/SoilNutrientCard";
import { IrrigationCard } from "@/components/IrrigationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudSun, Wheat } from "lucide-react";

// Sample weather data
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
  updated_at: Math.floor(Date.now() / 1000) - 3600,
  value: 2
};

// Sample crop data
const sampleCrops = [
  {
    name: "Winter Wheat",
    type: "grain",
    stages: [
      { order: 0, name: "Germination" },
      { order: 1, name: "Tillering" },
      { order: 2, name: "Stem Extension" },
      { order: 3, name: "Booting" },
      { order: 4, name: "Flowering" },
      { order: 5, name: "Grain Filling" },
      { order: 6, name: "Ripening" }
    ],
    das_stage: 3,
    gdd_value: 1245.8,
    gdd_percentage: 62.5,
    health: 1
  },
  {
    name: "Tomatoes",
    type: "vegetable",
    stages: [
      { order: 0, name: "Seedling" },
      { order: 1, name: "Vegetative" },
      { order: 2, name: "Flowering" },
      { order: 3, name: "Fruit Development" },
      { order: 4, name: "Ripening" }
    ],
    das_stage: 2,
    gdd_value: 856.3,
    gdd_percentage: 55.2,
    health: 1
  },
  {
    name: "Corn (Maize)",
    type: "grain",
    stages: [
      { order: 0, name: "Emergence" },
      { order: 1, name: "Vegetative" },
      { order: 2, name: "Tasseling" },
      { order: 3, name: "Silking" },
      { order: 4, name: "Grain Filling" },
      { order: 5, name: "Maturity" }
    ],
    das_stage: 1,
    gdd_value: 654.2,
    gdd_percentage: 38.7,
    health: 1
  },
  {
    name: "Cotton",
    type: "fiber",
    stages: [
      { order: 0, name: "Planting" },
      { order: 1, name: "Emergence" },
      { order: 2, name: "Squaring" },
      { order: 3, name: "Flowering" },
      { order: 4, name: "Boll Development" },
      { order: 5, name: "Maturity" }
    ],
    das_stage: 4,
    gdd_value: 1456.9,
    gdd_percentage: 72.3,
    health: 1
  }
];

// Sample spray window data
const sampleSprayWindow = [
  { timestamp: "2025-09-15T06:00:00Z", spray: true, conditions: "Low wind, optimal humidity" },
  { timestamp: "2025-09-15T12:00:00Z", spray: false, conditions: "High wind speeds" },
  { timestamp: "2025-09-15T18:00:00Z", spray: true, conditions: "Calm conditions" },
  { timestamp: "2025-09-16T06:00:00Z", spray: true, conditions: "Perfect conditions" },
  { timestamp: "2025-09-16T12:00:00Z", spray: false, conditions: "Rain expected" },
  { timestamp: "2025-09-16T18:00:00Z", spray: false, conditions: "High temperatures" },
  { timestamp: "2025-09-17T06:00:00Z", spray: true, conditions: "Ideal for spraying" }
];

// Sample soil nutrient data
const sampleNutrients = {
  nitrogen: 0,
  phosphorus: -1,
  potassium: 0,
  calcium: 1,
  magnesium: 0,
  sulfur: -1,
  iron: 0,
  zinc: 0,
  manganese: 0,
  copper: 0,
  boron: -1,
  ph: 0
};

// Sample irrigation data
const sampleIrrigation = {
  weekly_irrigation_details: [
    { timestamp: "2025-09-09T00:00:00Z", irrigation_mm: 8.5 },
    { timestamp: "2025-09-10T00:00:00Z", irrigation_mm: 7.2 },
    { timestamp: "2025-09-11T00:00:00Z", irrigation_mm: 9.8 },
    { timestamp: "2025-09-12T00:00:00Z", irrigation_mm: 6.5 },
    { timestamp: "2025-09-13T00:00:00Z", irrigation_mm: 8.9 },
    { timestamp: "2025-09-14T00:00:00Z", irrigation_mm: 7.7 },
    { timestamp: "2025-09-15T00:00:00Z", irrigation_mm: 8.3 }
  ],
  weekly_irrigation_mm: 56.9,
  weekly_irrigation_liter: 5690
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("weather");
  const [weatherTab, setWeatherTab] = useState("daily");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-agriculture-green-light/5">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary via-agriculture-green-accent to-agriculture-green-dark text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Wheat className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">KhetEdge Advisory Dashboard</h1>
              <p className="text-sm opacity-95">Agricultural Intelligence Platform • Real-time Weather & Crop Insights</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Main Section Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card shadow-md">
            <TabsTrigger value="weather" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CloudSun className="w-4 h-4 mr-2" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="crops" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wheat className="w-4 h-4 mr-2" />
              Crops
            </TabsTrigger>
          </TabsList>

          {/* Weather Section */}
          <TabsContent value="weather" className="space-y-6">
            {/* Weather Alerts */}
            <div className="max-w-2xl mx-auto">
              <WeatherAlertCard alert={sampleAlert} />
            </div>

            {/* Weather Sub-tabs */}
            <Tabs value={weatherTab} onValueChange={setWeatherTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-card shadow-md">
                <TabsTrigger value="daily" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Daily Forecast
                </TabsTrigger>
                <TabsTrigger value="hourly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Hourly Forecast
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
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
          </TabsContent>

          {/* Crops Section */}
          <TabsContent value="crops" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                Crop Growth Monitoring
              </h2>
              <p className="text-muted-foreground">
                Track your crops' growth stages, health status, and agricultural insights
              </p>
            </div>
            
            {/* Crop Growth Cards */}
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4 px-2">
                Growing Degree Days (GDD)
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto">
                {sampleCrops.map((crop, index) => (
                  <CropCard key={index} crop={crop} />
                ))}
              </div>
            </div>

            {/* Agricultural Management */}
            <div>
              <h3 className="text-xl font-semibold text-card-foreground mb-4 px-2">
                Agricultural Management
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
                <SprayWindowCard sprayData={sampleSprayWindow} />
                <SoilNutrientCard nutrients={sampleNutrients} />
                <IrrigationCard irrigation={sampleIrrigation} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

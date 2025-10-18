import { WeatherCard } from "./WeatherCard";
import { Clock, Thermometer, Droplets, Wind, CloudRain, Eye, Gauge, Sun } from "lucide-react";

interface HourlyForecast {
  timestamp: string;
  temp: string;
  feels_like: string;
  pressure: string;
  humidity: number;
  dew_point: string;
  uvi: number;
  visibility: string;
  cloud_cover: number;
  wind: {
    speed: number;
    direction: string;
  };
  precipitation: {
    probability: number;
    type: string;
    amount: string;
  };
  weather: {
    description: string;
  };
}

interface HourlyForecastCardProps {
  forecast: HourlyForecast;
}

export const HourlyForecastCard = ({ forecast }: HourlyForecastCardProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <WeatherCard 
      title={formatTime(forecast.timestamp)} 
      icon={<Clock className="w-5 h-5" />}
      className="h-full"
    >
      <div className="space-y-3">
        {/* Temperature */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-card-foreground">Temperature</span>
            </div>
            <div className="text-2xl font-bold text-card-foreground">{parseFloat(forecast.temp).toFixed(0)}°</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Feels like {parseFloat(forecast.feels_like).toFixed(0)}°
          </div>
        </div>

        {/* Weather Condition */}
        <div className="p-2 bg-primary/10 rounded text-center">
          <div className="text-sm font-semibold text-primary">{forecast.weather.description}</div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Droplets className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="text-sm font-semibold text-card-foreground">{forecast.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Gauge className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Pressure</div>
              <div className="text-sm font-semibold text-card-foreground">{parseFloat(forecast.pressure).toFixed(0)} hPa</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Sun className="w-4 h-4 text-secondary" />
            <div>
              <div className="text-xs text-muted-foreground">UV Index</div>
              <div className="text-sm font-semibold text-card-foreground">{forecast.uvi}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Eye className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Visibility</div>
              <div className="text-sm font-semibold text-card-foreground">{parseFloat(forecast.visibility).toFixed(1)} km</div>
            </div>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <Wind className="w-4 h-4 text-primary" />
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Wind</div>
            <div className="text-sm font-semibold text-card-foreground">
              {forecast.wind.speed} km/h {forecast.wind.direction}
            </div>
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
          <span className="text-muted-foreground">Cloud Cover</span>
          <span className="font-semibold text-card-foreground">{forecast.cloud_cover}%</span>
        </div>

        {/* Dew Point */}
        <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
          <span className="text-muted-foreground">Dew Point</span>
          <span className="font-semibold text-card-foreground">{parseFloat(forecast.dew_point).toFixed(0)}°</span>
        </div>

        {/* Precipitation */}
        {forecast.precipitation.probability > 0 && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-card-foreground">Precipitation</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Probability</span>
                <span className="font-semibold text-card-foreground">{forecast.precipitation.probability}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold text-card-foreground capitalize">{forecast.precipitation.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-card-foreground">{forecast.precipitation.amount} mm</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </WeatherCard>
  );
};

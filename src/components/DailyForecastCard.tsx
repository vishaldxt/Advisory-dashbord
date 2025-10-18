import { WeatherCard } from "./WeatherCard";
import { Calendar, Sunrise, Sunset, Moon, Droplets, Wind, CloudRain, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DailyForecast {
  date: string;
  timestamps: {
    sunrise: string;
    sunset: string;
    moonrise: string | null;
    moonset: string | null;
  };
  moon_phase: string;
  temperature: {
    min: number;
    max: number;
  };
  humidity: {
    day: number;
    night: number;
  };
  uvi: {
    day: number;
    night: number;
  };
  wind: {
    speed: {
      day: number;
      night: number;
    };
    direction: {
      day: string;
      night: string;
    };
  };
  precipitation: {
    probability: {
      day: number;
      night: number;
    };
    amount: string;
  };
  weather: {
    description: {
      day: string;
      night: string;
    };
  };
}

interface DailyForecastCardProps {
  forecast: DailyForecast;
}

export const DailyForecastCard = ({ forecast }: DailyForecastCardProps) => {
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <WeatherCard 
      title={formatDate(forecast.date)} 
      icon={<Calendar className="w-5 h-5" />}
      className="h-full"
    >
      <div className="space-y-4">
        {/* Temperature */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-secondary" />
            <span className="text-sm text-muted-foreground">Temperature</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-card-foreground">
              {forecast.temperature.max}° / {forecast.temperature.min}°
            </div>
            <div className="text-xs text-muted-foreground">High / Low</div>
          </div>
        </div>

        {/* Sun Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Sunrise className="w-4 h-4 text-secondary" />
            <div>
              <div className="text-xs text-muted-foreground">Sunrise</div>
              <div className="text-sm font-semibold text-card-foreground">{formatTime(forecast.timestamps.sunrise)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Sunset className="w-4 h-4 text-secondary" />
            <div>
              <div className="text-xs text-muted-foreground">Sunset</div>
              <div className="text-sm font-semibold text-card-foreground">{formatTime(forecast.timestamps.sunset)}</div>
            </div>
          </div>
        </div>

        {/* Moon Phase */}
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <Moon className="w-4 h-4 text-primary" />
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Moon Phase</div>
            <div className="text-sm font-semibold text-card-foreground">{forecast.moon_phase}</div>
          </div>
        </div>

        {/* Weather Conditions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Day</span>
            <Badge variant="outline">{forecast.weather.description.day}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Night</span>
            <Badge variant="outline">{forecast.weather.description.night}</Badge>
          </div>
        </div>

        {/* Humidity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Day Humidity</div>
              <div className="text-sm font-semibold text-card-foreground">{forecast.humidity.day}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Night Humidity</div>
              <div className="text-sm font-semibold text-card-foreground">{forecast.humidity.night}%</div>
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-secondary" />
            <div>
              <div className="text-xs text-muted-foreground">Day UV</div>
              <div className="text-sm font-semibold text-card-foreground">{forecast.uvi.day}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-secondary" />
            <div>
              <div className="text-xs text-muted-foreground">Night UV</div>
              <div className="text-sm font-semibold text-card-foreground">{forecast.uvi.night}</div>
            </div>
          </div>
        </div>

        {/* Wind */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Day Wind</div>
              <div className="text-sm font-semibold text-card-foreground">
                {forecast.wind.speed.day} {forecast.wind.direction.day}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Night Wind</div>
              <div className="text-sm font-semibold text-card-foreground">
                {forecast.wind.speed.night} {forecast.wind.direction.night}
              </div>
            </div>
          </div>
        </div>

        {/* Precipitation */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-card-foreground">Precipitation</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Day Probability</div>
              <div className="font-semibold text-card-foreground">{forecast.precipitation.probability.day}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Night Probability</div>
              <div className="font-semibold text-card-foreground">{forecast.precipitation.probability.night}%</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Amount</div>
              <div className="font-semibold text-card-foreground">{forecast.precipitation.amount} mm</div>
            </div>
          </div>
        </div>
      </div>
    </WeatherCard>
  );
};

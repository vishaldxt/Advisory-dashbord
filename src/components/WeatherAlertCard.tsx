import { WeatherCard } from "./WeatherCard";
import { AlertTriangle, CloudLightning, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeatherAlert {
  updated_at: number;
  value: number;
}

interface WeatherAlertCardProps {
  alert: WeatherAlert | null;
}

const getSeverityInfo = (value: number) => {
  switch (value) {
    case 1:
      return {
        level: "Slight",
        description: "Slight risk of thunderstorm",
        color: "bg-weather-success",
        textColor: "text-weather-success",
        icon: <Info className="w-5 h-5" />
      };
    case 2:
      return {
        level: "Moderate",
        description: "Moderate risk of thunderstorm",
        color: "bg-weather-warning",
        textColor: "text-weather-warning",
        icon: <AlertTriangle className="w-5 h-5" />
      };
    case 3:
      return {
        level: "High",
        description: "High risk of thunderstorm",
        color: "bg-destructive",
        textColor: "text-destructive",
        icon: <CloudLightning className="w-5 h-5" />
      };
    case 4:
      return {
        level: "Severe",
        description: "Severe risk of thunderstorm",
        color: "bg-weather-alert",
        textColor: "text-weather-alert",
        icon: <CloudLightning className="w-5 h-5" />
      };
    default:
      return {
        level: "Unknown",
        description: "Unknown alert level",
        color: "bg-muted",
        textColor: "text-muted-foreground",
        icon: <Info className="w-5 h-5" />
      };
  }
};

export const WeatherAlertCard = ({ alert }: WeatherAlertCardProps) => {
  if (!alert || !alert.value) {
    return (
      <WeatherCard 
        title="Weather Alerts" 
        icon={<Info className="w-5 h-5" />}
        className="h-full"
      >
        <div className="flex items-center justify-center p-6 text-center">
          <div>
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-accent/10">
              <Info className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">No active weather alerts</p>
            <p className="text-xs text-muted-foreground mt-1">Clear conditions</p>
          </div>
        </div>
      </WeatherCard>
    );
  }

  const severity = getSeverityInfo(alert.value);
  const updatedDate = new Date(alert.updated_at * 1000);
  const now = new Date();
  const hoursSinceUpdate = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));
  
  // Only show alerts updated within last 24 hours
  const isRecent = hoursSinceUpdate < 24;

  if (!isRecent) {
    return (
      <WeatherCard 
        title="Weather Alerts" 
        icon={<Info className="w-5 h-5" />}
        className="h-full"
      >
        <div className="flex items-center justify-center p-6 text-center">
          <div>
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-accent/10">
              <Info className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">No recent weather alerts</p>
          </div>
        </div>
      </WeatherCard>
    );
  }

  return (
    <WeatherCard 
      title="Weather Alerts" 
      icon={severity.icon}
      className="h-full"
    >
      <div className="space-y-4">
        {/* Alert Level Badge */}
        <div className="flex items-center justify-between">
          <Badge className={`${severity.color} text-white px-3 py-1`}>
            {severity.level} Risk
          </Badge>
          <span className="text-xs text-muted-foreground">
            Updated {hoursSinceUpdate}h ago
          </span>
        </div>

        {/* Alert Description */}
        <div className={`p-4 rounded-lg border-l-4 ${severity.color} bg-muted`}>
          <div className="flex items-start gap-3">
            <div className={severity.textColor}>
              {severity.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-card-foreground mb-1">{severity.description}</h4>
              <p className="text-sm text-muted-foreground">
                Stay alert and monitor weather conditions. Take necessary precautions.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alert Level</span>
            <span className="font-semibold text-card-foreground">{alert.value} / 4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-semibold text-card-foreground">
              {updatedDate.toLocaleString([], { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>

        {/* Safety Tips */}
        {alert.value >= 3 && (
          <div className="p-3 bg-destructive/10 rounded-lg">
            <h5 className="text-sm font-semibold text-destructive mb-2">Safety Recommendations</h5>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Seek shelter indoors immediately</li>
              <li>Avoid open areas and tall structures</li>
              <li>Stay away from windows</li>
              <li>Monitor weather updates continuously</li>
            </ul>
          </div>
        )}
      </div>
    </WeatherCard>
  );
};

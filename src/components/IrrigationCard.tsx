import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Droplets } from "lucide-react";

interface IrrigationProps {
  irrigation: {
    weekly_irrigation_details: {
      timestamp: string;
      irrigation_mm: number;
    }[];
    weekly_irrigation_mm: number;
    weekly_irrigation_liter?: number;
  };
}

export const IrrigationCard = ({ irrigation }: IrrigationProps) => {
  return (
    <Card className="transition-all duration-200 ease-out will-change-auto hover:shadow-hover">
      <CardHeader className="bg-gradient-to-br from-muted/50 to-muted/30 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-agriculture-green-dark flex items-center justify-center shadow-lg">
            <Droplets className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-card-foreground">Weekly Irrigation</h3>
            <p className="text-sm text-muted-foreground">Water requirements</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {irrigation.weekly_irrigation_details && irrigation.weekly_irrigation_details.length > 0 ? (
          <>
            <div className="space-y-2">
              {irrigation.weekly_irrigation_details.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-agriculture-green-light/10 to-agriculture-green-accent/10"
                >
                  <span className="text-sm font-semibold text-card-foreground">
                    {new Date(item.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-base font-bold text-primary">
                    {item.irrigation_mm.toFixed(2)} mm
                  </span>
                </div>
              ))}
            </div>
            
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary to-agriculture-green-accent text-primary-foreground text-center shadow-lg">
              <p className="text-xs uppercase tracking-wider opacity-90 mb-2">
                Total Weekly
              </p>
              <p className="text-3xl font-bold mb-1">
                {irrigation.weekly_irrigation_mm.toFixed(2)} mm
              </p>
              {irrigation.weekly_irrigation_liter && (
                <p className="text-sm opacity-90">
                  {irrigation.weekly_irrigation_liter.toFixed(2)} Liters
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No irrigation data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

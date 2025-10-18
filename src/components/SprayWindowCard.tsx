import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Droplet, CheckCircle, XCircle } from "lucide-react";

interface SprayWindowProps {
  sprayData: {
    timestamp: string;
    spray: boolean;
    conditions?: string;
  }[];
}

export const SprayWindowCard = ({ sprayData }: SprayWindowProps) => {
  return (
    <Card className="transition-all duration-200 ease-out will-change-auto hover:shadow-hover">
      <CardHeader className="bg-gradient-to-br from-muted/50 to-muted/30 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-agriculture-green-dark flex items-center justify-center shadow-lg">
            <Droplet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-card-foreground">Spray Window</h3>
            <p className="text-sm text-muted-foreground">Optimal spraying conditions</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {sprayData.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-all ${
                item.spray
                  ? "bg-agriculture-success/10 border-agriculture-success"
                  : "bg-agriculture-alert/10 border-agriculture-alert"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.spray ? (
                  <CheckCircle className="w-5 h-5 text-agriculture-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-agriculture-alert" />
                )}
                <div>
                  <p className="font-semibold text-card-foreground">
                    {new Date(item.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {new Date(item.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      hour12: true,
                    })}
                  </p>
                  {item.conditions && (
                    <p className="text-xs text-muted-foreground">{item.conditions}</p>
                  )}
                </div>
              </div>
              <span
                className={`font-bold text-sm ${
                  item.spray ? "text-agriculture-success" : "text-agriculture-alert"
                }`}
              >
                {item.spray ? "✓ Spray" : "✗ No Spray"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

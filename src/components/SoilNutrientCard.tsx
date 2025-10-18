import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Leaf } from "lucide-react";

interface SoilNutrientProps {
  nutrients: {
    [key: string]: number; // 0=OK, -1=Low, 1=High
  };
}

export const SoilNutrientCard = ({ nutrients }: SoilNutrientProps) => {
  const getStatus = (value: number) => {
    if (value === 0) return { label: "OK", color: "text-agriculture-success", bg: "bg-agriculture-success/10", fill: "bg-agriculture-success" };
    if (value === -1) return { label: "Low", color: "text-agriculture-alert", bg: "bg-agriculture-alert/10", fill: "bg-agriculture-alert" };
    if (value === 1) return { label: "High", color: "text-agriculture-warning", bg: "bg-agriculture-warning/10", fill: "bg-agriculture-warning" };
    return { label: "N/A", color: "text-muted-foreground", bg: "bg-muted/50", fill: "bg-muted" };
  };

  return (
    <Card className="transition-all duration-200 ease-out will-change-auto hover:shadow-hover">
      <CardHeader className="bg-gradient-to-br from-muted/50 to-muted/30 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-agriculture-green-dark flex items-center justify-center shadow-lg">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-card-foreground">Soil Analysis</h3>
            <p className="text-sm text-muted-foreground">Nutrient levels status</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex gap-2 text-xs mb-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-agriculture-success"></span>
            <span className="text-muted-foreground">0=OK</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-agriculture-alert"></span>
            <span className="text-muted-foreground">-1=Low</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-agriculture-warning"></span>
            <span className="text-muted-foreground">1=High</span>
          </span>
        </div>
        <div className="space-y-4 max-h-[350px] overflow-y-auto">
          {Object.entries(nutrients).map(([nutrient, value]) => {
            const status = getStatus(value);
            return (
              <div key={nutrient} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-card-foreground uppercase">
                    {nutrient}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${status.bg} ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${status.fill} transition-all duration-500`} style={{ width: "100%" }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

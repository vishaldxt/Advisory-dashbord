import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Wheat, Sprout, Leaf, TreePine } from "lucide-react";

interface CropCardProps {
  crop: {
    name: string;
    type: string;
    stages: { order: number; name: string }[];
    das_stage: number;
    gdd_value: number;
    gdd_percentage: number;
    health: number;
  };
}

const getCropIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "wheat":
    case "grain":
      return Wheat;
    case "vegetable":
      return Leaf;
    case "fruit":
      return TreePine;
    default:
      return Sprout;
  }
};

export const CropCard = ({ crop }: CropCardProps) => {
  const Icon = getCropIcon(crop.type);
  const currentStage = crop.stages.find((s) => s.order === crop.das_stage);

  return (
    <Card className="transition-all duration-200 ease-out will-change-auto hover:shadow-hover">
      <CardHeader className="bg-gradient-to-br from-muted/50 to-muted/30 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-agriculture-green-dark flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-card-foreground">{crop.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{crop.type}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Current Stage */}
        <div className="bg-gradient-to-r from-agriculture-green-light/10 to-agriculture-green-accent/10 rounded-xl p-4 border border-primary/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Current Growth Stage
          </p>
          <p className="text-xl font-bold text-primary">
            {currentStage?.name || "Unknown"}
          </p>
        </div>

        {/* GDD Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              GDD Value
            </p>
            <p className="text-2xl font-bold text-card-foreground">
              {crop.gdd_value?.toFixed(1) || "N/A"}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Progress
            </p>
            <p className="text-2xl font-bold text-card-foreground">
              {crop.gdd_percentage?.toFixed(1) || "0"}%
            </p>
          </div>
        </div>

        {/* Health Status */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Health Status
          </p>
          <p
            className={`text-lg font-bold ${
              crop.health === 1
                ? "text-agriculture-success"
                : crop.health === -1
                ? "text-agriculture-alert"
                : "text-muted-foreground"
            }`}
          >
            {crop.health === 1 ? "✓ Good" : crop.health === -1 ? "✗ Poor" : "Unknown"}
          </p>
        </div>

        {/* Growth Stages */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            All Growth Stages
          </p>
          <div className="space-y-2">
            {crop.stages
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
                <div
                  key={stage.order}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    stage.order === crop.das_stage
                      ? "bg-gradient-to-r from-primary to-agriculture-green-accent text-primary-foreground shadow-md"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {stage.order + 1}. {stage.name}
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

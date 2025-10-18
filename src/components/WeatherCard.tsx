import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface WeatherCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const WeatherCard = ({ title, icon, children, className = "" }: WeatherCardProps) => {
  return (
    <Card className={`p-5 bg-card shadow-card transition-all duration-200 ease-out will-change-auto hover:shadow-hover ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon && <div className="text-primary">{icon}</div>}
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      </div>
      {children}
    </Card>
  );
};

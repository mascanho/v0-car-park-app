import { MapPin } from "lucide-react";
import type { CarPark } from "@/lib/parking-data";

interface CarParkSelectorProps {
  carParks: CarPark[];
  selectedCarPark: CarPark;
  onSelectCarPark: (carPark: CarPark) => void;
  availabilityMap?: Record<string, boolean>;
}

export function CarParkSelector({
  carParks,
  selectedCarPark,
  onSelectCarPark,
  availabilityMap = {},
}: CarParkSelectorProps) {
  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-8xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Select Car Park:</span>
          </div>
          <div className="flex gap-3">
            {carParks.map((carPark) => (
              <button
                key={carPark.id}
                onClick={() => onSelectCarPark(carPark)}
                className={`relative flex-1 sm:flex-none px-4 py-3 rounded-lg border-2 transition-all text-left cursor-pointer ${
                  selectedCarPark.id === carPark.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30 bg-background"
                }`}
              >
                {carPark.id in availabilityMap && (
                  <span
                    className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                      availabilityMap[carPark.id] ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                )}
                <div className="font-medium text-foreground">
                  {carPark.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {carPark.location}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

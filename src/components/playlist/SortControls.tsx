"use client";

import { Button } from "@/components/ui/button";
import { usePlayerStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { SortMethod, TimeFilter } from "@/lib/types";

const sortMethods: { value: SortMethod; label: string }[] = [
  { value: "hot", label: "Hot" },
  { value: "new", label: "New" },
  { value: "top", label: "Top" },
];

const timeFilters: { value: TimeFilter; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

interface SortControlsProps {
  onSortChange?: () => void;
}

export function SortControls({ onSortChange }: SortControlsProps) {
  const { sortMethod, timeFilter, setSortMethod, setTimeFilter } = usePlayerStore();

  const handleSortChange = (method: SortMethod) => {
    setSortMethod(method);
    onSortChange?.();
  };

  const handleTimeChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    onSortChange?.();
  };

  return (
    <div className="space-y-3">
      {/* Sort Methods */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {sortMethods.map((method) => (
          <Button
            key={method.value}
            variant="ghost"
            size="sm"
            onClick={() => handleSortChange(method.value)}
            className={cn(
              "flex-1 transition-all",
              sortMethod === method.value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {method.label}
          </Button>
        ))}
      </div>

      {/* Time Filter (only show for "top") */}
      {sortMethod === "top" && (
        <div className="flex flex-wrap gap-1">
          {timeFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={timeFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeChange(filter.value)}
              className="text-xs"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}


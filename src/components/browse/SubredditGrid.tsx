"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, X, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/lib/store";
import { subredditCategories } from "@/data/subreddits";
import { cn, debounce } from "@/lib/utils";

interface CategorySectionProps {
  name: string;
  icon: string;
  color: string;
  subreddits: string[];
  selectedSubreddits: string[];
  onToggle: (subreddit: string) => void;
}

function CategorySection({
  name,
  icon,
  color,
  subreddits,
  selectedSubreddits,
  onToggle,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedSubs = isExpanded ? subreddits : subreddits.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-lg">{name}</h3>
        <div
          className="h-1 flex-1 rounded-full opacity-30"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {displayedSubs.map((sub) => {
          const isSelected = selectedSubreddits.includes(sub);
          return (
            <motion.button
              key={sub}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(sub)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
              style={{
                borderColor: isSelected ? color : "transparent",
                borderWidth: "1px",
              }}
            >
              <span className="flex items-center gap-1">
                {isSelected && <Check className="h-3 w-3" />}
                r/{sub}
              </span>
            </motion.button>
          );
        })}

        {subreddits.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground"
          >
            {isExpanded ? "Show less" : `+${subreddits.length - 8} more`}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

interface SubredditGridProps {
  onSubredditChange?: () => void;
}

export function SubredditGrid({ onSubredditChange }: SubredditGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customSubreddit, setCustomSubreddit] = useState("");
  const { selectedSubreddits, addSubreddit, removeSubreddit, setSelectedSubreddits } =
    usePlayerStore();

  const handleToggle = useCallback(
    (subreddit: string) => {
      if (selectedSubreddits.includes(subreddit)) {
        removeSubreddit(subreddit);
      } else {
        addSubreddit(subreddit);
      }
      onSubredditChange?.();
    },
    [selectedSubreddits, addSubreddit, removeSubreddit, onSubredditChange]
  );

  const handleAddCustom = useCallback(() => {
    if (customSubreddit.trim()) {
      const sub = customSubreddit.trim().replace(/^r\//, "");
      addSubreddit(sub);
      setCustomSubreddit("");
      onSubredditChange?.();
    }
  }, [customSubreddit, addSubreddit, onSubredditChange]);

  const handleClearAll = useCallback(() => {
    setSelectedSubreddits([]);
    onSubredditChange?.();
  }, [setSelectedSubreddits, onSubredditChange]);

  // Filter categories based on search
  const filteredCategories = subredditCategories.map((category) => ({
    ...category,
    subreddits: searchQuery
      ? category.subreddits.filter((sub) =>
          sub.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : category.subreddits,
  })).filter((category) => category.subreddits.length > 0);

  return (
    <div className="space-y-6">
      {/* Search and Custom Input */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subreddits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add custom subreddit..."
            value={customSubreddit}
            onChange={(e) => setCustomSubreddit(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
            className="bg-surface"
          />
          <Button onClick={handleAddCustom} disabled={!customSubreddit.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Selected Subreddits */}
      {selectedSubreddits.length > 0 && (
        <div className="glass rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-muted-foreground">
              Selected ({selectedSubreddits.length})
            </h4>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSubreddits.map((sub) => (
              <Badge
                key={sub}
                variant="glow"
                className="cursor-pointer group"
                onClick={() => handleToggle(sub)}
              >
                r/{sub}
                <X className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <ScrollArea className="h-[calc(100vh-500px)]">
        <div className="space-y-6 pr-4">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CategorySection
                name={category.name}
                icon={category.icon || "🎵"}
                color={category.color || "#ec4899"}
                subreddits={category.subreddits}
                selectedSubreddits={selectedSubreddits}
                onToggle={handleToggle}
              />
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


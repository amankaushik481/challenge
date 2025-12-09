"use client";

import { motion } from "framer-motion";
import { Music, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-b border-border/50 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-primary to-primary/70 p-2 rounded-xl">
                <Music className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-primary">Music</span> Player
              </h1>
              <p className="text-xs text-muted-foreground">for Reddit</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com/musicplayer-io/redditmusicplayer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-1" />
                Source
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://reddit.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Reddit
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}


"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Factory, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 lg:px-6">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Factory className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">
            NORTH GTA <span className="text-primary">STEEL</span>
          </p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            3D Building Designer
          </p>
        </div>
        <Badge variant="muted" className="ml-1 hidden md:inline-flex">
          Beta
        </Badge>
      </motion.div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Phone className="h-4 w-4" />
          647-744-7212
        </Button>
      </div>
    </header>
  );
}

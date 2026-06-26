"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Move3d, MousePointer2, Maximize } from "lucide-react";
import { useBuilding } from "@/lib/store";
import { footprint } from "@/lib/building";
import LogoImg from "@/public/markLogo.png";
function LogoLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-linear-to-b from-sky-200 to-sky-50">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <motion.img
          src={LogoImg.src}
          alt="North GTA Steel"
          width={80}
          height={80}
          className="h-20 w-20 drop-shadow-sm"
          initial={{ scale: 0.92, opacity: 0.7 }}
          animate={{ scale: [0.92, 1, 0.92], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold tracking-tight">
          NORTH GTA <span className="text-primary">STEEL</span>
        </p>
        <p className="text-xs text-muted-foreground">Loading 3D preview…</p>
      </div>
    </div>
  );
}

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <LogoLoader />,
});

export function Viewport() {
  const { config } = useBuilding();

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border bg-linear-to-b from-sky-200 to-sky-50">
      <Scene />

      {/* top-left spec chips */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2"
      >
        <span className="rounded-md bg-background/80 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
          {config.width}′ W × {config.length}′ L × {config.height}′ H
        </span>
        <span className="rounded-md bg-background/80 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
          {footprint(config).toLocaleString()} sq ft
        </span>
      </motion.div>

      {/* bottom controls hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-background/80 px-4 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur"
      >
        <span className="flex items-center gap-1.5">
          <MousePointer2 className="h-3.5 w-3.5" /> Drag to rotate
        </span>
        <span className="flex items-center gap-1.5">
          <Move3d className="h-3.5 w-3.5" /> Right-drag to pan
        </span>
        <span className="flex items-center gap-1.5">
          <Maximize className="h-3.5 w-3.5" /> Scroll to zoom
        </span>
      </motion.div>
    </div>
  );
}

"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Move3d, MousePointer2, Maximize, Ruler, Eye } from "lucide-react";
import { useBuilding } from "@/lib/store";
import { footprint } from "@/lib/building";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import LogoImg from "@/public/markLogo.png";

// Every texture the scene needs — preloaded + decoded before the 3D reveals,
// so the building never shows untextured.
const PRELOAD = [
  "/textures/steel/normal.png",
  "/textures/steel/roughness.jpg",
  "/textures/grass-ground/baseColor.jpg",
  "/textures/grass-ground/normal.png",
  "/textures/grass-ground/roughness.jpg",
];

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.onload = () =>
      (img.decode ? img.decode() : Promise.resolve())
        .catch(() => {})
        .finally(done);
    img.onerror = () => done(); // missing/optional file — don't block
    img.src = url;
  });
}

/** Downloads + decodes all textures and the Scene chunk, reporting progress. */
function useAssetsReady() {
  const [ready, setReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    let done = 0;
    const total = PRELOAD.length + 1; // +1 for the Scene JS chunk
    const tick = () => {
      done += 1;
      if (active) setProgress(Math.round((done / total) * 100));
    };
    const jobs: Promise<unknown>[] = PRELOAD.map((u) =>
      preloadImage(u).then(tick)
    );
    jobs.push(import("./Scene").then(tick, tick));
    Promise.all(jobs).then(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  return { ready, progress };
}

function LogoLoader({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-linear-to-b from-sky-200 to-sky-50">
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
      <div className="w-44 text-center">
        <p className="text-sm font-bold tracking-tight">
          NORTH GTA <span className="text-primary">STEEL</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Loading 3D preview… {progress}%
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

export function Viewport() {
  const { config, view, setBlueprint, setReveal } = useBuilding();
  const { ready, progress } = useAssetsReady();

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border bg-linear-to-b from-sky-200 to-sky-50">
      {!ready && <LogoLoader progress={progress} />}
      {!ready ? null : (
        <>
          <Scene />

      {/* top-right view controls */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute right-4 top-4 z-10 flex w-60 flex-col gap-3 rounded-xl border bg-background/85 p-3 shadow-sm backdrop-blur"
      >
        <button
          type="button"
          onClick={() => setBlueprint(!view.blueprint)}
          aria-pressed={view.blueprint}
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            view.blueprint
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-accent",
          )}
        >
          <span className="flex items-center gap-2">
            <Ruler className="h-4 w-4" /> Blueprint mode
          </span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
              view.blueprint
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {view.blueprint ? "On" : "Off"}
          </span>
        </button>

        {!view.blueprint && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium">
                <Eye className="h-4 w-4" /> Interior view
              </span>
              <span className="tabular-nums text-muted-foreground">
                {Math.round(view.reveal * 100)}%
              </span>
            </div>
            <Slider
              value={[view.reveal]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(v) => setReveal(v[0])}
              aria-label="Interior reveal"
            />
            <p className="text-[10px] leading-tight text-muted-foreground">
              Slide to fade the walls &amp; roof and reveal the steel frame
              inside.
            </p>
          </div>
        )}
      </motion.div>

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
        </>
      )}
    </div>
  );
}

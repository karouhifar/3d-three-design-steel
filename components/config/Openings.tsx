"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, DoorOpen, DoorClosed, AppWindow, Plus } from "lucide-react";
import { useBuilding } from "@/lib/store";
import {
  OpeningType,
  WallSide,
  OPENING_LABELS,
  SIDE_LABELS,
} from "@/lib/building";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SIDES: WallSide[] = ["front", "back", "left", "right"];
const TYPES: { type: OpeningType; icon: React.ReactNode }[] = [
  { type: "garage", icon: <DoorOpen className="h-4 w-4" /> },
  { type: "man", icon: <DoorClosed className="h-4 w-4" /> },
  { type: "window", icon: <AppWindow className="h-4 w-4" /> },
];

export function Openings() {
  const { config, addOpening, removeOpening, updateOpening } = useBuilding();

  return (
    <div className="space-y-5">
      {/* add buttons */}
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-tight">Add opening</p>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map(({ type, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => addOpening(type, "front")}
              className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 text-center transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                {icon}
              </span>
              <span className="text-xs font-medium leading-tight">
                {OPENING_LABELS[type]}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary opacity-0 transition-opacity group-hover:opacity-100">
                <Plus className="h-3 w-3" /> Add
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-tight">
            Placed openings
          </p>
          <span className="text-xs text-muted-foreground">
            {config.openings.length} total
          </span>
        </div>

        {config.openings.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            No openings yet. Add a door or window above.
          </p>
        )}

        <AnimatePresence initial={false}>
          {config.openings.map((o) => (
            <motion.div
              key={o.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {TYPES.find((t) => t.type === o.type)?.icon}
                    {OPENING_LABELS[o.type]}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    aria-label="Remove opening"
                    onClick={() => removeOpening(o.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={o.side}
                    onValueChange={(v) =>
                      updateOpening(o.id, { side: v as WallSide })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIDES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {SIDE_LABELS[s]} wall
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={o.type}
                    onValueChange={(v) =>
                      updateOpening(o.id, { type: v as OpeningType })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem
                          key={t.type}
                          value={t.type}
                          className="text-xs"
                        >
                          {OPENING_LABELS[t.type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Position</span>
                    <span className="tabular-nums">
                      {Math.round(o.offset * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[o.offset]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(v) => updateOpening(o.id, { offset: v[0] })}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

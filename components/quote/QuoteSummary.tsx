"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useBuilding } from "@/lib/store";
import {
  ROOF_LABELS,
  colorName,
  countByType,
  footprint,
  roofArea,
  ridgeRise,
} from "@/lib/building";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RequestQuote } from "./RequestQuote";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function QuoteSummary() {
  const { config } = useBuilding();
  const a = config.addons;

  const addonList = [
    a.leanTo && "Lean-to",
    a.skylights > 0 && `${a.skylights} skylight${a.skylights > 1 ? "s" : ""}`,
    a.vents > 0 && `${a.vents} ridge vent${a.vents > 1 ? "s" : ""}`,
    a.gutters && "Gutters",
    a.insulation && "Insulation",
  ].filter(Boolean) as string[];

  const ridge = config.height + ridgeRise(config);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full flex-col"
    >
      <div className="border-b px-5 py-4">
        <h2 className="text-base font-semibold">Quote summary</h2>
        <p className="text-xs text-muted-foreground">
          Live configuration — no pricing shown
        </p>
      </div>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dimensions
          </p>
          <Row label="Width" value={`${config.width} ft`} />
          <Row label="Length" value={`${config.length} ft`} />
          <Row label="Eave height" value={`${config.height} ft`} />
          <Row label="Peak height" value={`${ridge.toFixed(1)} ft`} />
          <Row label="Roof pitch" value={`${config.roofPitch}:12`} />
          <Row
            label="Footprint"
            value={`${footprint(config).toLocaleString()} sq ft`}
          />
          <Row
            label="Roof area"
            value={`${roofArea(config).toLocaleString()} sq ft`}
          />
        </div>

        <Separator />

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Roof & colors
          </p>
          <Row label="Roof style" value={ROOF_LABELS[config.roofStyle]} />
          <Row
            label="Walls"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border"
                  style={{ backgroundColor: config.wallColor }}
                />
                {colorName(config.wallColor)}
              </span>
            }
          />
          <Row
            label="Roof"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border"
                  style={{ backgroundColor: config.roofColor }}
                />
                {colorName(config.roofColor)}
              </span>
            }
          />
          <Row
            label="Trim"
            value={
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded-full border"
                  style={{ backgroundColor: config.trimColor }}
                />
                {colorName(config.trimColor)}
              </span>
            }
          />
          <Row
            label="Wainscot"
            value={
              config.wainscot ? colorName(config.wainscotColor) : "None"
            }
          />
        </div>

        <Separator />

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Openings
          </p>
          <Row label="Garage doors" value={countByType(config.openings, "garage")} />
          <Row label="Man doors" value={countByType(config.openings, "man")} />
          <Row label="Windows" value={countByType(config.openings, "window")} />
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Add-ons
          </p>
          {addonList.length ? (
            <div className="flex flex-wrap gap-1.5">
              {addonList.map((x) => (
                <Badge key={x} variant="secondary">
                  {x}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None selected</p>
          )}
        </div>
      </div>

      <div className="border-t bg-muted/30 p-4">
        <RequestQuote />
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          A specialist will follow up with engineered pricing.
        </p>
      </div>
    </motion.div>
  );
}

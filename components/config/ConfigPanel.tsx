"use client";

import * as React from "react";
import {
  Ruler,
  Paintbrush,
  DoorOpen,
  Home,
  PlusCircle,
  RotateCcw,
} from "lucide-react";
import { useBuilding } from "@/lib/store";
import {
  LIMITS,
  ROOF_LABELS,
  RoofStyle,
} from "@/lib/building";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Section,
  SliderField,
  ColorField,
  ToggleField,
  Stepper,
} from "./Controls";
import { Openings } from "./Openings";

const ROOFS: RoofStyle[] = ["regular", "boxed", "vertical"];

function RoofGlyph({ style, active }: { style: RoofStyle; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
      className="h-7 w-10"
    >
      {/* walls */}
      <path d="M10 30V16M38 30V16M10 30h28" />
      {style === "regular" && (
        // simple gable, eave flush with walls
        <path d="M8 17L24 7l16 10" />
      )}
      {style === "boxed" && (
        // gable with overhanging boxed eaves
        <>
          <path d="M5 18L24 7l19 11" />
          <path d="M5 18v2M43 18v2" />
        </>
      )}
      {style === "vertical" && (
        // gable with vertical roof panels
        <>
          <path d="M8 17L24 7l16 10" />
          <path d="M18 12.5v4M24 9.5v6M30 12.5v4" strokeWidth={1.2} />
        </>
      )}
    </svg>
  );
}

function RoofPicker() {
  const { config, set } = useBuilding();
  return (
    <div className="grid gap-2">
      {ROOFS.map((r) => {
        const active = config.roofStyle === r;
        return (
          <button
            key={r}
            type="button"
            onClick={() => set({ roofStyle: r })}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
              active
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-accent"
            )}
          >
            <span
              className={cn(
                "flex h-12 w-14 shrink-0 items-center justify-center rounded-md border",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              <RoofGlyph style={r} active={active} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{ROOF_LABELS[r]}</p>
              <p className="text-xs text-muted-foreground">
                {r === "regular" && "Economical, rounded eave trim"}
                {r === "boxed" && "Overhang eaves, finished look"}
                {r === "vertical" && "Vertical panels — best for snow/water"}
              </p>
            </div>
            {active && (
              <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

const TABS = [
  { value: "dimensions", label: "Size", icon: Ruler },
  { value: "exterior", label: "Color", icon: Paintbrush },
  { value: "openings", label: "Doors", icon: DoorOpen },
  { value: "roof", label: "Roof", icon: Home },
  { value: "addons", label: "Add-ons", icon: PlusCircle },
];

export function ConfigPanel() {
  const { config, set, setAddon, reset } = useBuilding();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Configure your building</h2>
          <p className="text-xs text-muted-foreground">
            Changes preview live in 3D
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={reset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="dimensions" className="flex flex-1 flex-col overflow-hidden">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-5">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex-col gap-1 py-2 text-[11px] data-[state=active]:text-primary"
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-6">
          <TabsContent value="dimensions">
            <Section
              title="Dimensions"
              description="Set the overall footprint and wall height."
            >
              <SliderField
                label="Width"
                unit="′"
                value={config.width}
                {...LIMITS.width}
                onChange={(v) => set({ width: v })}
              />
              <SliderField
                label="Length"
                unit="′"
                value={config.length}
                {...LIMITS.length}
                onChange={(v) => set({ length: v })}
              />
              <SliderField
                label="Eave Height"
                unit="′"
                value={config.height}
                {...LIMITS.height}
                onChange={(v) => set({ height: v })}
              />
              <SliderField
                label="Roof Pitch"
                unit=":12"
                value={config.roofPitch}
                {...LIMITS.roofPitch}
                onChange={(v) => set({ roofPitch: v })}
              />
            </Section>
          </TabsContent>

          <TabsContent value="exterior">
            <Section
              title="Exterior colors"
              description="Powder-coat steel panel colors."
            >
              <ColorField
                label="Wall color"
                value={config.wallColor}
                onChange={(hex) => set({ wallColor: hex })}
              />
              <ColorField
                label="Roof color"
                value={config.roofColor}
                onChange={(hex) => set({ roofColor: hex })}
              />
              <ColorField
                label="Trim color"
                value={config.trimColor}
                onChange={(hex) => set({ trimColor: hex })}
              />
              <ToggleField
                label="Wainscot"
                description="Accent panel on the lower 3.5′ of walls"
                checked={config.wainscot}
                onChange={(v) => set({ wainscot: v })}
              />
              {config.wainscot && (
                <ColorField
                  label="Wainscot color"
                  value={config.wainscotColor}
                  onChange={(hex) => set({ wainscotColor: hex })}
                />
              )}
            </Section>
          </TabsContent>

          <TabsContent value="openings">
            <Openings />
          </TabsContent>

          <TabsContent value="roof">
            <Section
              title="Roof style"
              description="Choose how the roof panels and eaves are built."
            >
              <RoofPicker />
            </Section>
          </TabsContent>

          <TabsContent value="addons">
            <Section title="Add-ons" description="Optional upgrades.">
              <ToggleField
                label="Lean-to"
                description="12′ covered open side shelter"
                checked={config.addons.leanTo}
                onChange={(v) => setAddon({ leanTo: v })}
              />
              <Stepper
                label="Skylights"
                value={config.addons.skylights}
                max={8}
                onChange={(v) => setAddon({ skylights: v })}
              />
              <Stepper
                label="Ridge vents"
                value={config.addons.vents}
                max={8}
                onChange={(v) => setAddon({ vents: v })}
              />
              <ToggleField
                label="Gutters & downspouts"
                checked={config.addons.gutters}
                onChange={(v) => setAddon({ gutters: v })}
              />
              <ToggleField
                label="Insulation package"
                description="Roof + wall insulation (not shown in preview)"
                checked={config.addons.insulation}
                onChange={(v) => setAddon({ insulation: v })}
              />
            </Section>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

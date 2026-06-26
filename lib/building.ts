// Domain model + defaults for the steel building configurator.
// All linear dimensions are in FEET. Scene scales feet -> three.js units 1:1.

export type WallSide = "front" | "back" | "left" | "right";
export type RoofStyle = "regular" | "boxed" | "vertical";
export type OpeningType = "garage" | "man" | "window";

export interface Opening {
  id: string;
  type: OpeningType;
  side: WallSide;
  /** horizontal position along the wall, 0 (left) .. 1 (right) */
  offset: number;
}

export interface AddOns {
  leanTo: boolean;
  skylights: number;
  vents: number;
  gutters: boolean;
  insulation: boolean;
}

export interface BuildingConfig {
  width: number; // gable-end span (ft)
  length: number; // eave length (ft)
  height: number; // eave height (ft)
  roofPitch: number; // rise per 12 of run
  roofStyle: RoofStyle;
  wallColor: string;
  roofColor: string;
  trimColor: string;
  wainscot: boolean;
  wainscotColor: string;
  openings: Opening[];
  addons: AddOns;
}

export const LIMITS = {
  width: { min: 12, max: 80, step: 1 },
  length: { min: 12, max: 200, step: 1 },
  height: { min: 8, max: 24, step: 1 },
  roofPitch: { min: 1, max: 6, step: 0.5 },
} as const;

export const ROOF_LABELS: Record<RoofStyle, string> = {
  regular: "Regular (rounded eave)",
  boxed: "Boxed Eave",
  vertical: "Vertical Roof",
};

export const OPENING_LABELS: Record<OpeningType, string> = {
  garage: "Garage Door",
  man: "Man Door",
  window: "Window",
};

export const SIDE_LABELS: Record<WallSide, string> = {
  front: "Front",
  back: "Back",
  left: "Left",
  right: "Right",
};

// Industrial steel palette (powder-coat style swatches).
export const PALETTE: { name: string; hex: string }[] = [
  { name: "Galvalume", hex: "#c8ccce" },
  { name: "Polar White", hex: "#eef1f2" },
  { name: "Light Stone", hex: "#d8cfbd" },
  { name: "Ash Gray", hex: "#9aa0a4" },
  { name: "Charcoal", hex: "#3c4043" },
  { name: "Burnished Slate", hex: "#4a3f3a" },
  { name: "Hawaiian Blue", hex: "#2e5d80" },
  { name: "Forest Green", hex: "#23402f" },
  { name: "Barn Red", hex: "#7c2a26" },
  { name: "Copper Penny", hex: "#8a4b2f" },
  { name: "Saddle Tan", hex: "#a07d54" },
  { name: "Brilliant Black", hex: "#1a1c1e" },
];

let idSeq = 0;
export function newOpening(type: OpeningType, side: WallSide = "front"): Opening {
  idSeq += 1;
  return { id: `op-${Date.now()}-${idSeq}`, type, side, offset: 0.5 };
}

export const DEFAULT_CONFIG: BuildingConfig = {
  width: 30,
  length: 40,
  height: 12,
  roofPitch: 3,
  roofStyle: "vertical",
  wallColor: "#9aa0a4",
  roofColor: "#3c4043",
  trimColor: "#eef1f2",
  wainscot: false,
  wainscotColor: "#3c4043",
  openings: [
    { id: "op-seed-1", type: "garage", side: "front", offset: 0.32 },
    { id: "op-seed-2", type: "man", side: "front", offset: 0.72 },
    { id: "op-seed-3", type: "window", side: "left", offset: 0.5 },
  ],
  addons: {
    leanTo: false,
    skylights: 0,
    vents: 2,
    gutters: true,
    insulation: false,
  },
};

// Derived geometry helpers ---------------------------------------------------

/** roof ridge rise above the eave, in feet */
export function ridgeRise(cfg: BuildingConfig): number {
  // pitch is rise/12 over half the width run
  return (cfg.width / 2) * (cfg.roofPitch / 12);
}

export function roofArea(cfg: BuildingConfig): number {
  const run = cfg.width / 2;
  const rafter = Math.sqrt(run * run + ridgeRise(cfg) ** 2);
  return Math.round(2 * rafter * cfg.length);
}

export function footprint(cfg: BuildingConfig): number {
  return Math.round(cfg.width * cfg.length);
}

export function colorName(hex: string): string {
  const found = PALETTE.find((p) => p.hex.toLowerCase() === hex.toLowerCase());
  return found ? found.name : hex.toUpperCase();
}

export function countByType(openings: Opening[], type: OpeningType): number {
  return openings.filter((o) => o.type === type).length;
}

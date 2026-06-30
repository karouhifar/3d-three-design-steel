"use client";

import * as React from "react";
import * as THREE from "three";

export interface SteelMaps {
  map: THREE.Texture | null;
  normalMap: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
  metalnessMap: THREE.Texture | null;
}

const EMPTY: SteelMaps = {
  map: null,
  normalMap: null,
  roughnessMap: null,
  metalnessMap: null,
};

// Drop the panel PBR maps here (see public/textures/steel/README.md).
// Any that are missing are simply skipped — the material falls back to color.
// `map` (basecolor) intentionally omitted: albedo comes from the wall colour so
// the picker tints the steel. Re-add `map: "/textures/steel/basecolor.jpg"` to
// use the baked panel colour instead.
const FILES: Partial<Record<keyof SteelMaps, string>> = {
  normalMap: "/textures/steel/normal.png",
  roughnessMap: "/textures/steel/roughness.jpg",
  metalnessMap: "/textures/steel/metalness.jpg",
};

/**
 * Loads the steel-panel PBR textures once. Non-blocking (no Suspense): each map
 * resolves independently and missing files are ignored, so the scene renders
 * even before the textures are dropped in.
 */
export function useSteelTextures(): SteelMaps {
  const [maps, setMaps] = React.useState<SteelMaps>(EMPTY);

  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    let active = true;

    (Object.keys(FILES) as (keyof SteelMaps)[]).forEach((key) => {
      const url = FILES[key];
      if (!url) return;
      loader.load(
        url,
        (tex) => {
          if (!active) return;
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          // basecolor is the only sRGB map; the rest are linear data maps
          if (key === "map") tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          setMaps((m) => ({ ...m, [key]: tex }));
        },
        undefined,
        () => {
          /* missing file — ignore, keep fallback color */
        }
      );
    });

    return () => {
      active = false;
    };
  }, []);

  return maps;
}

export const PANEL_W_FT = 19 / 12; // 19" rib panel width  ≈ 1.583 ft
export const PANEL_H_FT = 32 / 12; // 32" tile height       ≈ 2.667 ft

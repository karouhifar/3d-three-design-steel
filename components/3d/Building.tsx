"use client";

import * as React from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { BuildingConfig, Opening, WallSide, ridgeRise } from "@/lib/building";
import {
  useSteelTextures,
  type SteelMaps,
  PANEL_W_FT,
  PANEL_H_FT,
} from "./useSteelTextures";

const WALL_T = 0.35; // wall thickness (ft)
const TRIM_T = 0.45;

// blueprint palette
const BP_FILL = "#1d4a86";
const BP_LINE = "#bfe0ff";

export interface BuildingView {
  /** technical blueprint render */
  blueprint: boolean;
  /** 0 = solid shell, 1 = shell fully opened to reveal the interior */
  reveal: number;
}

function shellOpacity(view: BuildingView): number {
  if (view.blueprint) return 0.16;
  return 1 - 0.92 * view.reveal;
}
function shellTransparent(view: BuildingView): boolean {
  return view.blueprint || view.reveal > 0.001;
}

// ---- shared materials ------------------------------------------------------

/** Outer skin: fades with `reveal`, becomes line-art in blueprint mode.
 *  When `maps` + `repeat` are given (and not in blueprint), renders the ribbed
 *  steel-panel PBR texture, tiled to the real panel size. */
function Shell({
  color,
  view,
  metalness = 0.45,
  roughness = 0.55,
  maps,
  repeat,
}: {
  color: string;
  view: BuildingView;
  metalness?: number;
  roughness?: number;
  maps?: SteelMaps | null;
  repeat?: [number, number];
}) {
  const bp = view.blueprint;
  const transparent = shellTransparent(view);

  // clone the shared textures so each face can tile at its own repeat.
  // NOTE: albedo (color) comes from the wall colour so the picker tints the
  // steel — the panel relief/finish comes from normal + roughness + metalness.
  const tex = React.useMemo(() => {
    if (bp || !maps || !repeat) return null;
    if (!maps.normalMap && !maps.roughnessMap && !maps.metalnessMap) return null;
    const mk = (t: THREE.Texture | null) => {
      if (!t) return null;
      const c = t.clone();
      c.wrapS = c.wrapT = THREE.RepeatWrapping;
      c.repeat.set(Math.max(1, repeat[0]), Math.max(1, repeat[1]));
      c.needsUpdate = true;
      return c;
    };
    return {
      normalMap: mk(maps.normalMap),
      roughnessMap: mk(maps.roughnessMap),
      metalnessMap: mk(maps.metalnessMap),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bp, maps, repeat?.[0], repeat?.[1]]);

  return (
    <>
      {/* key forces a shader recompile when the maps arrive after first paint */}
      <meshStandardMaterial
        key={tex ? "textured" : "flat"}
        color={bp ? BP_FILL : color}
        normalMap={tex?.normalMap ?? undefined}
        roughnessMap={tex?.roughnessMap ?? undefined}
        metalnessMap={tex?.metalnessMap ?? undefined}
        metalness={bp ? 0 : tex ? 0.65 : metalness}
        roughness={bp ? 1 : roughness}
        transparent={transparent}
        opacity={shellOpacity(view)}
        depthWrite={!transparent}
        side={THREE.DoubleSide}
      />
      {bp && <Edges threshold={15} color={BP_LINE} />}
    </>
  );
}

/** Structure (frame, slab): stays visible so it reads as the interior. */
function StructMaterial({
  color,
  view,
  metalness = 0.6,
  roughness = 0.4,
}: {
  color: string;
  view: BuildingView;
  metalness?: number;
  roughness?: number;
}) {
  const bp = view.blueprint;
  return (
    <>
      <meshStandardMaterial
        color={bp ? BP_FILL : color}
        metalness={bp ? 0 : metalness}
        roughness={bp ? 1 : roughness}
      />
      {bp && <Edges threshold={15} color={BP_LINE} />}
    </>
  );
}

// ---- small reusable pieces -------------------------------------------------

function Trim({
  size,
  position,
  color,
  view,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
  view: BuildingView;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <StructMaterial color={color} view={view} />
    </mesh>
  );
}

/** A gable end: rectangle wall + triangular top, as one extruded shape. */
function GableEnd({
  width,
  height,
  rise,
  z,
  facing,
  color,
  view,
  maps,
}: {
  width: number;
  height: number;
  rise: number;
  z: number;
  facing: 1 | -1;
  color: string;
  view: BuildingView;
  maps?: SteelMaps | null;
}) {
  const geom = React.useMemo(() => {
    const s = new THREE.Shape();
    const hw = width / 2;
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, height);
    s.lineTo(0, height + rise);
    s.lineTo(-hw, height);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, {
      depth: WALL_T,
      bevelEnabled: false,
    });
  }, [width, height, rise]);

  return (
    <mesh
      geometry={geom}
      position={[0, 0, z - (facing === 1 ? 0 : WALL_T)]}
      castShadow
      receiveShadow
    >
      <Shell
        color={color}
        view={view}
        metalness={0.45}
        roughness={0.55}
        maps={maps}
        repeat={[width / PANEL_W_FT, (height + rise) / PANEL_H_FT]}
      />
    </mesh>
  );
}

function RoofPlane({
  cfg,
  side,
  color,
  view,
  maps,
}: {
  cfg: BuildingConfig;
  side: 1 | -1;
  color: string;
  view: BuildingView;
  maps?: SteelMaps | null;
}) {
  const rise = ridgeRise(cfg);
  const run = cfg.width / 2;
  const rafter = Math.sqrt(run * run + rise * rise);
  const overhang = cfg.roofStyle === "boxed" ? 0.8 : 0.4;
  const len = cfg.length + overhang * 2;
  const angle = Math.atan2(rise, run);

  return (
    <mesh
      position={[side * (run / 2), cfg.height + rise / 2, 0]}
      rotation={[0, 0, side === 1 ? -angle : angle]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[rafter + overhang, 0.18, len]} />
      <Shell
        color={color}
        view={view}
        metalness={0.7}
        roughness={cfg.roofStyle === "vertical" ? 0.35 : 0.5}
        maps={maps}
        repeat={[len / PANEL_W_FT, (rafter + overhang) / PANEL_H_FT]}
      />
    </mesh>
  );
}

// ---- openings --------------------------------------------------------------

function openingDims(o: Opening): { w: number; h: number; sill: number } {
  switch (o.type) {
    case "garage":
      return { w: 10, h: 9, sill: 0 };
    case "man":
      return { w: 3.5, h: 7, sill: 0 };
    case "window":
      return { w: 3.5, h: 3.5, sill: 4 };
  }
}

function placeOnWall(
  side: WallSide,
  offset: number,
  cfg: BuildingConfig,
  w: number
): { pos: [number, number, number]; rotY: number; spanAxisLen: number } {
  const margin = w / 2 + 1.5;
  const hw = cfg.width / 2;
  const hl = cfg.length / 2;
  // gable ends (front/back) extrude outward by WALL_T; side walls are centered
  // on the wall plane so their outer face is half a thickness out.
  const endFace = hl + WALL_T + 0.02;
  const sideFace = hw + WALL_T / 2 + 0.02;
  switch (side) {
    case "front": {
      const x = THREE.MathUtils.lerp(-hw + margin, hw - margin, offset);
      return { pos: [x, 0, endFace], rotY: 0, spanAxisLen: cfg.width };
    }
    case "back": {
      const x = THREE.MathUtils.lerp(-hw + margin, hw - margin, offset);
      return { pos: [x, 0, -endFace], rotY: Math.PI, spanAxisLen: cfg.width };
    }
    case "left": {
      const z = THREE.MathUtils.lerp(-hl + margin, hl - margin, offset);
      return { pos: [-sideFace, 0, z], rotY: -Math.PI / 2, spanAxisLen: cfg.length };
    }
    case "right": {
      const z = THREE.MathUtils.lerp(-hl + margin, hl - margin, offset);
      return { pos: [sideFace, 0, z], rotY: Math.PI / 2, spanAxisLen: cfg.length };
    }
  }
}

function OpeningMesh({
  o,
  cfg,
  trimColor,
  view,
}: {
  o: Opening;
  cfg: BuildingConfig;
  trimColor: string;
  view: BuildingView;
}) {
  const { w, h, sill } = openingDims(o);
  const { pos, rotY } = placeOnWall(o.side, o.offset, cfg, w);

  const bp = view.blueprint;
  const isGarage = o.type === "garage";
  const isWindow = o.type === "window";
  const panelColor = bp ? BP_FILL : isWindow ? "#bfe3ef" : "#2a2d30";
  const frameColor = bp ? BP_LINE : trimColor;
  // openings are part of the skin: fade them with reveal too
  const transparent = shellTransparent(view) || isWindow;
  const opacity = bp ? 0.18 : isWindow ? 0.65 * (1 - 0.92 * view.reveal) : 1 - 0.92 * view.reveal;

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* trim frame */}
      <mesh position={[0, sill + h / 2, 0]}>
        <boxGeometry args={[w + 0.5, h + 0.5, 0.12]} />
        <meshStandardMaterial
          color={frameColor}
          metalness={0.5}
          roughness={0.5}
          transparent={transparent}
          opacity={bp ? 0.5 : 1 - 0.92 * view.reveal}
          depthWrite={!transparent}
        />
        {bp && <Edges threshold={15} color={BP_LINE} />}
      </mesh>
      {/* panel / glass */}
      <mesh position={[0, sill + h / 2, 0.08]}>
        <boxGeometry args={[w, h, 0.1]} />
        <meshStandardMaterial
          color={panelColor}
          metalness={isWindow ? 0.1 : 0.4}
          roughness={isWindow ? 0.1 : 0.6}
          transparent={transparent}
          opacity={opacity}
          depthWrite={!transparent}
        />
      </mesh>
      {/* garage door horizontal seams */}
      {isGarage &&
        !bp &&
        view.reveal < 0.4 &&
        [0.2, 0.4, 0.6, 0.8].map((f) => (
          <mesh key={f} position={[0, sill + h * f, 0.14]}>
            <boxGeometry args={[w, 0.08, 0.02]} />
            <meshStandardMaterial
              color="#15171a"
              transparent={transparent}
              opacity={1 - 0.92 * view.reveal}
              depthWrite={!transparent}
            />
          </mesh>
        ))}
    </group>
  );
}

// ---- add-ons ---------------------------------------------------------------

function LeanTo({ cfg, view }: { cfg: BuildingConfig; view: BuildingView }) {
  const depth = 12;
  const hw = cfg.width / 2;
  const h = cfg.height * 0.85;
  const drop = 2;
  return (
    <group position={[hw + depth / 2, 0, 0]}>
      {[-cfg.length / 2 + 1, 0, cfg.length / 2 - 1].map((z) => (
        <mesh key={z} position={[depth / 2 - 0.3, h / 2, z]} castShadow>
          <boxGeometry args={[0.4, h, 0.4]} />
          <StructMaterial color="#3c4043" view={view} />
        </mesh>
      ))}
      <mesh
        position={[0, h, 0]}
        rotation={[0, 0, Math.atan2(drop, depth)]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[Math.hypot(depth, drop), 0.15, cfg.length]} />
        <Shell color={cfg.roofColor} view={view} metalness={0.7} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Skylights({ cfg, view }: { cfg: BuildingConfig; view: BuildingView }) {
  const rise = ridgeRise(cfg);
  const run = cfg.width / 2;
  const angle = Math.atan2(rise, run);
  const n = cfg.addons.skylights;
  const items = Array.from({ length: n }, (_, i) => i);
  return (
    <>
      {items.map((i) => {
        const z = THREE.MathUtils.lerp(
          -cfg.length / 2 + 4,
          cfg.length / 2 - 4,
          n === 1 ? 0.5 : i / (n - 1)
        );
        return (
          <mesh
            key={i}
            position={[run / 2, cfg.height + rise / 2 + 0.12, z]}
            rotation={[0, 0, -angle]}
          >
            <boxGeometry args={[3, 0.06, 3]} />
            <meshStandardMaterial
              color={view.blueprint ? BP_LINE : "#cfeefb"}
              transparent
              opacity={0.7}
              metalness={0.1}
              roughness={0.05}
              emissive={view.blueprint ? "#000000" : "#bfe3ef"}
              emissiveIntensity={0.2}
            />
          </mesh>
        );
      })}
    </>
  );
}

function RidgeVents({ cfg, view }: { cfg: BuildingConfig; view: BuildingView }) {
  const rise = ridgeRise(cfg);
  const n = cfg.addons.vents;
  const items = Array.from({ length: n }, (_, i) => i);
  return (
    <>
      {items.map((i) => {
        const z = THREE.MathUtils.lerp(
          -cfg.length / 2 + 5,
          cfg.length / 2 - 5,
          n === 1 ? 0.5 : i / (n - 1)
        );
        return (
          <mesh key={i} position={[0, cfg.height + rise + 0.6, z]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 1.2, 12]} />
            <StructMaterial color="#c8ccce" view={view} metalness={0.7} />
          </mesh>
        );
      })}
    </>
  );
}

function Gutters({
  cfg,
  color,
  view,
}: {
  cfg: BuildingConfig;
  color: string;
  view: BuildingView;
}) {
  const hw = cfg.width / 2;
  return (
    <>
      {[hw, -hw].map((x) => (
        <mesh key={x} position={[x, cfg.height - 0.1, 0]}>
          <boxGeometry args={[0.3, 0.3, cfg.length + 0.6]} />
          <Shell color={color} view={view} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </>
  );
}

// ---- the building ----------------------------------------------------------

export function Building({
  cfg,
  view,
}: {
  cfg: BuildingConfig;
  view: BuildingView;
}) {
  const hw = cfg.width / 2;
  const hl = cfg.length / 2;
  const rise = ridgeRise(cfg);
  const steel = useSteelTextures();

  const wainH = 3.5;

  const bays = Math.max(2, Math.round(cfg.length / 12));
  const colZ = Array.from({ length: bays + 1 }, (_, i) =>
    THREE.MathUtils.lerp(-hl, hl, i / bays)
  );

  return (
    <group position={[0, 0, 0]}>
      {/* ---- foundation slab (always visible = floor) ---- */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[cfg.width + 1, 0.3, cfg.length + 1]} />
        <StructMaterial color="#9c9e9f" view={view} metalness={0} roughness={0.95} />
      </mesh>

      {/* ---- side walls (long walls along Z) ---- */}
      {[hw, -hw].map((x) => (
        <group key={x}>
          <mesh position={[x, cfg.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[WALL_T, cfg.height, cfg.length]} />
            <Shell
              color={cfg.wallColor}
              view={view}
              maps={steel}
              repeat={[cfg.length / PANEL_W_FT, cfg.height / PANEL_H_FT]}
            />
          </mesh>
          {cfg.wainscot && (
            <mesh position={[x + (x > 0 ? 0.02 : -0.02), wainH / 2, 0]}>
              <boxGeometry args={[WALL_T, wainH, cfg.length]} />
              <Shell color={cfg.wainscotColor} view={view} metalness={0.5} roughness={0.5} />
            </mesh>
          )}
        </group>
      ))}

      {/* ---- gable end walls ---- */}
      <GableEnd
        width={cfg.width}
        height={cfg.height}
        rise={rise}
        z={hl}
        facing={1}
        color={cfg.wallColor}
        view={view}
        maps={steel}
      />
      <GableEnd
        width={cfg.width}
        height={cfg.height}
        rise={rise}
        z={-hl}
        facing={-1}
        color={cfg.wallColor}
        view={view}
        maps={steel}
      />
      {cfg.wainscot &&
        [hl + 0.03, -hl - WALL_T - 0.03].map((z) => (
          <mesh key={z} position={[0, wainH / 2, z]}>
            <boxGeometry args={[cfg.width, wainH, 0.05]} />
            <Shell color={cfg.wainscotColor} view={view} metalness={0.5} roughness={0.5} />
          </mesh>
        ))}

      {/* ---- steel frame columns (corners + bays) = interior structure ---- */}
      {colZ.map((z) =>
        [hw, -hw].map((x) => (
          <Trim
            key={`${x}-${z}`}
            size={[TRIM_T, cfg.height, TRIM_T]}
            position={[x, cfg.height / 2, z]}
            color={cfg.trimColor}
            view={view}
          />
        ))
      )}
      {/* ---- roof rafters (interior structure, shown when opened) ---- */}
      {colZ.map((z) => (
        <Trim
          key={`tie-${z}`}
          size={[cfg.width, TRIM_T, TRIM_T]}
          position={[0, cfg.height, z]}
          color={cfg.trimColor}
          view={view}
        />
      ))}

      {/* ---- corner / eave / gable trim ---- */}
      {[hw, -hw].map((x) => (
        <Trim
          key={`eave-${x}`}
          size={[0.5, 0.5, cfg.length + 0.5]}
          position={[x, cfg.height, 0]}
          color={cfg.trimColor}
          view={view}
        />
      ))}

      {/* ---- roof ---- */}
      <RoofPlane cfg={cfg} side={1} color={cfg.roofColor} view={view} maps={steel} />
      <RoofPlane cfg={cfg} side={-1} color={cfg.roofColor} view={view} maps={steel} />
      <Trim
        size={[0.6, 0.4, cfg.length + 0.8]}
        position={[0, cfg.height + rise, 0]}
        color={cfg.trimColor}
        view={view}
      />

      {/* ---- openings ---- */}
      {cfg.openings.map((o) => (
        <OpeningMesh key={o.id} o={o} cfg={cfg} trimColor={cfg.trimColor} view={view} />
      ))}

      {/* ---- add-ons ---- */}
      {cfg.addons.leanTo && <LeanTo cfg={cfg} view={view} />}
      {cfg.addons.skylights > 0 && <Skylights cfg={cfg} view={view} />}
      {cfg.addons.vents > 0 && <RidgeVents cfg={cfg} view={view} />}
      {cfg.addons.gutters && <Gutters cfg={cfg} color={cfg.trimColor} view={view} />}
    </group>
  );
}

"use client";

import * as React from "react";
import * as THREE from "three";
import { BuildingConfig, Opening, WallSide, ridgeRise } from "@/lib/building";

const WALL_T = 0.35; // wall thickness (ft)
const TRIM_T = 0.45;

// ---- small reusable pieces -------------------------------------------------

function Trim({
  size,
  position,
  color,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
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
}: {
  width: number;
  height: number;
  rise: number;
  z: number;
  facing: 1 | -1;
  color: string;
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
      <meshStandardMaterial color={color} metalness={0.45} roughness={0.55} />
    </mesh>
  );
}

/** Vertical-rib texture hint via thin emissive lines is overkill; use color only. */
function RoofPlane({
  cfg,
  side,
  color,
}: {
  cfg: BuildingConfig;
  side: 1 | -1;
  color: string;
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
      <meshStandardMaterial
        color={color}
        metalness={0.7}
        roughness={cfg.roofStyle === "vertical" ? 0.35 : 0.5}
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
}: {
  o: Opening;
  cfg: BuildingConfig;
  trimColor: string;
}) {
  const { w, h, sill } = openingDims(o);
  const { pos, rotY } = placeOnWall(o.side, o.offset, cfg, w);

  const isGarage = o.type === "garage";
  const isWindow = o.type === "window";
  const panelColor = isWindow ? "#bfe3ef" : "#2a2d30";

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* trim frame */}
      <mesh position={[0, sill + h / 2, 0]}>
        <boxGeometry args={[w + 0.5, h + 0.5, 0.12]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* panel / glass */}
      <mesh position={[0, sill + h / 2, 0.08]}>
        <boxGeometry args={[w, h, 0.1]} />
        <meshStandardMaterial
          color={panelColor}
          metalness={isWindow ? 0.1 : 0.4}
          roughness={isWindow ? 0.1 : 0.6}
          transparent={isWindow}
          opacity={isWindow ? 0.65 : 1}
        />
      </mesh>
      {/* garage door horizontal seams */}
      {isGarage &&
        [0.2, 0.4, 0.6, 0.8].map((f) => (
          <mesh key={f} position={[0, sill + h * f, 0.14]}>
            <boxGeometry args={[w, 0.08, 0.02]} />
            <meshStandardMaterial color="#15171a" />
          </mesh>
        ))}
      {/* window mullions */}
      {isWindow && (
        <>
          <mesh position={[0, sill + h / 2, 0.14]}>
            <boxGeometry args={[0.1, h, 0.02]} />
            <meshStandardMaterial color={trimColor} />
          </mesh>
          <mesh position={[0, sill + h / 2, 0.14]}>
            <boxGeometry args={[w, 0.1, 0.02]} />
            <meshStandardMaterial color={trimColor} />
          </mesh>
        </>
      )}
    </group>
  );
}

// ---- add-ons ---------------------------------------------------------------

function LeanTo({ cfg }: { cfg: BuildingConfig }) {
  const depth = 12;
  const hw = cfg.width / 2;
  const h = cfg.height * 0.85;
  const drop = 2;
  return (
    <group position={[hw + depth / 2, 0, 0]}>
      {/* posts */}
      {[-cfg.length / 2 + 1, 0, cfg.length / 2 - 1].map((z) => (
        <mesh key={z} position={[depth / 2 - 0.3, h / 2, z]} castShadow>
          <boxGeometry args={[0.4, h, 0.4]} />
          <meshStandardMaterial color="#3c4043" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* shed roof */}
      <mesh
        position={[0, h, 0]}
        rotation={[0, 0, Math.atan2(drop, depth)]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[Math.hypot(depth, drop), 0.15, cfg.length]} />
        <meshStandardMaterial color={cfg.roofColor} metalness={0.7} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Skylights({ cfg }: { cfg: BuildingConfig }) {
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
              color="#cfeefb"
              transparent
              opacity={0.7}
              metalness={0.1}
              roughness={0.05}
              emissive="#bfe3ef"
              emissiveIntensity={0.2}
            />
          </mesh>
        );
      })}
    </>
  );
}

function RidgeVents({ cfg }: { cfg: BuildingConfig }) {
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
            <meshStandardMaterial color="#c8ccce" metalness={0.7} roughness={0.4} />
          </mesh>
        );
      })}
    </>
  );
}

function Gutters({ cfg, color }: { cfg: BuildingConfig; color: string }) {
  const hw = cfg.width / 2;
  return (
    <>
      {[hw, -hw].map((x) => (
        <mesh key={x} position={[x, cfg.height - 0.1, 0]}>
          <boxGeometry args={[0.3, 0.3, cfg.length + 0.6]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </>
  );
}

// ---- the building ----------------------------------------------------------

export function Building({ cfg }: { cfg: BuildingConfig }) {
  const hw = cfg.width / 2;
  const hl = cfg.length / 2;
  const rise = ridgeRise(cfg);

  // wainscot band height
  const wainH = 3.5;

  // frame column positions along the length (every ~12 ft)
  const bays = Math.max(2, Math.round(cfg.length / 12));
  const colZ = Array.from({ length: bays + 1 }, (_, i) =>
    THREE.MathUtils.lerp(-hl, hl, i / bays)
  );

  return (
    <group position={[0, 0, 0]}>
      {/* ---- foundation slab ---- */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[cfg.width + 1, 0.3, cfg.length + 1]} />
        <meshStandardMaterial color="#9c9e9f" roughness={0.95} metalness={0} />
      </mesh>

      {/* ---- side walls (long walls along Z) ---- */}
      {[hw, -hw].map((x) => (
        <group key={x}>
          <mesh position={[x, cfg.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[WALL_T, cfg.height, cfg.length]} />
            <meshStandardMaterial
              color={cfg.wallColor}
              metalness={0.45}
              roughness={0.55}
            />
          </mesh>
          {cfg.wainscot && (
            <mesh position={[x + (x > 0 ? 0.02 : -0.02), wainH / 2, 0]}>
              <boxGeometry args={[WALL_T, wainH, cfg.length]} />
              <meshStandardMaterial
                color={cfg.wainscotColor}
                metalness={0.5}
                roughness={0.5}
              />
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
      />
      <GableEnd
        width={cfg.width}
        height={cfg.height}
        rise={rise}
        z={-hl}
        facing={-1}
        color={cfg.wallColor}
      />
      {cfg.wainscot &&
        [hl + 0.03, -hl - WALL_T - 0.03].map((z) => (
          <mesh key={z} position={[0, wainH / 2, z]}>
            <boxGeometry args={[cfg.width, wainH, 0.05]} />
            <meshStandardMaterial color={cfg.wainscotColor} metalness={0.5} />
          </mesh>
        ))}

      {/* ---- steel frame columns (corners + bays) ---- */}
      {colZ.map((z) =>
        [hw, -hw].map((x) => (
          <Trim
            key={`${x}-${z}`}
            size={[TRIM_T, cfg.height, TRIM_T]}
            position={[x, cfg.height / 2, z]}
            color={cfg.trimColor}
          />
        ))
      )}

      {/* ---- corner / eave / gable trim ---- */}
      {[hw, -hw].map((x) => (
        <Trim
          key={`eave-${x}`}
          size={[0.5, 0.5, cfg.length + 0.5]}
          position={[x, cfg.height, 0]}
          color={cfg.trimColor}
        />
      ))}

      {/* ---- roof ---- */}
      <RoofPlane cfg={cfg} side={1} color={cfg.roofColor} />
      <RoofPlane cfg={cfg} side={-1} color={cfg.roofColor} />
      {/* ridge cap */}
      <Trim
        size={[0.6, 0.4, cfg.length + 0.8]}
        position={[0, cfg.height + rise, 0]}
        color={cfg.trimColor}
      />

      {/* ---- openings ---- */}
      {cfg.openings.map((o) => (
        <OpeningMesh key={o.id} o={o} cfg={cfg} trimColor={cfg.trimColor} />
      ))}

      {/* ---- add-ons ---- */}
      {cfg.addons.leanTo && <LeanTo cfg={cfg} />}
      {cfg.addons.skylights > 0 && <Skylights cfg={cfg} />}
      {cfg.addons.vents > 0 && <RidgeVents cfg={cfg} />}
      {cfg.addons.gutters && <Gutters cfg={cfg} color={cfg.trimColor} />}
    </group>
  );
}

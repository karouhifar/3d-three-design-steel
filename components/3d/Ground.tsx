"use client";

import * as React from "react";
import * as THREE from "three";

const DIR = "/textures/grass-ground";
const SIZE = 2000; // ground plane size (ft)
const TILE_FT = 12; // one texture tile ≈ 12 ft
const REPEAT = SIZE / TILE_FT;

const FILES = {
  map: `${DIR}/baseColor.jpg`,
  normalMap: `${DIR}/normal.png`,
  roughnessMap: `${DIR}/roughness.jpg`,
};

type GroundMaps = {
  map: THREE.Texture | null;
  normalMap: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
};

function useGroundTextures(): GroundMaps {
  const [maps, setMaps] = React.useState<GroundMaps>({
    map: null,
    normalMap: null,
    roughnessMap: null,
  });

  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    let active = true;
    (Object.keys(FILES) as (keyof GroundMaps)[]).forEach((key) => {
      loader.load(
        FILES[key],
        (t) => {
          if (!active) return;
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(REPEAT, REPEAT);
          t.anisotropy = 8;
          if (key === "map") t.colorSpace = THREE.SRGBColorSpace;
          setMaps((m) => ({ ...m, [key]: t }));
        },
        undefined,
        () => {}
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return maps;
}

export function Ground() {
  const { map, normalMap, roughnessMap } = useGroundTextures();
  const textured = !!map;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[SIZE, SIZE]} />
      {/* key forces a shader recompile once the maps arrive after first paint */}
      <meshStandardMaterial
        key={textured ? "textured" : "flat"}
        color={textured ? "#ffffff" : "#5d9140"}
        map={map ?? undefined}
        normalMap={normalMap ?? undefined}
        roughnessMap={roughnessMap ?? undefined}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

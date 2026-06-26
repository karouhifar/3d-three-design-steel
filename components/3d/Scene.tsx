"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Sky,
  Center,
} from "@react-three/drei";
import { Building } from "./Building";
import { useBuilding } from "@/lib/store";

function Lights() {
  return (
    <>
      <hemisphereLight args={["#bfe3ff", "#4f7a35", 0.7]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[40, 60, 30]}
        intensity={2.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-30, 20, -20]} intensity={0.4} />
    </>
  );
}

export default function Scene() {
  const { config } = useBuilding();
  // distance scales with the building so it always frames nicely
  const reach = Math.max(config.width, config.length, config.height);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [reach * 1.2, reach * 0.8, reach * 1.4], fov: 40 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <color attach="background" args={["#bfe3ff"]} />
      <Sky
        distance={45000}
        sunPosition={[40, 60, 30]}
        inclination={0.52}
        azimuth={0.25}
        turbidity={5}
        rayleigh={1.6}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <fog attach="fog" args={["#d6ecff", reach * 4.5, reach * 10]} />

      <Lights />

      <Center disableY>
        <Building cfg={config} />
      </Center>

      {/* grass ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[4000, 4000]} />
        <meshStandardMaterial color="#5d9140" roughness={1} metalness={0} />
      </mesh>
      <ContactShadows
        position={[0, -0.03, 0]}
        opacity={0.42}
        scale={Math.max(80, reach * 2.5)}
        blur={2.4}
        far={40}
        resolution={1024}
        color="#1f3314"
      />

      <Environment preset="city" />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={reach * 0.4}
        maxDistance={reach * 4}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, config.height * 0.4, 0]}
      />
    </Canvas>
  );
}

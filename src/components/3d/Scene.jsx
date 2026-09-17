import React from "react";
import { PerspectiveCamera } from "@react-three/drei";
import Avatar from "./Avatar";

function SceneLights() {
  return (
    <>
      <ambientLight intensity={1.8} color="#ffffff" />
      <directionalLight position={[0, 4, 8]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[4, 6, 3]} intensity={0.8} color="#e8e0ff" />
      <directionalLight
        position={[-3, 3, -4]}
        intensity={0.3}
        color="#c4d8ff"
      />
      <directionalLight
        position={[-1.5, 2.5, -5]}
        intensity={0.55}
        color="#8fa8ff"
      />
    </>
  );
}

export default function Scene({ avatarConfig, animation = "Standing", extraRotationY = 0 }) {
  const cfg = avatarConfig;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={cfg.camera.fov}
        position={[
          cfg.camera.position.x,
          cfg.camera.position.y,
          cfg.camera.position.z,
        ]}
      />
      <SceneLights />
      <Avatar
        position={[cfg.position.x, cfg.position.y, cfg.position.z]}
        rotation={[cfg.rotation.x, cfg.rotation.y + extraRotationY, cfg.rotation.z]}
        scale={[cfg.scale, cfg.scale, cfg.scale]}
        animation={animation}
      />
    </>
  );
}

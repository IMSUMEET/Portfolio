import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Line, PerspectiveCamera } from "@react-three/drei";

/** Deterministic pseudo-random so the globe looks the same on every load. */
function rand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function sphericalPoint(radius, lat, lon) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** A handful of real-ish city coordinates so the arcs read as "global reach". */
const CITIES = [
  { lat: 47.6, lon: -122.3 }, // Seattle
  { lat: 40.7, lon: -74.0 }, // New York
  { lat: 51.5, lon: -0.1 }, // London
  { lat: 19.1, lon: 72.9 }, // Mumbai
  { lat: 35.7, lon: 139.7 }, // Tokyo
  { lat: -33.9, lon: 151.2 }, // Sydney
  { lat: 1.35, lon: 103.8 }, // Singapore
  { lat: 52.5, lon: 13.4 }, // Berlin
];

const ARC_PAIRS = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [1, 6],
  [2, 7],
  [4, 6],
];

function arcPoints(a, b, radius, segments = 48) {
  const start = sphericalPoint(radius, a.lat, a.lon);
  const end = sphericalPoint(radius, b.lat, b.lon);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const liftScale = 1 + start.distanceTo(end) / (radius * 2.6);
  mid.normalize().multiplyScalar(radius * liftScale);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(segments);
}

function LatLonWireframe({ radius }) {
  const lines = useMemo(() => {
    const out = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      for (let lon = -180; lon <= 180; lon += 6) {
        pts.push(sphericalPoint(radius, lat, lon));
      }
      out.push(pts);
    }
    for (let lon = -180; lon < 180; lon += 30) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 6) {
        pts.push(sphericalPoint(radius, lat, lon));
      }
      out.push(pts);
    }
    return out;
  }, [radius]);

  return (
    <>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#a89cff"
          transparent
          opacity={0.28}
          lineWidth={1}
        />
      ))}
    </>
  );
}

function ConnectionArcs({ radius }) {
  const groupRef = useRef();
  const arcs = useMemo(
    () =>
      ARC_PAIRS.map(([ai, bi], i) => ({
        points: arcPoints(CITIES[ai], CITIES[bi], radius),
        color: i % 3 === 0 ? "#fb923c" : i % 3 === 1 ? "#3b82f6" : "#f472b6",
        speed: 0.35 + rand(i * 7.1) * 0.5,
        offset: rand(i * 3.3),
      })),
    [radius],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((mesh, i) => {
      const arc = arcs[i];
      if (!arc || !mesh.isMesh) return;
      const p = (t * arc.speed + arc.offset) % 1;
      const idx = Math.min(arc.points.length - 1, Math.floor(p * arc.points.length));
      mesh.position.copy(arc.points[idx]);
      const pulse = 0.75 + 0.35 * Math.sin(t * 3 + i);
      mesh.scale.setScalar(pulse);
    });
  });

  return (
    <group>
      {arcs.map((arc, i) => (
        <Line
          key={i}
          points={arc.points}
          color={arc.color}
          transparent
          opacity={0.55}
          lineWidth={1.4}
        />
      ))}
      <group ref={groupRef}>
        {arcs.map((arc, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={arc.color} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CityMarkers({ radius }) {
  return (
    <>
      {CITIES.map((c, i) => {
        const p = sphericalPoint(radius, c.lat, c.lon);
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#6366f1" />
          </mesh>
        );
      })}
    </>
  );
}

function GlobeGroup() {
  const groupRef = useRef();
  const radius = 1.15;

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius * 0.985, 48, 48]} />
        <meshStandardMaterial
          color="#f4f1ff"
          transparent
          opacity={0.35}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      <LatLonWireframe radius={radius} />
      <ConnectionArcs radius={radius} />
      <CityMarkers radius={radius} />
    </group>
  );
}

/**
 * Decorative "global reach" globe for the Contact section — wireframe sphere
 * with pulsing connection arcs between a few city points. Purely ambient
 * (no controls / pointer events) so it sits behind the persistent avatar.
 */
export default function Globe() {
  return (
    <>
      <PerspectiveCamera makeDefault fov={40} position={[0, 0.15, 3.4]} />
      <ambientLight intensity={1.1} color="#e8e0ff" />
      <directionalLight position={[2, 3, 4]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-2, -1, -2]} intensity={0.4} color="#6366f1" />
      <GlobeGroup />
    </>
  );
}

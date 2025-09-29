"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { memo, useMemo, useRef } from "react";

function NeonTrailCursor() {
  const points = useMemo(() => new Array(60).fill(0).map((_, i) => new THREE.Vector3(i * 0.02, 0, 0)), []);
  const curveRef = useRef<THREE.CatmullRomCurve3>(new THREE.CatmullRomCurve3(points));
  const lineRef = useRef<THREE.Line>(null);

  const geometry = useMemo(() => new THREE.BufferGeometry(), []);
  const material = useMemo(() => new THREE.LineBasicMaterial({ color: new THREE.Color("#00f7ff"), transparent: true, opacity: 0.9 }), []);
  const lineObject = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);

  useFrame(({ pointer, viewport }) => {
    const x = (pointer.x * viewport.width) / 2;
    const y = (pointer.y * viewport.height) / 2;
    curveRef.current.points.pop();
    curveRef.current.points.unshift(new THREE.Vector3(x, y, 0));
    const positions = new Float32Array(curveRef.current.getPoints(100).flatMap((v) => [v.x, v.y, v.z]));
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();
  });

  return <primitive object={lineObject} ref={lineRef} />;
}

function SkillNodes() {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
    const topics = ["Solidity", "React", "Substrate", "Wagmi", "Viem", "Rust", "GraphQL", "Node.js", "Three.js", "Polkadot"];
    return topics.map((label, i) => ({
      label,
      phi: (i / topics.length) * Math.PI * 2,
      radius: 1.8 + (i % 3) * 0.2,
    }));
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.15;
  });

  return (
    <group ref={group}>
      {nodes.map((n, idx) => {
        const x = Math.cos(n.phi) * n.radius;
        const y = Math.sin(n.phi) * n.radius * 0.6;
        return (
          <group key={idx} position={[x, y, 0]}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#00f7ff" />
            </mesh>
            <Html center distanceFactor={8}>
              <div className="text-[10px] md:text-xs font-medium tracking-wide text-cyan-300 drop-shadow-[0_0_8px_rgba(0,247,255,0.8)]">
                {n.label}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function HologramAvatar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#00f7ff") },
    }),
    []
  );

  const vertex = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  const fragment = `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    float fresnel(vec3 normal, vec3 viewDir) {
      return pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
    }

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float f = fresnel(normalize(vNormal), viewDir);
      float scan = 0.6 + 0.4 * sin(vWorldPosition.y * 12.0 + uTime * 4.0);
      float glow = smoothstep(0.0, 1.0, f) * 0.9 + scan * 0.3;
      vec3 col = uColor * glow;
      gl_FragColor = vec4(col, 0.9);
    }
  `;

  useFrame(({ clock }) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * 1.2) * 0.12;
    meshRef.current.rotation.y = t * 0.3;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[0.7, 2]} />
      <shaderMaterial ref={materialRef} args={[{ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true }]} />
    </mesh>
  );
}

function NeonRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.1;
    ringRef.current.rotation.z = t * 0.25;
  });
  return (
    <mesh ref={ringRef} position={[0, -0.1, 0]}>
      <torusGeometry args={[1.2, 0.02, 16, 128]} />
      <meshBasicMaterial color="#00f7ff" transparent opacity={0.8} />
    </mesh>
  );
}

function ParticleHalo() {
  const count = 600;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.6 + (Math.random() - 0.5) * 0.1;
      arr[i * 3 + 0] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: new THREE.Color("#00f7ff"), size: 0.02, transparent: true, opacity: 0.9 }), []);
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return <points geometry={geo} material={mat} />;
}

function NeonGridFloor() {
  const gridRef = useRef<THREE.LineSegments>(null);
  const size = 20;
  const divisions = 40;
  const grid = useMemo(() => new THREE.GridHelper(size, divisions, new THREE.Color("#00f7ff"), new THREE.Color("#003a3d")), []);
  // Tilt visually for perspective
  useFrame(() => {
    if (gridRef.current) gridRef.current.position.y = -1.2;
  });
  return <primitive object={grid} ref={gridRef} rotation={[Math.PI / 2, 0, 0]} />;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color={"#00f7ff"} />
      <pointLight position={[-5, -5, -5]} intensity={0.6} color={"#004b4f"} />
    </>
  );
}

function Scene() {
  return (
    <>
      <Lights />
      <NeonGridFloor />
      <HologramAvatar />
      <NeonRing />
      <ParticleHalo />
      <SkillNodes />
      <NeonTrailCursor />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
}

function Hero3DBase() {
  return (
    <div className="relative h-[100dvh] w-full bg-black">
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <color attach="background" args={["#05080b"]} />
        <Scene />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-cyan-200 drop-shadow-[0_0_16px_rgba(0,247,255,0.6)]">Rohan Ranjan</h1>
        <p className="mt-3 text-sm sm:text-base md:text-lg text-cyan-300/80 max-w-[90vw] md:max-w-2xl">
          Full Stack + Web3 Engineer • dApps • SDKs • Realtime • DeFi • RWA • Substrate/EVM
        </p>
      </div>
    </div>
  );
}

export const Hero3D = memo(Hero3DBase);



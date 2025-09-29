"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Points, PointMaterial, Line } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";
import { skillCategories } from "@/config/skills";

function ParticleSphere() {
  const points = useMemo(() => {
    const num = 1500;
    const positions = new Float32Array(num * 3);
    for (let i = 0; i < num; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.random() * 0.2;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, []);
  return (
    <Points positions={points} stride={3} frustumCulled>
      <PointMaterial color={new THREE.Color("#00f7ff")} size={0.02} sizeAttenuation depthWrite={false} transparent />
    </Points>
  );
}

export function SkillsHolograph() {
  return (
    <section className="py-16 md:py-24">
      <h3 className="px-4 md:px-8 text-cyan-200 font-semibold mb-6">Skills</h3>
      <div className="h-[70vh] sm:h-[56vh] w-full bg-black/60">
        <Canvas camera={{ position: [0, 0, 4.6], fov: 60 }}>
          <color attach="background" args={["#04080b"]} />
          <ambientLight intensity={0.7} />
          <ParticleSphere />
          <FuturisticSkillsViz />
        </Canvas>
      </div>
      <div className="mt-6 px-4 md:px-8 grid md:grid-cols-2 gap-6">
        {skillCategories.map((cat) => (
          <div key={cat.name} className="rounded-xl border border-cyan-500/30 bg-cyan-900/10 p-4">
            <div className="text-cyan-200 font-medium mb-3">{cat.name}</div>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((s) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full border border-cyan-500/30 text-cyan-100/90">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FuturisticSkillsViz() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Place categories on a ring
  const radius = 1.9;
  const nodes = useMemo(() => {
    return skillCategories.map((cat, i) => {
      const angle = (i / skillCategories.length) * Math.PI * 2;
      return {
        idx: i,
        name: cat.name,
        pos: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.6, 0),
        weight: Math.min(1, cat.items.length / 20),
      };
    });
  }, []);

  // Build lightweight connectivity: connect adjacent + one skip
  const links = useMemo(() => {
    const arr: { a: number; b: number; strength: number }[] = [];
    const n = nodes.length;
    for (let i = 0; i < n; i++) {
      arr.push({ a: i, b: (i + 1) % n, strength: 0.8 });
      arr.push({ a: i, b: (i + 2) % n, strength: 0.4 });
    }
    return arr;
  }, [nodes.length]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Connection arcs */}
      {links.map((l, i) => {
        const A = nodes[l.a].pos;
        const B = nodes[l.b].pos;
        const mid = new THREE.Vector3().addVectors(A, B).multiplyScalar(0.5).add(new THREE.Vector3(0, 0, 0.8));
        const curve = new THREE.QuadraticBezierCurve3(A, mid, B);
        const pts = curve.getPoints(40);
        const active = hovered === l.a || hovered === l.b;
        return <Line key={i} points={pts} color={active ? "#00f7ff" : "#004b4f"} transparent opacity={active ? 0.9 : 0.4} />;
      })}

      {/* Nodes with labels */}
      {nodes.map((n) => {
        const active = hovered === n.idx;
        return (
          <group key={n.idx} position={n.pos.toArray()}>
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(n.idx);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHovered((prev) => (prev === n.idx ? null : prev));
              }}
            >
              <sphereGeometry args={[0.12 + n.weight * 0.12, 24, 24]} />
              <meshBasicMaterial color={active ? "#00f7ff" : "#00777b"} />
            </mesh>
            <Html center distanceFactor={8}>
              <div className={"text-[10px] md:text-xs font-medium tracking-wide " + (active ? "text-cyan-200" : "text-cyan-300/80")}>{n.name}</div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}



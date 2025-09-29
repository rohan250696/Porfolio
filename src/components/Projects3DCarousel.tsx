"use client";

import { Canvas } from "@react-three/fiber";
import { Html, Float } from "@react-three/drei";
import { projects3D } from "@/config/projects";
import * as THREE from "three";
import { useMemo } from "react";

function Card({ idx, title, desc, link, tags, total }: { idx: number; title: string; desc: string; link: string; tags?: string[]; total: number }) {
  const radius = 2.2;
  const angle = (idx / total) * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.8} position={[x, 0, z]}>
      <mesh rotation={[0, -angle + Math.PI / 2, 0]}>
        <boxGeometry args={[1.2, 0.8, 0.04]} />
        <meshStandardMaterial color={new THREE.Color("#00f7ff").multiplyScalar(0.06)} />
        <Html center distanceFactor={8}>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="block w-48 rounded-lg border border-cyan-500/30 bg-black/60 p-3 text-cyan-100 hover:border-cyan-400/60 hover:shadow-[0_0_24px_rgba(0,247,255,0.2)] transition"
          >
            <div className="font-semibold text-cyan-200">{title}</div>
            <div className="text-xs text-cyan-300/80">{desc}</div>
            {tags && tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.slice(0, 4).map((t, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-300/90">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 text-[10px] text-cyan-300/70">Open ↗</div>
          </a>
        </Html>
      </mesh>
    </Float>
  );
}

function Starfield() {
  const count = 1200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);
  const geo = useMemo(() => new THREE.BufferGeometry(), []);
  const mat = useMemo(() => new THREE.PointsMaterial({ color: new THREE.Color("#00f7ff"), size: 0.01, transparent: true, opacity: 0.7 }), []);
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return <points geometry={geo} material={mat} />;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 4]} intensity={1} />
      {projects3D.map((it, i) => (
        <Card key={i} idx={i} title={it.title} desc={it.desc} link={it.link} tags={it.tags} total={projects3D.length} />
      ))}
    </>
  );
}

export function Projects3DCarousel() {
  return (
    <section className="py-16 md:py-24">
      <h3 className="px-4 md:px-8 text-cyan-200 font-semibold mb-6">Projects</h3>
      <div className="h-[70vh] sm:h-[60vh] xs:h-[64vh] w-full bg-black/60">
        <Canvas camera={{ position: [0, 1.2, 4.2], fov: 60 }}>
          <color attach="background" args={["#04080b"]} />
          <Scene />
        </Canvas>
      </div>
    </section>
  );
}



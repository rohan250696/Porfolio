"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Html, Float } from "@react-three/drei";
import { projects3D } from "@/config/projects";
import * as THREE from "three";
import { useMemo, useEffect } from "react";

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
            className="block w-40 sm:w-48 rounded-lg border border-cyan-500/30 bg-black/60 p-2 sm:p-3 text-cyan-100 hover:border-cyan-400/60 hover:shadow-[0_0_24px_rgba(0,247,255,0.2)] transition"
          >
            <div className="font-semibold text-sm sm:text-base text-cyan-200">{title}</div>
            <div className="text-xs sm:text-sm text-cyan-300/80">{desc}</div>
            {tags && tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.slice(0, 3).map((t, i) => (
                  <span key={i} className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full border border-cyan-500/30 text-cyan-300/90">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 text-[9px] sm:text-[10px] text-cyan-300/70">Open ↗</div>
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

function ResponsiveCamera() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      if (size.width < 768) {
        camera.fov = 75;
      } else {
        camera.fov = 60;
      }
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width]);
  
  return null;
}

function Scene() {
  return (
    <>
      <ResponsiveCamera />
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
    <section className="py-8 md:py-16 lg:py-24">
      <div className="px-4 md:px-8 mb-6">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(0,247,255,0.6)]">
          Projects
        </h3>
        <p className="text-sm md:text-base text-cyan-300/90 max-w-2xl">
          Interactive 3D showcase of my latest projects and contributions
        </p>
      </div>
      <div className="h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] w-full bg-black/60 relative overflow-hidden">
        <Canvas 
          camera={{ 
            position: [0, 1.2, 4.2], 
            fov: 60 
          }}
          className="w-full h-full"
        >
          <color attach="background" args={["#04080b"]} />
          <Scene />
        </Canvas>
      </div>
    </section>
  );
}



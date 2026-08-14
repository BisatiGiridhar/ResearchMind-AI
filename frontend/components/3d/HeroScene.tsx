'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GlowingSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1.8, 64, 64]} scale={1.2}>
      <MeshDistortMaterial
        color="#4f46e5"
        attach="material"
        distort={0.35}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        wireframe={false}
      />
    </Sphere>
  );
}

function OrbitingRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ringRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * speed;
      ringRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.3;
    }
  });

  return (
    <group ref={ringRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius, radius + 0.03, 64]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-[450px] relative flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

        <GlowingSphere />
        <OrbitingRing radius={2.6} speed={0.4} color="#06b6d4" />
        <OrbitingRing radius={3.1} speed={-0.3} color="#a855f7" />
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      {/* Decorative Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

import React, { RefObject, useCallback, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Color, Material, Points, Vector3 } from "three";

const G = 0.005;

function ParticlesV2({ maxDistance = 500 }: { maxDistance?: number }) {
  const count = 300; // 파티클 수
  const particles = React.useRef<Points>(null);
  const particlesData = React.useRef({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
    colors: new Float32Array(count * 3)
  });

  const initParticle = useCallback(
    (
      particlesData: React.MutableRefObject<{
        positions: Float32Array;
        velocities: Float32Array;
        colors: Float32Array;
      }>,
      i: number
    ) => {
      const color = new Color(Math.random() * 0xffffff);
      const positions = particlesData.current.positions;
      const velocities = particlesData.current.velocities;
      const colors = particlesData.current.colors;
      positions[i * 3] = -5;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      velocities[i * 3] = (Math.random() + 0.5) * 0.15;
      velocities[i * 3 + 1] = (Math.random() + 0.5) * 0.15;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    },
    [count]
  );

  // 초기화
  for (let i = 0; i < count; i++) {
    initParticle(particlesData, i);
  }

  useFrame(() => {
    if (!particles.current) return;

    const positions = particlesData.current.positions;
    const velocities = particlesData.current.velocities;

    for (let i = 0; i < count; i++) {
      const particlePosition = new Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );

      velocities[i * 3 + 1] -= G;
      particlePosition.x += velocities[i * 3];
      particlePosition.y += velocities[i * 3 + 1];
      particlePosition.z += velocities[i * 3 + 2];

      const dist = particlePosition.length();
      const minProbability = 0.01;
      const maxProbability = 0.99;
      const probability =
        Math.pow(dist / maxDistance, 2) * (maxProbability - minProbability) +
        minProbability;

      if (Math.random() < probability) {
        initParticle(particlesData, i);
      } else {
        positions[i * 3] = particlePosition.x;
        positions[i * 3 + 1] = particlePosition.y;
        positions[i * 3 + 2] = particlePosition.z;
      }
    }
    particles.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlesData.current.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particlesData.current.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        transparent
        opacity={1}
        vertexColors
      ></pointsMaterial>
    </points>
  );
}

export default ParticlesV2;

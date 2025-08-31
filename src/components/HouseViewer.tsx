"use client";

import React from "react";
import { useMemo, useRef, useState, useCallback } from "react";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import {
  ACESFilmicToneMapping,
  NoToneMapping,
  SRGBColorSpace,
  HalfFloatType,
  Mesh,
  Group,
  Vector3,
  Box3
} from "three";
import {
  EffectComposer,
  Outline,
  ToneMapping as ToneMappingEffect
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

function HouseModel({ onSelectMesh }: { onSelectMesh: (m: Mesh) => void }) {
  const { scene } = useGLTF("/models/house/house.glb");
  // primitive에 이벤트를 달면 하위 mesh에서 버블업됨
  const handlePointerDown = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const obj = e.object as Mesh;
      if ((obj as any).isMesh) onSelectMesh(obj);
    },
    [onSelectMesh]
  );
  return <primitive object={scene} onPointerDown={handlePointerDown} />;
}

useGLTF.preload("/models/house/house.glb");

function CenterCameraOnModel({
  groupRef,
  controlsRef
}: {
  groupRef: React.RefObject<Group>;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();

  React.useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const box = new Box3().setFromObject(group);
    const center = new Vector3();
    box.getCenter(center);

    const size = new Vector3();
    box.getSize(size);
    const distance = Math.max(size.x, size.y, size.z) * 1;

    camera.position.set(center.x, center.y + distance, center.z);
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    const orbit = controlsRef.current;
    if (orbit?.target) {
      orbit.target.copy(center);
      orbit.update?.();
    }
  }, [groupRef, camera, controlsRef]);

  return null;
}

export default function HouseViewerRepro() {
  const [useRendererToneMapping, setUseRendererToneMapping] = useState(true); // 문제 재현 ON
  const [useHalfFloat, setUseHalfFloat] = useState(false); // 8bit→HDR로 전환
  const [useComposerToneMapping, setUseComposerToneMapping] = useState(false); // 수정 파이프라인
  const [alwaysOnComposer, setAlwaysOnComposer] = useState(false); // EffectComposer ON/OFF 토글
  const [selectedMeshes, setSelectedMeshes] = useState<Mesh[]>([]);

  const groupRef = useRef<Group>(null);
  const controlsRef = useRef<any>(null);

  const toggleSelect = useCallback((mesh: Mesh) => {
    setSelectedMeshes(prev => {
      const exists = prev.includes(mesh);
      if (exists) return prev.filter(m => m !== mesh);
      return [...prev, mesh];
    });
  }, []);

  const glProps = useMemo(
    () => ({
      outputColorSpace: SRGBColorSpace,
      // 문제 재현을 위해 기본은 ACES 톤매핑 ON
      toneMapping: useRendererToneMapping
        ? ACESFilmicToneMapping
        : NoToneMapping
    }),
    [useRendererToneMapping]
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#111"
      }}
    >
      {/* 작은 실험용 UI */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 10,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px 12px",
          borderRadius: 8,
          fontSize: 12,
          lineHeight: 1.4,
          userSelect: "none"
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Repro toggles</div>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={alwaysOnComposer}
            onChange={e => setAlwaysOnComposer(e.target.checked)}
          />{" "}
          EffectComposer Always ON
        </label>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={useRendererToneMapping}
            onChange={e => setUseRendererToneMapping(e.target.checked)}
          />{" "}
          Renderer ToneMapping (ACES) ON
        </label>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={useComposerToneMapping}
            onChange={e => setUseComposerToneMapping(e.target.checked)}
          />{" "}
          Add ToneMappingEffect at end
        </label>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={useHalfFloat}
            onChange={e => setUseHalfFloat(e.target.checked)}
          />{" "}
          Composer HalfFloat (HDR buffer)
        </label>
        <div style={{ marginTop: 8, opacity: 0.8 }}>
          - Click meshes to toggle selection.
          <br />- Selected meshes get Outline (Blend: SCREEN).
        </div>
      </div>

      <Canvas
        gl={glProps}
        camera={{
          fov: 50
        }}
      >
        <Environment files="/models/house/environment.hdr" background />

        <group ref={groupRef} position={[0, 0, 0]} scale={[5, 5, 5]}>
          <HouseModel onSelectMesh={toggleSelect} />
        </group>
        <CenterCameraOnModel groupRef={groupRef} controlsRef={controlsRef} />
        <OrbitControls makeDefault ref={controlsRef} />

        {/* 질문과 동일하게 Composer는 상시 ON, Outline은 조건부 */}
        {(alwaysOnComposer || selectedMeshes.length > 0) && (
          <EffectComposer
            multisampling={8}
            autoClear={false}
            // 기본은 8bit(LDR) → 밝기 차이를 보기 쉬움
            // HalfFloat로 바꾸면 HDR 품질↑ (현상 완화 비교 가능)
            frameBufferType={useHalfFloat ? HalfFloatType : undefined}
          >
            {selectedMeshes.length > 0 ? (
              <Outline
                // 기본 합성은 SCREEN → 밝게 덧씌워져 "발광"처럼 보임
                blendFunction={BlendFunction.SCREEN}
                selection={selectedMeshes}
                edgeStrength={5}
                pulseSpeed={0}
                blur={false}
                xRay
                visibleEdgeColor={0x66b2fe}
                hiddenEdgeColor={0x66b2fe}
                width={500}
                height={500}
              />
            ) : (
              <></>
            )}

            {/* 수정 파이프라인 비교: 렌더러 톤매핑 OFF일 때 여기에 추가 */}
            {useComposerToneMapping ? (
              <ToneMappingEffect mode={ToneMappingMode.AGX} />
            ) : (
              <></>
            )}
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}

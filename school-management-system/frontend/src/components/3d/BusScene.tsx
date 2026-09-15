import { Suspense, useMemo } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { SCHOOL } from "../../lib/schoolMedia";
import { SceneCanvas, SceneLoader } from "./SceneCanvas";
import { BusProps } from "./SceneProps";
import { useWebGLSupport } from "./useWebGLSupport";
import { MediaImage } from "../media";
import { cn } from "../ui";

function RouteRibbon({ progress }: { progress: number }) {
  const markers = useMemo(
    () =>
      [0, 0.25, 0.5, 0.75, 1].map((t, i) => ({
        t,
        x: -3.2 + t * 6.4,
        z: Math.sin(t * Math.PI) * 0.9,
        label: ["Campus", "Stop 1", "Stop 2", "Stop 3", "Drop"][i],
      })),
    []
  );

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#dce6df" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[7.2, 0.55]} />
        <meshStandardMaterial color="#26262E" roughness={0.7} />
      </mesh>
      {markers.map((m) => (
        <group key={m.label} position={[m.x, 0.05, m.z]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color={m.t <= progress / 100 ? "#F0A500" : "#2B2B32"} metalness={0.3} roughness={0.4} />
          </mesh>
          <Html center distanceFactor={12} style={{ pointerEvents: "none" }}>
            <span className="rounded bg-ink-950/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">{m.label}</span>
          </Html>
        </group>
      ))}
    </group>
  );
}

function BusWorld({ progress, code }: { progress: number; code: string }) {
  const bus = useRef<Group>(null);
  const t = Math.min(1, Math.max(0, progress / 100));
  useFrame(() => {
    if (!bus.current) return;
    bus.current.position.x = -3.2 + t * 6.4;
    bus.current.position.z = Math.sin(t * Math.PI) * 0.9;
    bus.current.position.y = 0.05;
  });
  return (
    <>
      <RouteRibbon progress={progress} />
      <group ref={bus} scale={0.55}>
        <BusProps progress={t} />
        <Html position={[0, 2.2, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div className="rounded-lg border border-white/20 bg-ink-950/85 px-2.5 py-1.5 text-center text-white shadow-pop">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gilt-400">{code}</p>
            <p className="text-[10px] text-amber-200">DEMO GPS</p>
          </div>
        </Html>
      </group>
      <fog attach="fog" args={["#F4F4F5", 10, 22]} />
    </>
  );
}

export function BusScene({
  progress = 50,
  code = "TWHPS-BUS",
  className,
  fallbackSrc = SCHOOL.transport,
}: {
  progress?: number;
  code?: string;
  className?: string;
  fallbackSrc?: string;
}) {
  const { ok, quality } = useWebGLSupport();

  if (!ok || quality === "off") {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <MediaImage src={fallbackSrc} alt="School bus" className="h-full min-h-[280px] w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Demo tracking</p>
          <p className="mt-1 font-display text-xl">{code}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-[320px] overflow-hidden bg-[#F4F4F5]", className)}>
      <Suspense fallback={<SceneLoader />}>
        <SceneCanvas camera={{ position: [0, 4.2, 8.5], fov: 36 }} className="h-full min-h-[320px] w-full" clearColor="#F4F4F5">
          <BusWorld progress={progress} code={code} />
        </SceneCanvas>
      </Suspense>
      <p className="pointer-events-none absolute bottom-3 left-4 rounded-full bg-amber-100/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900">
        Simulated location — not live GPS
      </p>
    </div>
  );
}

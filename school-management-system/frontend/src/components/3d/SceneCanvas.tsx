import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { cn } from "../ui";
import { useWebGLSupport, type RenderQuality } from "./useWebGLSupport";

export function SceneLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 animate-pulse bg-gradient-to-br from-[#26262E] via-[#111114] to-[#26262E]", className)}
      aria-hidden
    />
  );
}

export function EnvironmentLights({ quality = "high" }: { quality?: Exclude<RenderQuality, "off"> }) {
  return (
    <>
      <ambientLight intensity={quality === "high" ? 0.75 : 0.9} />
      <hemisphereLight args={["#e8f0ea", "#1a2e24", 0.5]} />
      <directionalLight castShadow={quality === "high"} position={[6, 10, 4]} intensity={1.35} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 6, -3]} intensity={0.45} color="#F0A500" />
    </>
  );
}

export function SceneCanvas({
  children,
  className,
  camera = { position: [0, 2.2, 5.5], fov: 40 },
  shadows = true,
  fallback,
  clearColor = "#F4F4F5",
}: {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  shadows?: boolean;
  fallback?: ReactNode;
  clearColor?: string;
}) {
  const { ok, quality } = useWebGLSupport();
  if (!ok || quality === "off") {
    return <>{fallback ?? <SceneLoader className={className} />}</>;
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Canvas
        dpr={quality === "low" ? [1, 1.25] : [1, 1.75]}
        shadows={shadows && quality === "high"}
        camera={camera}
        gl={{ antialias: true, alpha: false, powerPreference: quality === "high" ? "high-performance" : "low-power" }}
        onCreated={({ gl }) => gl.setClearColor(clearColor, 1)}
        style={{ touchAction: "none" }}
      >
        <Suspense fallback={null}>
          <EnvironmentLights quality={quality === "low" ? "low" : "high"} />
          {children}
          {shadows && quality === "high" ? <ContactShadows position={[0, -0.01, 0]} opacity={0.28} scale={18} blur={2.2} far={10} /> : null}
        </Suspense>
      </Canvas>
    </div>
  );
}

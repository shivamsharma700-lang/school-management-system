/**
 * Remaining 3D surface.
 *
 * The low-poly campus explorer and the per-icon WebGL canvases were removed:
 * a dashboard was mounting twelve live contexts to draw twelve 40px icons, and
 * at that scale the meshes read as a game rather than a school product. Real
 * photography with depth replaced both. What stays is the cinematic hero, which
 * earns its single context.
 */
export { CinematicHero } from "./CinematicHero";
export { Premium3DIcon } from "./Premium3DIcon";
export { BusScene } from "./BusScene";
export { SceneCanvas, SceneLoader } from "./SceneCanvas";
export { useWebGLSupport } from "./useWebGLSupport";

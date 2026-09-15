import { useEffect, useState } from "react";

export type RenderQuality = "high" | "low" | "off";

export function useWebGLSupport() {
  const [ok, setOk] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setOk(Boolean(gl));
    } catch {
      setOk(false);
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqMobile = window.matchMedia("(max-width: 768px)");
    setReduced(mq.matches);
    setMobile(mqMobile.matches);
    const onMotion = () => setReduced(mq.matches);
    const onMobile = () => setMobile(mqMobile.matches);
    mq.addEventListener?.("change", onMotion);
    mqMobile.addEventListener?.("change", onMobile);
    return () => {
      mq.removeEventListener?.("change", onMotion);
      mqMobile.removeEventListener?.("change", onMobile);
    };
  }, []);

  const quality: RenderQuality = !ok || reduced ? "off" : mobile ? "low" : "high";
  return { ok, reduced, mobile, quality };
}

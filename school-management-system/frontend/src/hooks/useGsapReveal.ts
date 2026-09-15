import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/**
 * Scroll reveal for public pages.
 *
 * FAIL-VISIBLE CONTRACT: content is visible by default (see `[data-reveal]` in
 * index.css). This hook only ever animates *towards* the visible state, and the
 * hidden start is applied by GSAP at runtime — so if JS fails, the hook bails,
 * reduced-motion is on, or a ScrollTrigger never fires, the content still reads.
 * A previous version used `fromTo(..., {autoAlpha: 0})`, which left 30 elements
 * permanently `visibility:hidden` when the custom scroller was not measured yet.
 */
export function useGsapReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // content already visible — nothing to do

    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }

    // The public shell scrolls in its own container, not the document.
    const scroller = (el.closest(".public-page") as HTMLElement | null) ?? undefined;

    let refreshRaf = 0;
    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]", el);

      targets.forEach((node) => {
        const tween = gsap.from(node, {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: "power2.out",
          paused: true,
          // Critical: without this, a `from` tween applies autoAlpha:0 the moment
          // it is created — hiding content before any trigger exists. Deferring
          // the start state means the node stays visible until it actually plays.
          immediateRender: false,
          // Never leave the node mid-animation in a hidden state.
          onInterrupt: () => {
            gsap.set(node, { autoAlpha: 1, y: 0 });
          },
        });

        ScrollTrigger.create({
          trigger: node,
          scroller,
          start: "top 92%",
          once: true,
          onEnter: () => {
            tween.play();
          },
          // If the trigger is created while already past the start, play now.
          onRefresh: (self) => {
            if (self.isActive || self.progress > 0) tween.play();
          },
        });
      });
    }, el);

    // Layout settles after fonts/images; refresh so in-viewport triggers fire.
    const refresh = () => ScrollTrigger.refresh();
    refreshRaf = requestAnimationFrame(() => requestAnimationFrame(refresh));

    const imgs = Array.from(el.querySelectorAll("img"));
    const pending = imgs.filter((i) => !i.complete);
    pending.forEach((i) => {
      i.addEventListener("load", refresh, { once: true });
      i.addEventListener("error", refresh, { once: true });
    });
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});

    const onResize = () => refresh();
    window.addEventListener("resize", onResize);

    // Safety net: whatever happened above, nothing stays invisible.
    const failSafe = window.setTimeout(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]", el).forEach((node) => {
        if (Number(getComputedStyle(node).opacity) === 0) {
          gsap.set(node, { autoAlpha: 1, y: 0 });
        }
      });
    }, 2000);

    return () => {
      cancelAnimationFrame(refreshRaf);
      window.clearTimeout(failSafe);
      window.removeEventListener("resize", onResize);
      pending.forEach((i) => {
        i.removeEventListener("load", refresh);
        i.removeEventListener("error", refresh);
      });
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

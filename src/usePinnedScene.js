import { useEffect } from "react";

export const clamp = (value) => Math.max(0, Math.min(1, value));
export const segment = (progress, start, end) =>
  clamp((progress - start) / (end - start));
export const smooth = (value) =>
  value * value * value * (value * (value * 6 - 15) + 10);

// Native scrolling remains untouched. Only the scene catches up with a short,
// time-based damping pass; no animation frames run once the scene has settled.
export default function usePinnedScene(rootRef, stageRef, setup) {
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const paint = setup(stage);
    let frame = null;
    let target = 0;
    let progress = 0;
    let lastTime = 0;
    let width = stage.clientWidth;
    let height = stage.clientHeight;
    const render = () => {
      stage.style.setProperty("--scene-progress", `${progress * 100}%`);
      paint({ progress, width, height, reduced: reduced.matches });
    };
    const tick = (time) => {
      const delta = Math.min(64, Math.max(0, time - lastTime));
      lastTime = time;
      progress += (target - progress) * (1 - Math.exp(-delta / 115));
      if (Math.abs(target - progress) < 0.0001) {
        progress = target;
        frame = null;
        stage.dataset.motion = "settled";
      } else frame = requestAnimationFrame(tick);
      render();
    };
    const update = () => {
      const rect = root.getBoundingClientRect();
      width = stage.clientWidth;
      height = stage.clientHeight;
      target = reduced.matches
        ? 1
        : clamp(-rect.top / Math.max(1, root.offsetHeight - height));
      if (
        reduced.matches ||
        rect.bottom <= 0 ||
        rect.top >= innerHeight ||
        document.hidden
      ) {
        cancelAnimationFrame(frame);
        frame = null;
        progress = target;
        stage.dataset.motion = "settled";
        render();
      } else if (frame === null) {
        stage.dataset.motion = "moving";
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    document.addEventListener("visibilitychange", update);
    reduced.addEventListener("change", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      document.removeEventListener("visibilitychange", update);
      reduced.removeEventListener("change", update);
    };
  }, [rootRef, stageRef, setup]);
}

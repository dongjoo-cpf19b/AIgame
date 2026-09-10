"use client";

import { useEffect, useRef } from "react";

export default function ButtonFeedback() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function showFeedback(event: MouseEvent) {
      if (!layer || reducedMotion.matches || event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;

      const rect = button.getBoundingClientRect();
      // Keyboard and assistive-technology activation use the button's center.
      const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
      const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;
      const burst = document.createElement("span");
      burst.className = "buttonBurst";
      burst.style.left = `${x}px`;
      burst.style.top = `${y}px`;

      // Bound the decorative nodes even during rapid repeated input.
      while (layer.childElementCount >= 6) layer.firstElementChild?.remove();
      for (let i = 0; i < 4; i++) {
        const spark = document.createElement("i");
        spark.style.setProperty("--spark-x", `${i % 2 === 0 ? -24 : 24}px`);
        spark.style.setProperty("--spark-y", `${i < 2 ? -20 : 20}px`);
        burst.appendChild(spark);
      }
      burst.addEventListener("animationend", (animationEvent) => {
        if (animationEvent.target === burst) burst.remove();
      });
      layer.appendChild(burst);
    }

    // Capture before a game action replaces the clicked screen.
    document.addEventListener("click", showFeedback, true);
    return () => {
      document.removeEventListener("click", showFeedback, true);
      layer.replaceChildren();
    };
  }, []);

  return <div ref={layerRef} className="buttonFeedbackLayer" aria-hidden="true" />;
}

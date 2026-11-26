import React from "react";
export function Contour() {
  return (
    <svg
      className="contour"
      viewBox="0 0 240 900"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: 22 }, (_, i) => (
        <path
          key={i}
          d={`M${180 + i * 8} -50 C${30 + i * 9} 180 ${290 + i * 2} 230 ${160 + i * 5} 450 S${-100 + i * 9} 650 ${90 + i * 7} 950`}
          stroke="#a37acb"
          strokeOpacity={0.18 + i * 0.009}
          strokeWidth=".8"
        />
      ))}
    </svg>
  );
}
export function Wireform() {
  return (
    <svg viewBox="0 0 130 75" fill="none" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse
          key={i}
          cx="65"
          cy="37.5"
          rx={48 - i * 2.3}
          ry={9 + i * 1.4}
          transform={`rotate(${i * 15} 65 37.5)`}
          stroke="#c5b5d7"
          strokeWidth=".55"
        />
      ))}
    </svg>
  );
}

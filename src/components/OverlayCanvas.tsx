import { useEffect, useRef, useState } from "react";
import { BoxDto, ApiClassProb, normalizeProbs } from "@/lib/predictionTypes";
import { getDamageLabel } from "@/lib/damage";

interface OverlayCanvasProps {
  src: string;
  boxes: BoxDto[];
  heatmapUrl?: string | null;
  showHeatmap: boolean;
  heatmapOpacity?: number;
  onImageLoaded?: (w: number, h: number) => void;
}

type HoveredState = {
  idx: number;
  x: number;
  y: number;
  probs: ApiClassProb[];
} | null;

function toDisplayRect(
  box: BoxDto,
  dispW: number,
  dispH: number,
  natW: number,
  natH: number
) {
  const sx = dispW / natW;
  const sy = dispH / natH;
  const left = box.x * natW * sx;
  const top = box.y * natH * sy;
  const width = box.w * natW * sx;
  const height = box.h * natH * sy;
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    area: width * height,
  };
}

export function OverlayCanvas({
  src,
  boxes,
  heatmapUrl,
  showHeatmap,
  heatmapOpacity = 0.5,
  onImageLoaded,
}: OverlayCanvasProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const effectiveOpacity = Math.max(0, Math.min(1, 1 - heatmapOpacity));
  
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState<HoveredState>(null);

  const updateDimensions = () => {
    if (imgRef.current) {
      setDisplayDimensions({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setNaturalDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
      setDisplayDimensions({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
      if (onImageLoaded) {
        onImageLoaded(imgRef.current.clientWidth, imgRef.current.clientHeight);
      }
    }
  };

  const handleContainerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const W = displayDimensions.width;
      const H = displayDimensions.height;
      const nW = naturalDimensions.width;
      const nH = naturalDimensions.height;
      if (!W || !H || !nW || !nH) return setHovered(null);

      const candidates = boxes
        .map((b, i) => ({ i, r: toDisplayRect(b, W, H, nW, nH) }))
        .filter(({ r }) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);

      if (candidates.length === 0) {
        setHovered(null);
        return;
      }

      const chosen = candidates.reduce((a, b) => (a.r.area <= b.r.area ? a : b));
      const probs = normalizeProbs(boxes[chosen.i].class_probs);

      setHovered({ idx: chosen.i, x, y, probs });
    });
  };

  const handleContainerLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setHovered(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block w-full rounded-lg overflow-hidden"
      onMouseMove={handleContainerMove}
      onMouseLeave={handleContainerLeave}
    >
      {/* Raw image */}
      <img
        ref={imgRef}
        src={src}
        alt="Detection"
        className="w-full h-auto rounded-lg select-none block"
        onLoad={handleImageLoad}
        loading="lazy"
      />

      {/* Heatmap overlay - 박스별 clip-path */}
      {showHeatmap && heatmapUrl && boxes.length > 0 && displayDimensions.width > 0 && (
        <>
          {boxes.map((box, i) => {
            const W = displayDimensions.width;
            const H = displayDimensions.height;
            const scaleX = W / naturalDimensions.width;
            const scaleY = H / naturalDimensions.height;
            const left = box.x * naturalDimensions.width * scaleX;
            const top = box.y * naturalDimensions.height * scaleY;
            const width = box.w * naturalDimensions.width * scaleX;
            const height = box.h * naturalDimensions.height * scaleY;
            const right = Math.max(0, W - (left + width));
            const bottom = Math.max(0, H - (top + height));
            const clip = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
            return (
              <img
                key={`hm-${i}`}
                src={heatmapUrl}
                alt=""
                className="absolute pointer-events-none"
                style={{
                  left: 0,
                  top: 0,
                  width: `${W}px`,
                  height: `${H}px`,
                  clipPath: clip,
                  opacity: effectiveOpacity,
                  mixBlendMode: "multiply",
                  zIndex: 20,
                }}
              />
            );
          })}
        </>
      )}

      {/* Bounding boxes */}
      {naturalDimensions.width > 0 && displayDimensions.width > 0 && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
          {boxes.map((box, idx) => {
            const scaleX = displayDimensions.width / naturalDimensions.width;
            const scaleY = displayDimensions.height / naturalDimensions.height;

            const left = box.x * naturalDimensions.width * scaleX;
            const top = box.y * naturalDimensions.height * scaleY;
            const width = box.w * naturalDimensions.width * scaleX;
            const height = box.h * naturalDimensions.height * scaleY;

            const sortedProbs = normalizeProbs(box.class_probs);
            const top1 = sortedProbs[0];

            if (!top1) return null;

            const isHovered = hovered?.idx === idx;

            return (
              <div
                key={idx}
                className="absolute rounded-md pointer-events-none"
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                  border: '2px solid #2563eb',
                  boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.35) inset',
                  background: showHeatmap ? 'transparent' : 'rgba(37, 99, 235, 0.08)',
                  outline: isHovered ? '2px solid #3b82f6' : undefined,
                  zIndex: 30,
                }}
              >
                {/* Label badge */}
                <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {getDamageLabel(top1.label)} {(top1.prob * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute z-[1000] text-white text-xs rounded-md px-3 py-2 pointer-events-none whitespace-nowrap"
          style={{
            left: `${Math.min(Math.max(hovered.x + 12, 8), displayDimensions.width - 208)}px`,
            top: `${Math.min(Math.max(hovered.y + 12, 8), displayDimensions.height - 128)}px`,
            background: 'rgba(0, 0, 0, 0.85)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div className="font-semibold mb-1 text-xs">확률 분포</div>
          {hovered.probs.map((prob, idx) => (
            <div key={idx} className="leading-5 flex justify-between gap-3">
              <span className="font-medium">{getDamageLabel(prob.label)}</span>
              <span className="tabular-nums">{(prob.prob * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

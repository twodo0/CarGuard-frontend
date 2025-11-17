import { useState, useRef, useEffect } from "react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { DetectionDto } from "@/lib/dto";
import { normalizedToPixel } from "@/lib/box";
import { getDamageLabel, getDamageColor } from "@/lib/damage";

interface DetectionViewerProps {
  rawUrl: string;
  heatmapUrl?: string | null;
  detections?: DetectionDto[];
  alt?: string;
}

export function DetectionViewer({ rawUrl, heatmapUrl, detections, alt }: DetectionViewerProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [opacity, setOpacity] = useState(50);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [rawUrl]);

  const hasHeatmap = !!heatmapUrl;

  return (
    <div className="space-y-4">
      <div ref={imgRef} className="relative rounded-lg overflow-hidden bg-muted">
        <img
          src={rawUrl}
          alt={alt || "차량 이미지"}
          className="w-full h-auto"
          onLoad={() => {
            if (imgRef.current) {
              const rect = imgRef.current.getBoundingClientRect();
              setDimensions({ width: rect.width, height: rect.height });
            }
          }}
        />

        {hasHeatmap && showHeatmap && (
          <img
            src={heatmapUrl}
            alt="히트맵"
            className="absolute inset-0 w-full h-full"
            style={{ opacity: opacity / 100 }}
          />
        )}

        {detections && dimensions.width > 0 && detections.map((det, idx) => {
          const box = normalizedToPixel(det, dimensions.width, dimensions.height);
          const color = getDamageColor(box.top1Label as any);

          return (
            <div
              key={idx}
              className="absolute border-2 pointer-events-none"
              style={{
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
                borderColor: color,
              }}
            >
              <div
                className="absolute -top-6 left-0 px-2 py-1 rounded text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {getDamageLabel(box.top1Label as any)} {(box.top1Prob * 100).toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>

      {hasHeatmap && (
        <div className="space-y-3 bg-card p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Switch
              id="heatmap-toggle"
              checked={showHeatmap}
              onCheckedChange={setShowHeatmap}
            />
            <Label htmlFor="heatmap-toggle">히트맵 표시</Label>
          </div>

          {showHeatmap && (
            <div className="space-y-2">
              <Label>투명도: {opacity}%</Label>
              <Slider
                value={[opacity]}
                onValueChange={(val) => setOpacity(val[0])}
                min={0}
                max={100}
                step={5}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

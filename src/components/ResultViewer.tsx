import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { PredictionDetail, ClassProb } from "@/types/api";
import {
  normalizedBoxToPixels,
  formatPercent,
  BoxPixels,
} from "@/lib/utils-coords";
import { Badge } from "./ui/badge";

interface ResultViewerProps {
  prediction: PredictionDetail;
}

export function ResultViewer({ prediction }: ResultViewerProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.5);
  const [hoveredBox, setHoveredBox] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const hasDetections = prediction.detections.length > 0;

  // 새 prediction이 왔는데 히트맵이 유효하지 않으면 자동으로 끔
  useEffect(() => {
    if (!prediction.heatMapUrl || !hasDetections) {
      setShowHeatmap(false);
    }
  }, [prediction.heatMapUrl, hasDetections]);

  useEffect(() => {
    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
    };
    img.src = prediction.rawUrl;
  }, [prediction.rawUrl]);

  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    setHoveredBox(index);
    updateTooltipPos(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredBox !== null) {
      updateTooltipPos(e);
    }
  };

  const updateTooltipPos = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const getTopLabel = (
    probs: ClassProb[]
  ): { label: string; prob: number } => {
    if (probs.length === 0) return { label: "Unknown", prob: 0 };
    const top = probs.reduce(
      (max, p) => (p.prob > max.prob ? p : max),
      probs[0]
    );
    const labelText = top.label ?? top.damageType ?? "Unknown";
    return { label: labelText, prob: top.prob };
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>탐지 결과</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-heatmap"
              checked={showHeatmap}
              onCheckedChange={(checked) => setShowHeatmap(checked === true)}
              // 히트맵 URL도 있고 박스도 있을 때만 활성화
              disabled={!prediction.heatMapUrl || !hasDetections}
            />
            <Label htmlFor="show-heatmap" className="cursor-pointer">
              히트맵 표시
              {(!prediction.heatMapUrl || !hasDetections) && " (없음)"}
            </Label>
          </div>

          {showHeatmap && prediction.heatMapUrl && hasDetections && (
            <div className="flex items-center gap-2 flex-1">
              <Label htmlFor="heatmap-opacity" className="whitespace-nowrap">
                투명도:
              </Label>
              <Slider
                id="heatmap-opacity"
                min={0}
                max={1}
                step={0.1}
                value={[heatmapOpacity]}
                onValueChange={(value) => setHeatmapOpacity(value[0])}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12">
                {(heatmapOpacity * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="relative inline-block w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredBox(null)}
        >
          {/* Raw image */}
          <img
            src={prediction.rawUrl}
            alt="Detection result"
            className="w-full h-auto rounded-lg"
            onLoad={(e) => {
              const img = e.currentTarget;
              setImageDimensions({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            }}
          />

          {/* Heatmap overlay - 박스가 있을 때만 */}
          {showHeatmap && prediction.heatMapUrl && hasDetections && (
            <img
              src={prediction.heatMapUrl}
              alt="Heatmap overlay"
              className="absolute top-0 left-0 w-full h-auto rounded-lg pointer-events-none"
              style={{ opacity: 1 - heatmapOpacity }}
            />
          )}

          {/* Bounding boxes */}
          {imageDimensions.width > 0 &&
            prediction.detections.map((detection, index) => {
              const box: BoxPixels = normalizedBoxToPixels(
                detection,
                imageDimensions.width,
                imageDimensions.height
              );

              // Calculate display dimensions based on current image display size
              const displayImg = containerRef.current?.querySelector("img");
              const displayWidth =
                displayImg?.clientWidth || imageDimensions.width;
              const displayHeight =
                displayImg?.clientHeight || imageDimensions.height;

              const scaleX = displayWidth / imageDimensions.width;
              const scaleY = displayHeight / imageDimensions.height;

              const displayBox = {
                x: box.x * scaleX,
                y: box.y * scaleY,
                w: box.w * scaleX,
                h: box.h * scaleY,
              };

              const topLabel = getTopLabel(detection.class_probs);

              return (
                <div
                  key={index}
                  className="absolute border-2 border-primary cursor-pointer transition-all hover:border-accent hover:shadow-lg"
                  style={{
                    left: `${displayBox.x}px`,
                    top: `${displayBox.y}px`,
                    width: `${displayBox.w}px`,
                    height: `${displayBox.h}px`,
                  }}
                  onMouseEnter={(e) => handleMouseEnter(index, e)}
                  onMouseLeave={() => setHoveredBox(null)}
                >
                  {/* Top label chip */}
                  <Badge className="absolute -top-6 left-0 bg-primary text-primary-foreground text-xs">
                    {topLabel.label}: {formatPercent(topLabel.prob)}
                  </Badge>
                </div>
              );
            })}

          {/* Tooltip for hovered box */}
          {hoveredBox !== null && (
            <div
              className="absolute z-50 bg-popover border border-border rounded-lg shadow-lg p-3 pointer-events-none"
              style={{
                left: `${tooltipPos.x + 10}px`,
                top: `${tooltipPos.y + 10}px`,
              }}
            >
              <p className="font-semibold mb-2 text-sm">확률 분포</p>
              <div className="space-y-1">
                {prediction.detections[hoveredBox].class_probs.map(
                  (prob, idx) => {
                    const labelText =
                      prob.label ?? prob.damageType ?? "Unknown";
                    return (
                      <div
                        key={idx}
                        className="flex justify-between gap-4 text-xs"
                      >
                        <span className="text-muted-foreground">
                          {labelText}:
                        </span>
                        <span className="font-medium">
                          {formatPercent(prob.prob)}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>총 {prediction.detections.length}개의 손상이 탐지되었습니다</p>
          <p className="text-xs mt-1">
            박스에 마우스를 올려 상세 확률을 확인하세요
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
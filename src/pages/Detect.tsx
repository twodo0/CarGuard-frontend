import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { OverlayCanvas } from "@/components/OverlayCanvas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { uploadImage, detectByImageId, pollJob } from "@/lib/api";
import { BoxDto, normalizeProbs } from "@/lib/predictionTypes";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X } from "lucide-react";

export default function Detect() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [threshold, setThreshold] = useState("0.3");
  const [loading, setLoading] = useState(false);
  
  const [boxes, setBoxes] = useState<BoxDto[]>([]);
  const [heatmapUrl, setHeatmapUrl] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.5);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      
      // Reset detection state
      setBoxes([]);
      setHeatmapUrl(null);
      setShowHeatmap(false);
    }
  };

  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setBoxes([]);
    setHeatmapUrl(null);
    setShowHeatmap(false);
  };

  const handleDetect = async () => {
    if (!file) {
      toast({ title: "이미지를 선택해주세요", variant: "destructive" });
      return;
    }

    setLoading(true);
    setBoxes([]);
    setHeatmapUrl(null);
    setShowHeatmap(false);

    try {
      const { imageId } = await uploadImage(file);
      toast({ title: "이미지 업로드 완료", description: `Image ID: ${imageId}` });

      const { jobId } = await detectByImageId(imageId, parseFloat(threshold) || 0.3);
      toast({ title: "탐지 시작", description: "결과를 기다리는 중..." });

      const result = await pollJob(jobId);
      
      // Normalize and filter boxes
      const validBoxes = (result.detections || [])
        .map((det: any) => ({
          ...det,
          class_probs: normalizeProbs(det.class_probs)
        }))
        .filter((det: any) => det.class_probs.length > 0);
      
      setBoxes(validBoxes);
      
      if (validBoxes.length > 0 && result.heatmapUrl) {
        setHeatmapUrl(result.heatmapUrl);
      } else {
        setHeatmapUrl(null);
        setShowHeatmap(false);
      }
      
      toast({ 
        title: "탐지 완료", 
        description: validBoxes.length > 0 
          ? `${validBoxes.length}개의 손상 탐지됨` 
          : "손상이 발견되지 않았습니다"
      });
    } catch (error: any) {
      toast({
        title: "탐지 실패",
        description: error?.message || '탐지에 실패했습니다.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canToggleHeatmap = heatmapUrl && boxes.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            데미지 탐지
          </h1>
          <p className="text-muted-foreground mb-8">
            개별 사진에 대해 손상을 분석하고 히트맵과 바운딩 박스로 시각화합니다.
          </p>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-lg space-y-4">
              <div>
                <Label htmlFor="image-upload">이미지 업로드</Label>
                <div className="mt-2">
                  {!preview ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors bg-muted/30">
                      <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">클릭하여 이미지 선택</span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-auto rounded-xl"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 w-8 rounded-md flex items-center justify-center"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="threshold">탐지 임계값</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="mt-2"
                  placeholder="0.3"
                />
              </div>

              <Button
                onClick={handleDetect}
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    탐지 중...
                  </>
                ) : (
                  "손상 탐지 시작"
                )}
              </Button>
            </div>

            {boxes.length > 0 && preview && (
              <div className="bg-card rounded-xl p-6 shadow-lg space-y-4">
                <h2 className="text-2xl font-bold">탐지 결과</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="show-heatmap"
                      checked={showHeatmap}
                      onCheckedChange={(checked) => setShowHeatmap(checked === true)}
                      disabled={!canToggleHeatmap}
                    />
                    <Label htmlFor="show-heatmap" className="cursor-pointer">
                      히트맵 표시
                      {!canToggleHeatmap && " (없음)"}
                    </Label>
                  </div>

                  {showHeatmap && canToggleHeatmap && (
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
                        {Math.round(heatmapOpacity * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <OverlayCanvas
                  src={preview}
                  boxes={boxes}
                  heatmapUrl={heatmapUrl}
                  showHeatmap={showHeatmap}
                  heatmapOpacity={heatmapOpacity}
                />

                <div className="text-sm text-muted-foreground">
                  <p>총 {boxes.length}개의 손상이 탐지되었습니다</p>
                  {boxes.length > 0 && (
                    <p className="text-xs mt-1">
                      박스에 마우스를 올려 상세 확률을 확인하세요
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

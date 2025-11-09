import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { uploadImage, createPredictionJob, pollJobStatus } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";
import { PredictionDetail } from "@/types/api";
import { ResultViewer } from "./ResultViewer";

export function DetectPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [yoloThreshold, setYoloThreshold] = useState("0.5");
  const [vitThreshold, setVitThreshold] = useState("0.5");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionDetail | null>(null);

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "입력 오류",
        description: "이미지를 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Upload image
      const imageResponse = await uploadImage(file);

      // Create prediction job
      const jobResponse = await createPredictionJob(
        imageResponse.imageId,
        yoloThreshold ? parseFloat(yoloThreshold) : undefined,
        vitThreshold ? parseFloat(vitThreshold) : undefined,
        model || undefined
      );

      // Poll job status
      const predictionDetail = await pollJobStatus(jobResponse.jobId);

      setResult(predictionDetail);

      toast({
        title: "탐지 완료",
        description: `${predictionDetail.detections.length}개의 손상이 발견되었습니다`,
      });
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "탐지에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>흠집 탐지하기</CardTitle>
          <CardDescription>단일 이미지에서 손상을 즉시 탐지합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
          <Label htmlFor="detect-file">차량 이미지</Label>
          <input
            id="detect-file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
            className="hidden"
          />
          <label
            htmlFor="detect-file"
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "border-primary/30 hover:border-primary hover:bg-primary/5"
            }`}
          >
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {file ? file.name : "이미지 파일을 선택하세요"}
            </span>
          </label>
        </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="detect-yolo">YOLO 임계값 (선택)</Label>
              <Input
                id="detect-yolo"
                type="number"
                step="0.01"
                placeholder="기본값 사용"
                value={yoloThreshold}
                onChange={(e) => setYoloThreshold(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="detect-vit">ViT 임계값 (선택)</Label>
              <Input
                id="detect-vit"
                type="number"
                step="0.01"
                placeholder="기본값 사용"
                value={vitThreshold}
                onChange={(e) => setVitThreshold(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="detect-model">모델명 (선택)</Label>
            <Input
              id="detect-model"
              placeholder="기본값 사용"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="w-full bg-gradient-to-r from-accent to-secondary"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                탐지 중입니다...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                탐지 시작
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && <ResultViewer prediction={result} />}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { uploadImage, finishRental } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { RentalFinishResponse } from "@/types/api";

export function ReturnPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [rentalId, setRentalId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [yoloThreshold, setYoloThreshold] = useState("0.5");
  const [vitThreshold, setVitThreshold] = useState("0.5");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RentalFinishResponse | null>(null);

  // Load last rental ID from localStorage
  useEffect(() => {
    const lastRentalId = localStorage.getItem("lastRentalId");
    if (lastRentalId) {
      setRentalId(lastRentalId);
    }
  }, []);

  const handleSubmit = async () => {
    if (!file || !rentalId.trim()) {
      toast({
        title: "입력 오류",
        description: "이미지와 렌탈 ID를 모두 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log("1. Uploading image...");
      // Upload image
      const imageResponse = await uploadImage(file);
      console.log("2. Image uploaded:", imageResponse);

      console.log("3. Finishing rental with imageId:", imageResponse.imageId, "rentalId:", rentalId);
      // Finish rental
      const rentalResponse = await finishRental(
        parseInt(rentalId),
        imageResponse.imageId,
        yoloThreshold ? parseFloat(yoloThreshold) : undefined,
        vitThreshold ? parseFloat(vitThreshold) : undefined,
        model || undefined
      );
      console.log("4. Rental finished:", rentalResponse);

      setResult(rentalResponse);

      // Clear saved rental ID
      localStorage.removeItem("lastRentalId");

      toast({
        title: "반납 완료",
        description: `차량번호 ${rentalResponse.vehicleNo}의 반납이 완료되었습니다`,
      });
    } catch (error) {
      console.error("Return error:", error);
      
      let errorMessage = "반납 처리에 실패했습니다";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error stack:", error.stack);
      }
      
      toast({
        title: "오류 발생",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeltaBadgeVariant = (value: number) => {
    if (value > 0) return "destructive"; // 증가 (나쁨)
    if (value < 0) return "default"; // 감소 (좋음)
    return "secondary"; // 변화 없음
  };

  const getDeltaLabel = (value: number) => {
    if (value > 0) return `+${value}`;
    return value.toString();
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>반납하기</CardTitle>
        <CardDescription>차량 반납 시 현재 상태를 기록하고 차이를 확인합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="return-file">차량 이미지</Label>
          <Input
            id="return-file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
            className="hidden"
          />
          <label
            htmlFor="return-file"
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

        <div>
          <Label htmlFor="rental-id">렌탈 ID (필수)</Label>
          <Input
            id="rental-id"
            placeholder="렌탈 ID를 입력하세요"
            value={rentalId}
            onChange={(e) => setRentalId(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="return-vehicle-no">차량번호 (검증용, 선택)</Label>
          <Input
            id="return-vehicle-no"
            placeholder="예: 12가3456"
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="return-yolo">YOLO 임계값 (선택)</Label>
            <Input
              id="return-yolo"
              type="number"
              step="0.01"
              placeholder="기본값 사용"
              value={yoloThreshold}
              onChange={(e) => setYoloThreshold(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="return-vit">ViT 임계값 (선택)</Label>
            <Input
              id="return-vit"
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
          <Label htmlFor="return-model">모델명 (선택)</Label>
          <Input
            id="return-model"
            placeholder="기본값 사용"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !file || !rentalId.trim()}
          className="w-full bg-gradient-to-r from-primary to-accent"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              반납 완료
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            {/* 반납 완료 정보 */}
            <Card className="bg-muted border-primary">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      차량번호 {result.vehicleNo}의 반납이 완료되었습니다
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rental ID: {result.rentalSessionId} | Prediction ID: {result.predictionId} | 
                      상태: {result.rentalStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">반납 시 탐지된 손상:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(result.finish.byClass).map(([label, count]) => (
                      count > 0 && (
                        <Badge key={label} variant="secondary" className="text-sm">
                          {label}: {count}
                        </Badge>
                      )
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    총 {result.finish.total}개
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 손상 변화 (Delta) */}
            <Card className="border-2 border-accent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">손상 변화</p>
                    <p className="text-sm text-muted-foreground">
                      렌트 시작 대비 반납 시 손상 증감
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.delta).map(([label, value]) => (
                    <Badge
                      key={label}
                      variant={getDeltaBadgeVariant(value as number)}
                      className="text-sm"
                    >
                      {label}: {getDeltaLabel(value as number)}
                    </Badge>
                  ))}
                </div>

                {Object.values(result.delta).some((v) => v > 0) && (
                  <p className="text-sm text-destructive mt-3">
                    ⚠️ 렌트 기간 중 새로운 손상이 발견되었습니다!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
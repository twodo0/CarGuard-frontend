import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { uploadImage, startRental } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { RentalStartResponse } from "@/types/api";

export function RentPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [vehicleNo, setVehicleNo] = useState("");
  const [yoloThreshold, setYoloThreshold] = useState("0.5");
  const [vitThreshold, setVitThreshold] = useState("0.5");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RentalStartResponse | null>(null);

  const handleSubmit = async () => {
    if (!file || !vehicleNo.trim()) {
      toast({
        title: "입력 오류",
        description: "이미지와 차량번호를 모두 입력해주세요",
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

      console.log("3. Starting rental with imageId:", imageResponse.imageId);
      // Start rental
      const rentalResponse = await startRental(
        imageResponse.imageId,
        vehicleNo,
        yoloThreshold ? parseFloat(yoloThreshold) : undefined,
        vitThreshold ? parseFloat(vitThreshold) : undefined,
        model || undefined
      );
      console.log("4. Rental started:", rentalResponse);

      setResult(rentalResponse);

      // Save rentalId to localStorage for return flow
      localStorage.setItem("lastRentalId", rentalResponse.rentalSessionId.toString());

      toast({
        title: "렌트 시작 완료",
        description: `차량번호 ${rentalResponse.vehicleNo}의 렌트가 시작되었습니다`,
      });
    } catch (error) {
      console.error("Rental error:", error);
      
      // 더 자세한 에러 메시지
      let errorMessage = "렌트 시작에 실패했습니다";
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

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>렌트하기</CardTitle>
        <CardDescription>차량 대여 시 현재 상태를 기록합니다</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="rent-file">차량 이미지</Label>
          <Input
            id="rent-file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={loading}
         
            className="hidden"
          />
          <label
            htmlFor="rent-file"
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
          <Label htmlFor="vehicle-no">차량번호 (필수)</Label>
          <Input
            id="vehicle-no"
            placeholder="예: 12가3456"
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rent-yolo">YOLO 임계값 (선택)</Label>
            <Input
              id="rent-yolo"
              type="number"
              step="0.01"
              placeholder="기본값 사용"
              value={yoloThreshold}
              onChange={(e) => setYoloThreshold(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="rent-vit">ViT 임계값 (선택)</Label>
            <Input
              id="rent-vit"
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
          <Label htmlFor="rent-model">모델명 (선택)</Label>
          <Input
            id="rent-model"
            placeholder="기본값 사용"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !file || !vehicleNo.trim()}
          className="w-full bg-gradient-to-r from-secondary to-primary"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              렌트 시작
            </>
          )}
        </Button>

        {result && (
          <Card className="bg-muted border-primary">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    현재 고객님께서 대여하신 차량({result.vehicleNo})에 총{" "}
                    {result.start.total}개의 손상이 존재합니다!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Rental ID: {result.rentalSessionId} | Prediction ID: {result.predictionId}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(result.start.byClass).map(([label, count]) => (
                  count > 0 && (
                    <Badge key={label} variant="secondary" className="text-sm">
                      {label}: {count}
                    </Badge>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UploadSlots } from "@/components/UploadSlots";
import { SummaryTable } from "@/components/SummaryTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { finishRentalBatch } from "@/lib/api";
import { RentalFinishBatchReq, RentalFinishBatchRes } from "@/lib/dto";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function RentEnd() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [rentalId, setRentalId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [threshold, setThreshold] = useState("0.3");
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RentalFinishBatchRes | null>(null);

  useEffect(() => {
    const state = location.state as { rentalId?: number; vehicleNo?: string } | null;
    if (state?.rentalId) setRentalId(String(state.rentalId));
    if (state?.vehicleNo) setVehicleNo(state.vehicleNo);
  }, [location.state]);

  const handleSubmit = async () => {
    if (!rentalId.trim() || !vehicleNo.trim()) {
      toast({ title: "렌탈 ID와 차량번호를 입력해주세요", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const req: RentalFinishBatchReq = {
        rentalId: parseInt(rentalId),
        vehicleNo: vehicleNo.trim(),
        yoloThreshold: parseFloat(threshold) || 0.3,
        images,
      };

      const res = await finishRentalBatch(req);
      setResult(res);

      const deltaTotal = Object.values(res.delta as Record<string, number>).reduce((sum, val) => sum + val, 0);

      if (deltaTotal === 0) {
        toast({
          title: "반납 완료",
          description: "반납이 완료되었습니다. 이용해 주셔서 감사합니다.",
        });
      } else {
        toast({
          title: "추가 손상 발견",
          description: `총 ${deltaTotal}개의 추가 손상이 발견되었습니다.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "반납 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deltaTotal = result ? Object.values(result.delta as Record<string, number>).reduce((sum, val) => sum + val, 0) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              차량 반납
            </h1>
            <p className="text-lg text-muted-foreground">
              렌터카 반납 전, 범퍼 기준 <span className="font-semibold text-foreground">앞 / 뒤 / 좌 / 우</span>를 촬영해 주세요.
            </p>
          </div>

          {!result ? (
            <div className="space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-lg space-y-4">
                <div>
                  <Label htmlFor="rentalId">렌탈 ID *</Label>
                  <Input
                    id="rentalId"
                    placeholder="예: 1"
                    type="number"
                    value={rentalId}
                    onChange={(e) => setRentalId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault();
                      }
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleNo">차량번호 *</Label>
                  <Input
                    id="vehicleNo"
                    placeholder="예: 123가4567"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="threshold">탐지 임계치 (기본: 0.3)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                </div>
              </div>

              <UploadSlots onComplete={(slots) => setImages(slots)} />

              {images.length === 4 && (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      검사 중...
                    </>
                  ) : (
                    "반납 완료"
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  {deltaTotal === 0 ? (
                    <CheckCircle className="h-8 w-8 text-success" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">반납 완료</h2>
                    <p className="text-sm text-muted-foreground">
                      렌탈 ID: <span className="font-medium">{result.rentalId}</span> | 차량번호: <span className="font-medium">{result.vehicleNo}</span>
                    </p>
                  </div>
                </div>

                {deltaTotal === 0 ? (
                  <p className="text-lg leading-relaxed">
                    반납이 완료되었습니다.<br />
                    <span className="text-primary font-semibold">이용해 주셔서 감사합니다.</span>
                  </p>
                ) : (
                  <p className="text-lg leading-relaxed text-destructive">
                    반납 검사 결과, 추가 손상 <span className="font-bold">{deltaTotal}건</span>이 확인되었습니다.<br />
                    <span className="text-muted-foreground text-base">아래 요약과 상세에서 위치를 확인해주세요.</span>
                  </p>
                )}
              </div>

              <SummaryTable
                summary={result.finishSummary}
                total={result.totalDamage}
                title="반납 시 전체 손상"
                delta={result.delta}
              />

              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate(`/rentals/${result.rentalId}`)} 
                  className="flex-1"
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  상세보기
                </Button>
                <Button 
                  onClick={() => window.location.href = "/"} 
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

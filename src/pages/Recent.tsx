import { useState, useEffect } from "react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRecentPredictions } from "@/lib/api";
import { PageResponse, RecentPrediction } from "@/types/api";
import { toast } from "@/hooks/use-toast";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const Recent = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageResponse<RecentPrediction> | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const fetchData = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await getRecentPredictions(pageNum, pageSize);
      setData(response);
    } catch (error) {
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <NavBar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            최근 탐지 목록
          </h1>
          <p className="text-muted-foreground">
            최근에 수행된 차량 손상 탐지 결과를 확인하세요
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : data && data.content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.content.map((prediction) => {
                // ✅ preview가 있으면 preview 사용, 없으면 imageUrl 사용
                const displayUrl = prediction.previewUrl || prediction.imageUrl;
                
                return (
                  <Card
                    key={prediction.predictionId}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary"
                  >
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <img
                        src={displayUrl}
                        alt={`Prediction ${prediction.predictionId}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold text-primary">
                            ID: {prediction.predictionId}
                          </p>
                          <p className="text-sm font-medium">
                            Detections: {prediction.detectionCount}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(prediction.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>

              <span className="text-sm text-muted-foreground">
                {page + 1} / {data.totalPages || 1}
              </span>

              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= (data.totalPages - 1)}
              >
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">아직 탐지 결과가 없습니다</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Recent;
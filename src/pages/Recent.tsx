import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRecentRentals } from "@/lib/api";
import { RentalRowView, PageResponse } from "@/lib/dto";
import { formatShortDate } from "@/lib/format";
import { Loader2 } from "lucide-react";

export default function Recent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<RentalRowView[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadRentals();
  }, [page]);

  const loadRentals = async () => {
    setLoading(true);
    try {
      const res: PageResponse<RentalRowView> = await getRecentRentals(page, 20);
      setRentals(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Failed to load rentals", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            최근 렌탈 목록
          </h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rentals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              아직 렌탈 기록이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {rentals.map((rental) => (
                <div
                  key={rental.rentalId}
                  className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/rentals/${rental.rentalId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">#{rental.rentalId}</h3>
                        <Badge variant={rental.status === "IN_RENT" ? "default" : "secondary"}>
                          {rental.status === "IN_RENT" ? "대여 중" : "반납 완료"}
                        </Badge>
                        {rental.newDamageTotal !== null && rental.newDamageTotal > 0 && (
                          <Badge variant="destructive">
                            신규 손상 {rental.newDamageTotal}개
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        차량번호: <span className="font-medium">{rental.vehicleNo}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        렌트일: {formatShortDate(rental.startAt)}
                        {rental.finishedAt && ` | 반납일: ${formatShortDate(rental.finishedAt)}`}
                      </p>
                    </div>
                    <Button variant="outline">상세보기</Button>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    이전
                  </Button>
                  <span className="px-4 py-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    다음
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

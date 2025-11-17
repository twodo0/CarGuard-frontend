import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SummaryTable } from "@/components/SummaryTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getRentalDetail } from "@/lib/api";
import { RentalDetailDto, RentalImageDto, DetectionDto } from "@/lib/dto";
import { BoxDto, normalizeProbs } from "@/lib/predictionTypes";
import { formatDate } from "@/lib/format";
import { getSlotLabel } from "@/lib/damage";
import { Loader2, PackageCheck } from "lucide-react";
import { OverlayCanvas } from "@/components/OverlayCanvas";

// Convert backend DetectionDto to BoxDto for OverlayCanvas
function detectionToBoxDto(d: DetectionDto): BoxDto {
  return {
    x: d.x,
    y: d.y,
    w: d.w,
    h: d.h,
    class_probs: normalizeProbs(d.class_probs),
  };
}

export default function RentalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<RentalDetailDto | null>(null);

  useEffect(() => {
    if (id) loadDetail(parseInt(id));
  }, [id]);

  const loadDetail = async (rentalId: number) => {
    setLoading(true);
    try {
      const res = await getRentalDetail(rentalId);
      setDetail(res);
    } catch (error) {
      console.error("Failed to load detail", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-12 px-4">
          <div className="container mx-auto text-center">
            <p className="text-xl text-muted-foreground">렌탈 정보를 찾을 수 없습니다.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isReturned = detail.status === "RETURNED";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">렌탈 #{detail.rentalId}</h1>
              <Badge variant={isReturned ? "secondary" : "default"}>
                {isReturned ? "반납 완료" : "대여 중"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              차량번호: {detail.vehicleNo} | 렌트일: {formatDate(detail.startedAt)}
              {detail.finishedAt && ` | 반납일: ${formatDate(detail.finishedAt)}`}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <SummaryTable
              summary={detail.startSummary}
              total={detail.startTotal}
              title="렌트 시작 손상"
            />

            {isReturned && (
              <>
                <SummaryTable
                  summary={detail.finishSummary}
                  total={detail.finishTotal || 0}
                  title="반납 시 손상"
                />

                <SummaryTable
                  summary={detail.deltaSummary}
                  total={detail.newDamageTotal || 0}
                  title="추가 손상"
                />
              </>
            )}
          </div>

          {!isReturned && (
            <Button
              onClick={() => navigate('/rent/end', { state: { rentalId: detail.rentalId, vehicleNo: detail.vehicleNo } })}
              size="lg"
              className="w-full mb-6"
            >
              <PackageCheck className="mr-2 h-5 w-5" />
              차량 반납하기
            </Button>
          )}

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="start-images" className="bg-card rounded-xl px-6">
              <AccordionTrigger className="text-lg font-bold">
                렌트 시 촬영 사진 (4장)
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  {detail.startImages.map((img) => (
                    <ImageCard
                      key={img.slot}
                      slot={getSlotLabel(img.slot)}
                      image={img}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {isReturned && detail.finishImages.length > 0 && (
              <AccordionItem value="finish-images" className="bg-card rounded-xl px-6">
                <AccordionTrigger className="text-lg font-bold">
                  반납 시 촬영 사진 (4장)
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    {detail.finishImages.map((img) => (
                      <ImageCard
                        key={img.slot}
                        slot={getSlotLabel(img.slot)}
                        image={img}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface ImageCardProps {
  slot: string;
  image: RentalImageDto;
}

function ImageCard({ slot, image }: ImageCardProps) {
  if (!image.rawUrl) {
    return (
      <div className="space-y-2">
        <h4 className="font-semibold">{slot}</h4>
        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground">이미지 없음</span>
        </div>
      </div>
    );
  }

  const boxes = image.detections.map(detectionToBoxDto);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">{slot}</h4>
      <div className="relative rounded-xl border border-border overflow-hidden">
        <OverlayCanvas
          src={image.rawUrl}
          boxes={boxes}
          heatmapUrl={image.heatmapUrl ?? undefined}
          showHeatmap={false}
        />
      </div>
      {boxes.length === 0 && (
        <div className="text-muted-foreground text-xs mt-2">손상 없음</div>
      )}
    </div>
  );
}

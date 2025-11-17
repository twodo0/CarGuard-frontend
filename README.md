Car Guard Frontend 

Car Guard는 AI 기반 차량 손상 탐지 & 렌터카 관리 서비스의 프론트엔드입니다.
사용자가 차량 사진을 업로드하면, 백엔드(Spring Boot + FastAPI)가 YOLO → ViT 파이프라인으로 손상을 분석하고
이 프론트는 그 결과를 바운딩 박스 + 손상 확률 툴팁(+ 단일 탐지 시 히트맵)으로 시각화합니다.

 부가 기능 : 히트맵(Grad-CAM)은 “단일 탐지(단일 이미지 검사)” 기능에서만 사용
           렌트 시작/반납 배치 처리에서는 히트맵을 사용하지 않습니다.

⸻

주요 기능

1. 단일 탐지 (Single Prediction)

한 장의 이미지를 업로드해 AI로 차량 손상 여부를 확인하는 기능입니다.

플로우 (프론트 기준)
	1.	POST /api/images
	•	multipart/form-data, 필드 이름: file
	•	응답: UploadResponseDto
	•	imageId
	•	rawUrl
	•	width, height
	2.	POST /api/predictions/by-image/{imageId}?yoloThreshold=...
	•	RequestParam: yoloThreshold (Double, 없으면 백엔드에서 기본값 사용)
	•	응답: PredictionJobDto (비동기 job 정보, jobId 포함)
	3.	GET /api/predictions/jobs/{jobId}
	•	Status.SUCCEEDED + predictionId가 있으면:
	•	200 OK + PredictionDetailDto 반환
	•	Status.FAILED:
	•	422 Unprocessable Entity + ApiError
	•	진행 중:
	•	202 Accepted + Retry-After: 1 헤더

PredictionDetailDto를 프론트에서 사용해서:
	•	YOLO 박스 좌표 → OverlayCanvas로 바운딩 박스 렌더링
	•	ViT class_probs → Hover 시 손상 확률 툴팁
	•	heatmapUrl → 히트맵 오버레이 (투명도 슬라이더로 조절 가능, 단일 탐지 전용)

⸻

2. 렌트 시작 (Rent Start)

렌터카 대여 시작 시, 차량 상태(기존 손상)를 기록하는 기능입니다.
사용자는 차량 번호 + 앞/뒤/좌/우 4장 사진을 업로드합니다.

플로우 (프론트 기준)
	1.	POST /api/images/batch
	•	multipart/form-data
	•	files: List<MultipartFile> (필드 이름 "files")
	•	slots: List<ImageSlot> (필드 이름 "slots", 값: "FRONT", "REAR", "LEFT", "RIGHT")
	•	검증:
	•	파일 없음 → 에러
	•	files.size() != slots.size() → 에러
	•	files.size() > 4 → 에러
	•	응답: UploadBatchRes
	•	images: List<UploadedImage>
	•	slot: ImageSlot
	•	imageId: Long
	2.	POST /api/rentals/batch/start/upload
	•	Body: RentalBatchDtos.RentalStartBatchReq
	•	예: { vehicleNo, yoloThreshold, images: [{ slot, imageId }, ...] }
	•	응답: RentalBatchDtos.RentalStartBatchRes
	•	rentalId
	•	vehicleNo
	•	startSummary (손상 타입별 개수)
	•	totalDamage 등

UX
	•	totalDamage === 0:
	•	토스트:
“검사 완료 — AI 검사 결과, 확인된 손상이 없습니다. 안심하고 이용해 주세요.”
	•	결과 카드:
“AI 검사 결과, 확인된 손상이 없습니다. 안심하고 차량을 이용해 주세요.”
	•	totalDamage > 0:
	•	토스트:
“기존 손상 확인 — AI 검사 결과, 차량에서 기존 손상 N건이 확인되었습니다. 아래에서 위치를 확인해 주세요.”
	•	결과 카드:
“AI 검사 결과, 차량에서 기존 손상 N건이 확인되었습니다. 고객님 책임이 아니며, 아래 요약과 상세 화면에서 손상 위치를 확인하실 수 있습니다.”
	•	SummaryTable로 렌트 시작 손상 요약 표시
	•	“상세보기” 버튼으로 /api/rentals/{rentalId} 기반 렌탈 상세 화면으로 이동

✅ 렌트 시작 배치에서는 히트맵을 사용하지 않고,
“해당 렌트 세션 시작 시 차량 상태를 정확히 기록하는 데 초점”을 맞춥니다.

⸻

3. 렌트 종료 (Rent End, 반납)

반납 시 차량을 다시 촬영해, 렌트 시작 대비 추가 손상(N건) 을 계산하는 기능입니다.

플로우 (프론트 기준)
	1.	POST /api/images/batch
	•	렌트 시작과 동일하게 files + slots로 업로드
	•	응답: UploadBatchRes(images: [{slot, imageId}, ...])
	2.	POST /api/rentals/batch/end/upload
	•	Body: RentalBatchDtos.RentalFinishBatchReq
	•	예: { rentalId, vehicleNo, yoloThreshold, images: [{ slot, imageId }, ...] }
	•	응답: RentalBatchDtos.RentalFinishBatchRes
	•	rentalId
	•	vehicleNo
	•	finishSummary (반납 시 전체 손상)
	•	delta (시작 대비 증감: DamageType별 증가량)
	•	totalDamage 또는 newDamageTotal 등

프론트에서:

const deltaTotal = Object.values(res.delta).reduce((sum, v) => sum + v, 0);

	•	deltaTotal === 0:
	•	토스트:
“반납 검사 완료 — 반납 검사 결과, 추가된 손상이 없습니다. 이용해 주셔서 감사합니다.”
	•	결과 카드:
“반납 검사 결과, 추가된 손상이 없습니다. 이용해 주셔서 감사합니다.”
	•	deltaTotal > 0:
	•	토스트:
“추가 손상 확인 — 반납 검사 결과, 추가 손상 N건이 확인되었습니다. 아래 상세를 확인해주세요.”
	•	결과 카드:
“반납 검사 결과, 추가 손상 N건이 확인되었습니다. 아래 요약과 상세에서 위치를 확인해 주세요.”
	•	SummaryTable로 반납 시 전체 손상 + 증감(delta) 표시
	•	“상세보기” 버튼으로 렌탈 상세 화면 이동

✅ 렌트 종료 배치도 히트맵 없이,
“시작 대비 손상이 얼마나 늘었는지”를 시각적으로 보여주는 것에 중점.

⸻

4. 렌탈 조회 & 상세 (Rental List & Detail)

최근 렌탈 목록
	•	GET /api/rentals/recent
	•	@PageableDefault(size = 10, sort = “createdAt”, direction = DESC)
	•	응답: Page<RentalRowView>
	•	rentalId, vehicleNo, status, createdAt, finishedAt, newDamageTotal 등
	•	프론트에서 “최근 렌탈 목록” 화면에 사용 가능

렌탈 상세
	•	GET /api/rentals/{rentalId}?phase=START|END (optional)
	•	RentalDetailDto 반환:

public record RentalDetailDto(
        Long rentalId,
        String vehicleNo,
        RentalStatus status,
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt,

        Map<DamageType, Integer> startSummary,
        Map<DamageType, Integer> finishSummary,
        Map<DamageType, Integer> deltaSummary,

        Integer startTotal,
        Integer finishTotal,
        Integer newDamageTotal,

        List<RentalImageDto> startImages,
        List<RentalImageDto> finishImages
) {}

	•	RentalImageDto에는 이미 Prediction + Detections 정보가 포함됩니다:

public record RentalImageDto(
        ImageSlot slot,                     // FRONT, REAR, LEFT, RIGHT
        Long predictionId,
        String rawUrl,
        String heatmapUrl,                  // 현재는 주로 단일 탐지에서 활용, 렌탈 상세에서는 raw 중심
        Map<DamageType, Integer> summaryByImage,
        List<DetectionDto> detections       // classProbs + (x, y, w, h)
) {}

프론트에서는:
	•	startImages / finishImages를 ImageSlot 기준으로 정렬(FRONT, REAR, LEFT, RIGHT)
	•	각 RentalImageDto의 detections를 BoxDto로 매핑해 OverlayCanvas에 전달
	•	결과적으로 렌탈 상세 화면에서:
	•	시작 시 이미지 4장 + 박스 + Hover 툴팁
	•	종료 시 이미지 4장 + 박스 + Hover 툴팁
	•	히트맵은 사용하지 않고, 배치 예측 결과를 박스/툴팁 중심으로 렌더링합니다.

⸻

기술 스택
	•	React 18
	•	TypeScript
	•	Vite
	•	Tailwind CSS
	•	shadcn-ui (UI 컴포넌트)
	•	lucide-react (아이콘)
	•	상태 관리: React Hooks (useState, useEffect) 중심

⸻

주요 프론트엔드 구조 (예시)

src/
  components/
    Navbar.tsx
    Footer.tsx
    UploadSlots.tsx        # 렌트 시작/종료 시 4장 이미지 업로드 슬롯
    SummaryTable.tsx       # 손상 요약 테이블
    OverlayCanvas.tsx      # 이미지 + bbox + (단일 탐지 시) 히트맵 렌더링
  pages/
    RentStart.tsx          # /rent/start : 렌트 시작
    RentEnd.tsx            # /rent/end   : 렌트 종료(반납)
    RentalsDetail.tsx      # /rentals/:id : 렌탈 상세
    SingleDetect.tsx       # /detect     : 단일 이미지 손상 탐지
  lib/
    api.ts                 # 위 API들을 호출하는 래퍼(startRentalBatch, finishRentalBatch 등)
    dto.ts                 # RentalStartBatchReq/Res, RentalFinishBatchReq/Res 등 DTO 타입
    predictionTypes.ts     # BoxDto, ApiClassProb 등 예측 관련 타입
    damage.ts              # DamageType → UI 표시 라벨/텍스트 매핑
  hooks/
    use-toast.ts           # toast 알림 훅

(실제 파일명/경로는 프로젝트에 맞게 조정)

⸻

로컬 개발

Node.js + npm 필요 (Node는 nvm으로 설치 추천).

# 1. 레포지토리 클론
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행
npm run dev

	•	브라우저: http://localhost:5173 (또는 Vite 설정에 따른 포트)
	•	백엔드(Spring Boot, FastAPI)도 함께 실행해야 위의 /api/** 엔드포인트가 정상 동작합니다.

⸻

npm 스크립트

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 로컬 프리뷰
npm run preview

# 린트
npm run lint


⸻

앞으로 확장할 수 있는 기능 아이디어
	•	로그인 / 권한(Role) 시스템 (고객 / 관리자 분리)
	•	차량 관리 페이지 (차량 등록, 상태 관리)
	•	렌트 전·후 이미지 슬라이더 비교 뷰 (Before/After)
	•	렌탈 세션별 손상 리포트 PDF 다운로드
	•	관리자용 손상 통계 대시보드 (차량별/손상 타입별/기간별)
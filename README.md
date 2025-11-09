# CarGuard Frontend

자동차 렌탈 전·후 차량 이미지를 업로드하고,  
손상 탐지 결과와 Grad-CAM 히트맵을 시각화해 주는 웹 프론트엔드입니다.

백엔드(Spring) 및 FastAPI 추론 서버와 연동되어,

- 이미지 업로드 → 비동기 추론 요청
- 손상 박스 / 클래스별 확률 / 히트맵 오버레이 시각화
- 렌탈 시작/종료 시점 손상 요약 및 증감(delta) 표시

까지 한 번에 확인할 수 있습니다.

---

## Tech Stack

- **Vite**
- **React** (TypeScript)
- **Tailwind CSS**
- **shadcn/ui**

---

## Getting Started

### 1. 설치

```bash
# 의존성 설치
npm install
# 또는
pnpm install
# 또는
yarn
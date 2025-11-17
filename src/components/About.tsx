import { Shield, Zap, FileCheck } from "lucide-react";

export function About() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            CarGuard AI란?
          </span>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">정확한 기록</h3>
            <p className="text-muted-foreground">
              렌터카 대여 시점의 차량 상태를 정확하게 기록하여 분쟁을 예방합니다
            </p>
          </div>
          
          <div className="text-center p-6">
            <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">AI 자동 탐지</h3>
            <p className="text-muted-foreground">
              최신 AI 기술로 파손, 찌그러짐, 스크래치 등을 자동으로 탐지합니다
            </p>
          </div>
          
          <div className="text-center p-6">
            <FileCheck className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">간편한 관리</h3>
            <p className="text-muted-foreground">
              대여부터 반납까지 모든 과정을 한 곳에서 관리하고 조회할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

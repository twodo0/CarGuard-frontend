import { Camera, Package } from "lucide-react";

export function Services() {
  return (
    <section id="services" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            제공 서비스
          </span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Camera className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-3">대여 검사</h3>
            <p className="text-muted-foreground">
              차량의 전면, 후면, 좌측, 우측을 한 번에 촬영하여 대여 전 상태를 기록합니다
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Package className="h-10 w-10 text-accent mb-4" />
            <h3 className="text-2xl font-bold mb-3">반납 검사</h3>
            <p className="text-muted-foreground">
              반납 시 촬영한 사진과 대여 시 기록을 비교하여 추가 손상을 자동으로 탐지합니다
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Button } from "./ui/button";
import { Car, Shield, Search } from "lucide-react";

interface HeroProps {
  onRentClick: () => void;
  onReturnClick: () => void;
  onDetectClick: () => void;
}

export function Hero({ onRentClick, onReturnClick, onDetectClick }: HeroProps) {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="container mx-auto text-center">
        <div className="mb-8 inline-block">
          <Car className="h-20 w-20 text-primary mx-auto mb-4 animate-pulse" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent leading-tight">
          AI 기반 차량 손상 탐지
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          렌터카 대여와 반납 시 차량 상태를 정확하게 기록하고,
          <br />
          AI가 자동으로 흠집과 손상을 탐지합니다
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={onRentClick}
            className="w-full sm:w-auto bg-gradient-to-r from-secondary to-primary hover:opacity-90 transition-all transform hover:scale-105"
          >
            <Car className="mr-2 h-5 w-5" />
            렌트하기
          </Button>
          
          <Button
            size="lg"
            onClick={onReturnClick}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all transform hover:scale-105"
          >
            <Shield className="mr-2 h-5 w-5" />
            반납하기
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onDetectClick}
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all transform hover:scale-105"
          >
            <Search className="mr-2 h-5 w-5" />
            데미지 탐지
          </Button>
        </div>
      </div>
    </section>
  );
}

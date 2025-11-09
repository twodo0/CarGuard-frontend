import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Car, Shield, Search } from "lucide-react";

interface ServiceCardsProps {
  onRentClick: () => void;
  onReturnClick: () => void;
  onDetectClick: () => void;
}

export function ServiceCards({ onRentClick, onReturnClick, onDetectClick }: ServiceCardsProps) {
  const services = [
    {
      icon: Car,
      title: "렌트하기",
      description: "차량 대여 시 현재 상태를 AI로 기록합니다",
      onClick: onRentClick,
      gradient: "from-secondary to-primary",
    },
    {
      icon: Shield,
      title: "반납하기",
      description: "반납 시 손상 여부를 자동으로 비교합니다",
      onClick: onReturnClick,
      gradient: "from-primary to-accent",
    },
    {
      icon: Search,
      title: "흠집 탐지하기",
      description: "단일 이미지에서 손상을 즉시 탐지합니다",
      onClick: onDetectClick,
      gradient: "from-accent to-secondary",
    },
  ];

  return (
    <section id="services" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            서비스
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            렌터카 대여부터 반납까지, AI가 모든 과정을 관리합니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl transform hover:scale-105 cursor-pointer"
                onClick={service.onClick}
              >
                <CardHeader>
                  <div className={`mb-4 inline-block p-4 bg-gradient-to-br ${service.gradient} rounded-full`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" onClick={service.onClick}>
                    시작하기 →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

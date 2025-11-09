import { Brain, Zap, Shield } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function About() {
  const features = [
    {
      icon: Brain,
      title: "AI",
      description: "AI 모델을 활용한 정확한 손상 탐지",
    },
    {
      icon: Zap,
      title: "실시간 분석",
      description: "빠르고 정확한 실시간 이미지 분석",
    },
    {
      icon: Shield,
      title: "신뢰성",
      description: "렌터카 대여/반납 시 분쟁 방지",
    },
  ];

  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            왜 CarGuard AI인가?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            최첨단 AI 기술로 차량 손상을 자동으로 감지하고, 렌터카 서비스의 신뢰성을 높입니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-4 inline-block p-4 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full">
                    <Icon className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

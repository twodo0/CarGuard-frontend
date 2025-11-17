import { DamageLabel, DamageSummary } from "@/lib/dto";
import { getDamageLabel, getDamageColor } from "@/lib/damage";
import { Badge } from "./ui/badge";

interface SummaryTableProps {
  summary: DamageSummary;
  total: number;
  title: string;
  delta?: DamageSummary;
}

export function SummaryTable({ summary, total, title, delta }: SummaryTableProps) {
  const types: DamageLabel[] = ["BREAKAGE", "CRUSHED", "SCRATCHED", "SEPARATED"];

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        {types.map(type => {
          const count = summary[type] || 0;
          const deltaCount = delta?.[type] || 0;
          const showDelta = delta && deltaCount > 0;

          return (
            <div key={type} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getDamageColor(type) }}
                />
                <span className="font-medium">{getDamageLabel(type)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{count}개</span>
                {showDelta && (
                  <Badge variant="destructive" className="ml-2">
                    +{deltaCount}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between pt-4 font-bold text-lg border-t-2 border-border">
          <span>총 손상</span>
          <span className="text-primary">{total}개</span>
        </div>
      </div>
    </div>
  );
}

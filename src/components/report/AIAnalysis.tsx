import { useState, useEffect } from "react";
import { Brain, CheckCircle2, Loader2, Tag, AlertTriangle, Droplets, Lightbulb, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const categories = [
  { id: "pothole", label: "Road & Pothole", icon: AlertTriangle, confidence: 92 },
  { id: "drainage", label: "Drainage & Sewage", icon: Droplets, confidence: 78 },
  { id: "lighting", label: "Street Lighting", icon: Lightbulb, confidence: 65 },
  { id: "waste", label: "Waste Management", icon: Trash2, confidence: 45 },
];

interface AIAnalysisProps {
  isActive: boolean;
  onComplete: (category: string) => void;
}

const AIAnalysis = ({ isActive, onComplete }: AIAnalysisProps) => {
  const [stage, setStage] = useState<"idle" | "analyzing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<typeof categories[0] | null>(null);

  useEffect(() => {
    if (!isActive) {
      setStage("idle");
      setProgress(0);
      setResult(null);
      return;
    }

    setStage("analyzing");
    setProgress(0);

    const steps = [15, 35, 55, 75, 90, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        const topCategory = categories[0]; // simulate top match
        setResult(topCategory);
        setStage("done");
        onComplete(topCategory.label);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  if (stage === "idle") return null;

  return (
    <div className="glass-card space-y-4 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20">
          <Brain className="h-4 w-4 text-accent-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">AI Issue Analysis</p>
          <p className="text-[11px] text-muted-foreground">Powered by Amazon Bedrock</p>
        </div>
        {stage === "analyzing" && <Loader2 className="ml-auto h-4 w-4 animate-spin text-primary" />}
        {stage === "done" && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
      </div>

      {stage === "analyzing" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Analyzing evidence…</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="space-y-1 pt-1">
            {["Extracting visual features", "Matching issue taxonomy", "Calculating confidence scores"].map((step, idx) => (
              <p key={idx} className={`text-xs transition-opacity ${progress > (idx + 1) * 30 ? "text-foreground" : "text-muted-foreground/40"}`}>
                {progress > (idx + 1) * 30 ? "✓" : "○"} {step}
              </p>
            ))}
          </div>
        </div>
      )}

      {stage === "done" && result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
            <Tag className="h-3.5 w-3.5 text-success" />
            <span className="text-sm font-semibold text-success">Category: {result.label}</span>
            <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
              {result.confidence}% match
            </span>
          </div>
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  <CatIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="flex-1 text-xs text-muted-foreground">{cat.label}</span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${cat.confidence}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] text-muted-foreground">{cat.confidence}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;

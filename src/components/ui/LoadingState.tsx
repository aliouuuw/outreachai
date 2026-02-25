type LoadingShape = "card" | "list" | "table-row" | "text";

interface LoadingStateProps {
  shape?: LoadingShape;
  lines?: number;
  className?: string;
}

const basePulse = "animate-pulse bg-border/40";

const shapeMap: Record<LoadingShape, string> = {
  card: "h-40 rounded-xl",
  list: "h-4 rounded-full",
  "table-row": "h-10 rounded-md",
  text: "h-3 rounded-full",
};

export function LoadingState({ shape = "card", lines = 3, className = "" }: LoadingStateProps) {
  if (shape === "card") {
    return (
      <div
        className={`${basePulse} ${shapeMap[shape]} w-full ${className}`}
        aria-busy="true"
        aria-label="Chargement en cours"
      />
    );
  }

  const count = Math.max(1, Math.min(lines, 10));
  return (
    <div className={`flex flex-col gap-3 w-full ${className}`} aria-busy="true" aria-label="Chargement en cours">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`${basePulse} ${shapeMap[shape]} w-full`} />
      ))}
    </div>
  );
}

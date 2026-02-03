interface CountdownDisplayProps {
  countdown: number;
}

export function CountdownDisplay({ countdown }: CountdownDisplayProps) {
  return (
    <div className="text-white text-3xl mb-8 font-mono">
      The test will automatically start in: {countdown}
    </div>
  );
}

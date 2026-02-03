export function TargetStimulus() {
  return (
    <div
      className="absolute bg-black"
      style={{
        width: '20px',
        height: '20px',
        top: '65px',   // Top half: (150-20)/2 = 65px from top
        left: '140px', // Center: (300-20)/2 = 140px from left
      }}
    />
  );
}

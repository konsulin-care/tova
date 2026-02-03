export function NonTargetStimulus() {
  return (
    <div
      className="absolute bg-black"
      style={{
        width: '20px',
        height: '20px',
        top: '215px',  // Bottom half: 150 + (150-20)/2 = 215px from top
        left: '140px', // Center: (300-20)/2 = 140px from left
      }}
    />
  );
}

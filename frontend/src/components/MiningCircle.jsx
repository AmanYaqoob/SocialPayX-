import { useState, useEffect } from "react";

const MiningCircle = ({ isMining, balance, onClaim }) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isMining) {
      const interval = setInterval(() => {
        setDisplayBalance((prev) => prev + 0.00001);
        setRotation((prev) => prev + 1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isMining]);

  useEffect(() => {
    setDisplayBalance(balance);
  }, [balance]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-secondary/20 to-primary/20 blur-xl animate-pulse-glow" />
      
      {/* Rotating border */}
      <div 
        className="absolute w-56 h-56 rounded-full"
        style={{
          background: `conic-gradient(from ${rotation}deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))`,
          transform: `rotate(${rotation}deg)`,
        }}
      />
      
      {/* Inner dark circle */}
      <div className="absolute w-52 h-52 rounded-full bg-background" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-48 h-48 rounded-full bg-gradient-to-br from-card to-background">
        {/* Diamond/Crystal icon */}
        <div className="mb-2 animate-float">
          <svg
            viewBox="0 0 100 100"
            className="w-16 h-16 drop-shadow-[0_0_20px_hsl(var(--secondary))]"
          >
            <defs>
              <linearGradient id="crystalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(270, 60%, 60%)" />
                <stop offset="50%" stopColor="hsl(280, 70%, 50%)" />
                <stop offset="100%" stopColor="hsl(290, 80%, 40%)" />
              </linearGradient>
            </defs>
            <polygon
              points="50,10 90,40 75,90 25,90 10,40"
              fill="url(#crystalGradient)"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
            <polygon
              points="50,10 50,90 75,90 90,40"
              fill="hsl(270, 50%, 45%)"
              opacity="0.7"
            />
            <polygon
              points="50,35 35,55 50,90 65,55"
              fill="hsl(280, 70%, 70%)"
              opacity="0.5"
            />
          </svg>
        </div>
        
        {/* Balance display */}
        <span className="text-2xl font-bold text-foreground tracking-wider">
          {displayBalance.toFixed(5)}
        </span>
        <span className="text-sm text-primary font-medium">SPX</span>
      </div>
    </div>
  );
};

export default MiningCircle;

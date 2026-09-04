import { useState, useEffect } from "react";

export default function ClockCard() {
	const [time, setTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);
	return (
		<div>
  <div className="liquid-glass">
     <p>{time.toLocaleTimeString()}</p>
  </div>
  <svg
    style={{
      display: "none",
    }}
    xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter height="100%" id="glass-distortion" width="100%" x="0%" y="0%">
        <feTurbulence
          baseFrequency="0.008 0.008"
          numOctaves="2"
          result="noise"
          seed="92"
          type="fractalNoise"
        />
        <feGaussianBlur in="noise" result="blurred" stdDeviation="2" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurred"
          scale="77"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
</div>
	);
}


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
		<div className="card clock-card">
			<p>{time.toLocaleTimeString()}</p>
		</div>
	);
}


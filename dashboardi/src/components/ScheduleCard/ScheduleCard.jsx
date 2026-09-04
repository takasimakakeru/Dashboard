import { useEffect, useState } from "react";

export default function ScheduleCard() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetch("/api/schedule")
			.then(async (res) => {
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "予定の取得に失敗しました");
				}

				return data;
			})
			.then((data) => {
				setTasks(data);
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	return (
		<>
			<div className="liquid-glass" style={{}}>
				<div className="glass-text">
					<div className="card schedule-card">
						<h2>今日の予定</h2>

						{/* 修正：条件分岐の文字列囲みを解除 */}
						{loading && <p>読み込み中...</p>}

						{/* 修正：エラー表示の文字列囲みを解除 */}
						{error && <p>エラー: {error}</p>}

						{/* 修正：データ空の判定の文字列囲みを解除 */}
						{!loading && !error && tasks.length === 0 && (
							<p>予定がありません</p>
						)}

						{/* 修正：ループ処理の文字列囲みを解除。ループ時は key 属性も必須です */}
						{!loading && !error && tasks.map((item, index) => (
							<div className="schedule-item" key={index}>
								<p>{item.time} — {item.title}</p>
							</div>
						))}
					</div>
				</div>
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
			</>
	);
}

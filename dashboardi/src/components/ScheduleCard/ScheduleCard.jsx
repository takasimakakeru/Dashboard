import { useEffect, useState } from "react";

export default function ScheduleCard() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [newTitle, setNewTitle] = useState("");
	const [newDate, setNewDate] = useState("");

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

	const addSchedule = async () => {
		await fetch("/api/schedule", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				title: newTitle,
				date: newDate
			})
		});

		window.location.reload();
	};

	const deleteSchedule = async (id) => {
		await fetch(`/api/schedule/${id}`, {
			method: "DELETE"
		});

		window.location.reload();
	};

	return (
		<>
			<div className="liquid-glass" style={{}}>
				<div className="glass-text">
					<div className="card schedule-card">

						<h2>今日の予定</h2>
						<div className="input-wrapper">
							<span className="icon-left">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
							</span>
							<input
								type="text"
								placeholder="予定名"
								value={newTitle}
								className="custom-input"
								onChange={(e) => setNewTitle(e.target.value)}
							/>
						</div>

						<input
							type="date"
							value={newDate}
							onChange={(e) => setNewDate(e.target.value)}
							className="input-date"
						/>

						<button onClick={addSchedule} className="original-button">
							追加
						</button>


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
								<button onClick={() => deleteSchedule(item.id)} className="original-button" style={{ backgroundColor: "red" }}>
									削除
								</button>
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

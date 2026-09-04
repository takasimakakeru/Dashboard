import { useState, useEffect } from "react";

export default function WeatherCard() {
	const [weather, setWeather] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetch("/api/weather")
			.then(async (res) => {
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "天気の取得に失敗しました");
				}

				return data;
			})
			.then((data) => {
				setWeather(data);
			})
			.catch((err) => {
				setError(err.message);
			});
	}, []);

	return (
		<div>
			<div className="liquid-glass">
				<div className="glass-text">
					<div className="card weather-card">
						<h2>天気</h2>

						{/* 1. エラーがある場合はエラーを表示 */}
						{error && <p>エラー: {error}</p>}

						{/* 2. エラーがなく、データが取得できたら天気情報を表示 */}
						{weather ? (
							<>
								<p>気温: {weather.main.temp}℃</p>
								<p>湿度: {weather.main.humidity}%</p>
								<p>天気: {weather.weather[0].description}</p>
							</>
						) : (
							/* 3. エラーもデータもない（初回読み込み中）ならLoadingを表示 */
							!error && <p>Loading...</p>
						)}
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
		</div>
	);
}

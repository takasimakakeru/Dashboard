import { useState, useEffect } from "react";

export default function WeatherCard() {
	const [weather, setWeather] = useState(null);
	const [error, setError] = useState(null);
	const [forecast, setForecast] = useState([]);

	useEffect(() => {
		fetch("/api/weather")
			.then(async (res) => {
				const data = await res.json();

				if (!res.ok) {
					throw new Error(
						data.error || "天気の取得に失敗しました"
					);
				}

				return data;
			})
			.then((data) => {
				setWeather(data);
			})
			.catch((err) => {
				setError(err.message);
			});

		fetch("/api/forecast")
			.then((res) => res.json())
			.then((data) => {
				const now = Date.now();

				const futureForecast = data.list
					.filter((item) => item.dt * 1000 > now)
					.slice(0, 6);

				setForecast(futureForecast);
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

						{error && <p>エラー: {error}</p>}

						{weather ? (
							<div className="weather-content">

								<div className="current-weather">
									<div className="weather-icon">
										<img
											src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
											alt="weather"
										/>
									</div>

									<div className="current-temp">
										{Math.round(weather.main.temp)}℃
									</div>

									<div className="weather-desc">
										{weather.weather[0].description}
									</div>

									<div className="weather-details">
										<span>
											💧 {weather.main.humidity}%
										</span>
									</div>
								</div>

								<div className="forecast-section">
									<h3 className="forecast-title">
										今後18時間
									</h3>

									<div className="forecast">
										{forecast.map((item) => {
											const time =
												new Intl.DateTimeFormat(
													"ja-JP",
													{
														timeZone: "Asia/Tokyo",
														hour: "2-digit",
														minute: "2-digit"
													}
												).format(
													new Date(item.dt * 1000)
												);

											const description =
												item.weather[0].description;

											let icon = "🌤";

											if (description.includes("雲")) {
												icon = "☁";
											}

											if (description.includes("雨")) {
												icon = "🌧";
											}

											if (description.includes("雷")) {
												icon = "⛈";
											}

											return (
												<div
													className="forecast-item"
													key={item.dt}
												>
													<span>{time}</span>

													<span>{icon}</span>

													<span>
														{Math.round(
															item.main.temp
														)}
														℃
													</span>

													<span>
														{Math.round(
															(item.pop || 0) * 100
														)}
														%
													</span>
												</div>
											);
										})}
									</div>
								</div>

							</div>
						) : (
							!error && <p>Loading...</p>
						)}
					</div>
				</div>
			</div>

			<svg
				style={{
					display: "none"
				}}
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<filter
						height="100%"
						id="glass-distortion"
						width="100%"
						x="0%"
						y="0%"
					>
						<feTurbulence
							baseFrequency="0.008 0.008"
							numOctaves="2"
							result="noise"
							seed="92"
							type="fractalNoise"
						/>

						<feGaussianBlur
							in="noise"
							result="blurred"
							stdDeviation="2"
						/>

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

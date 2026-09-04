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
		<div className="card weather-card">
			<h2>天気</h2>

			{error && <p>エラー: {error}</p>}

			{weather ? (
				<>
					<p>気温: {weather.main.temp}℃</p>
					<p>湿度: {weather.main.humidity}%</p>
					<p>天気: {weather.weather[0].description}</p>
				</>
			) : (
				!error && <p>Loading...</p>
			)}
		</div>
	);
}
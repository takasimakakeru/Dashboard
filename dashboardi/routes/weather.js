import express from "express";

const router = express.Router();

router.get("/weather", async (req, res) => {
	try {
		const lat = 35.19;
		const lon = 136.90;

		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=ja`
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message ||
				`OpenWeather API error: ${response.status}`
			);
		}

		res.json(data);
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

router.get("/forecast", async (req, res) => {
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/forecast?lat=35.19&lon=136.90&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=ja`
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message ||
				`OpenWeather API error: ${response.status}`
			);
		}

		res.json(data);
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

export default router;
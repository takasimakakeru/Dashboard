import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/schedule", async (req, res) => {
	try {
		const databaseResponse = await fetch(
			`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03"
				}
			}
		);

		const database = await databaseResponse.json();

		if (!databaseResponse.ok) {
			throw new Error(
				database.message || `Notion API error: ${databaseResponse.status}`
			);
		}

		const dataSourceId = database.data_sources?.[0]?.id;

		if (!dataSourceId) {
			throw new Error("Data Source IDが見つかりません");
		}

		const queryResponse = await fetch(
			`https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({})
			}
		);

		const data = await queryResponse.json();

		if (!queryResponse.ok) {
			throw new Error(
				data.message || `Notion API error: ${queryResponse.status}`
			);
		}

		const tasks = data.results.map((page) => {
			const properties = page.properties || {};

			const titleProperty = properties.Name;
			const dateProperty = properties.Date;

			const title =
				titleProperty?.title?.[0]?.plain_text ??
				"タイトルなし";

			const date =
				dateProperty?.date?.start ??
				"日付なし";

			return {
				title,
				time: date
			};
		});

		res.json(tasks);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: error.message
		});
	}
});

app.get("/api/todos", async (req, res) => {
	try {
		const response = await fetch(
			`https://api.notion.com/v1/blocks/${process.env.NOTION_TODO_PAGE_ID}/children`,
			{
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03"
				}
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message || `Notion API error: ${response.status}`
			);
		}

		const todos = data.results
			.filter((block) => block.type === "to_do")
			.map((block) => ({
				id: block.id,
				title: block.to_do.rich_text
					.map((text) => text.plain_text)
					.join(""),
				checked: block.to_do.checked
			}));

		res.json(todos);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: error.message
		});
	}
});

app.get("/api/weather", async (req, res) => {
	try {
		const city = "Ichinomiya";

		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=ja`
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message || `OpenWeather API error: ${response.status}`
			);
		}

		res.json(data);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: error.message
		});
	}
});

app.post("/api/todo", async (req, res) => {
	console.log("POSTきた");
	console.log(req.body);

	try {
		const { title } = req.body;

		const response = await fetch(
			`https://api.notion.com/v1/blocks/${process.env.NOTION_TODO_PAGE_ID}/children`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					children: [
						{
							object: "block",
							type: "to_do",
							to_do: {
								rich_text: [
									{
										type: "text",
										text: {
											content: title
										}
									}
								],
								checked: false
							}
						}
					]
				})
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message);
		}

		res.json({ success: true });
	} catch (error) {
		res.status(500).json({
			error: error.message
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

// To run the server, use the command: node server.js

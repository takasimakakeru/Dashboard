import express from "express";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;

const upload = multer({
	storage: multer.memoryStorage()
});

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
				id: page.id,
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

app.post("/api/schedule", async (req, res) => {
	try {
		const { title, date } = req.body;

		const response = await fetch(
			"https://api.notion.com/v1/pages",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					parent: {
						database_id: process.env.NOTION_DATABASE_ID
					},
					properties: {
						Name: {
							title: [
								{
									text: {
										content: title
									}
								}
							]
						},
						Date: {
							date: {
								start: date
							}
						}
					}
				})
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message);
		}

		res.json({
			success: true
		});
	}
	catch (error) {
		res.status(500).json({
			error: error.message
		});
	}
});

app.get("/api/school-files", async (req, res) => {
	try {
		const databaseResponse = await fetch(
			`https://api.notion.com/v1/databases/${process.env.NOTION_SCHOOL_FILES_DATABASE_ID}`,
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

		console.log(JSON.stringify(data.results[0]?.properties, null, 2));

		const files = data.results.map((page) => {
			const properties = page.properties || {};

			const name =
				properties["名前"]?.title?.[0]?.plain_text ??
				"名前なし";

			const type =
				properties["種類"]?.select?.name ??
				"種類なし";

			const file =
				properties["ファイル"]?.files?.[0] ?? null;

			let fileUrl = null;

			if (file?.type === "file") {
				fileUrl = file.file.url;
			}

			if (file?.type === "external") {
				fileUrl = file.external.url;
			}

			const addedDate =
				properties["追加日"]?.date?.start ??
				"日付なし";

			return {
				id: page.id,
				name,
				type,
				fileUrl,
				addedDate
			};
		});

		res.json(files);
	} catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

app.delete("/api/school-files/:id", async (req, res) => {
	try {
		const response = await fetch(
			`https://api.notion.com/v1/pages/${req.params.id}`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					in_trash: true
				})
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message || `Notion API error: ${response.status}`
			);
		}

		res.json({
			success: true
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

app.delete("/api/schedule/:id", async (req, res) => {
	try {
		const response = await fetch(
			`https://api.notion.com/v1/pages/${req.params.id}`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					in_trash: true
				})
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message);
		}

		res.json({
			success: true
		});
	}
	catch (error) {
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
		const lat = 35.19;
		const lon = 136.90;

		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=ja`
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

app.get("/api/forecast", async (req, res) => {
	try {
		const response = await fetch(
			`https://api.openweathermap.org/data/2.5/forecast?lat=35.19&lon=136.90&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=ja`
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message || `OpenWeather API error: ${response.status}`
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

app.patch("/api/todo/:id", async (req, res) => {
	try {
		const { checked } = req.body;

		const response = await fetch(
			`https://api.notion.com/v1/blocks/${req.params.id}`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					to_do: {
						checked
					}
				})
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message);
		}

		res.json({ success: true });
	}
	catch (error) {
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

app.delete("/api/todo/:id", async (req, res) => {
	console.log("DELETEきた");
	console.log(req.params.id);

	const response = await fetch(
		`https://api.notion.com/v1/blocks/${req.params.id}`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
				"Notion-Version": "2025-09-03",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				archived: true
			})
		}
	);

	res.json({ success: true });
});

app.post("/api/school-files", upload.single("file"), async (req, res) => {
	try {
		if (!req.file) {
			throw new Error("ファイルが選択されていません");
		}

		const { name, type, addedDate } = req.body;

		if (!name || !type || !addedDate) {
			throw new Error("名前・種類・追加日が必要です");
		}

		// ① Notionにファイルアップロードを作成
		const createUploadResponse = await fetch(
			"https://api.notion.com/v1/file_uploads",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					mode: "single_part",
					filename: req.file.originalname,
					content_type: req.file.mimetype
				})
			}
		);

		const uploadData = await createUploadResponse.json();

		if (!createUploadResponse.ok) {
			throw new Error(
				uploadData.message ||
				`ファイルアップロード作成に失敗しました: ${createUploadResponse.status}`
			);
		}

		// ② ファイル本体をNotionへ送信
		const formData = new FormData();

		const blob = new Blob(
			[req.file.buffer],
			{
				type: req.file.mimetype
			}
		);

		formData.append(
			"file",
			blob,
			req.file.originalname
		);

		const sendUploadResponse = await fetch(
			`https://api.notion.com/v1/file_uploads/${uploadData.id}/send`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03"
				},
				body: formData
			}
		);

		const sendUploadData = await sendUploadResponse.json();

		if (!sendUploadResponse.ok) {
			throw new Error(
				sendUploadData.message ||
				`ファイル送信に失敗しました: ${sendUploadResponse.status}`
			);
		}

		// ③ NotionのデータソースIDを取得
		const databaseResponse = await fetch(
			`https://api.notion.com/v1/databases/${process.env.NOTION_SCHOOL_FILES_DATABASE_ID}`,
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
				database.message ||
				`データベース取得に失敗しました: ${databaseResponse.status}`
			);
		}

		const dataSourceId = database.data_sources?.[0]?.id;

		if (!dataSourceId) {
			throw new Error("Data Source IDが見つかりません");
		}

		// ④ Notionにページを作成
		const pageResponse = await fetch(
			"https://api.notion.com/v1/pages",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					parent: {
						data_source_id: dataSourceId
					},
					properties: {
						"名前": {
							title: [
								{
									text: {
										content: name
									}
								}
							]
						},
						"種類": {
							select: {
								name: type
							}
						},
						"追加日": {
							date: {
								start: addedDate
							}
						},
						"ファイル": {
							files: [
								{
									type: "file_upload",
									file_upload: {
										id: uploadData.id
									},
									name: req.file.originalname
								}
							]
						}
					}
				})
			}
		);

		const pageData = await pageResponse.json();

		if (!pageResponse.ok) {
			throw new Error(
				pageData.message ||
				`ページ作成に失敗しました: ${pageResponse.status}`
			);
		}

		res.json({
			success: true,
			id: pageData.id
		});

	} catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

app.patch("/api/school-files/:id", async (req, res) => {
	try {
		const { name, type, addedDate } = req.body;

		if (!name || !type || !addedDate) {
			throw new Error(
				"名前・種類・追加日が必要です"
			);
		}

		const response = await fetch(
			`https://api.notion.com/v1/pages/${req.params.id}`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
					"Notion-Version": "2025-09-03",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					properties: {
						"名前": {
							title: [
								{
									text: {
										content: name.trim()
									}
								}
							]
						},
						"種類": {
							select: {
								name: type
							}
						},
						"追加日": {
							date: {
								start: addedDate
							}
						}
					}
				})
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message ||
				`Notion API error: ${response.status}`
			);
		}

		res.json({
			success: true
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

// To run the server, use the command: node server.js

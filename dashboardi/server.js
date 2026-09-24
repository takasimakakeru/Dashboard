import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import ical from "node-ical";
import { google } from "googleapis";
import { Readable } from "stream";

dotenv.config();

const app = express();
const PORT = 3000;

const upload = multer({
	storage: multer.memoryStorage()
});

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
	refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({
	version: "v3",
	auth: oauth2Client
});

app.use(express.json());

app.get("/api/school-files", async (req, res) => {
	try {
		const result = await drive.files.list({
			q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
			fields: "files(id,name,mimeType,createdTime,webViewLink)"
		});

		const files = result.data.files.map(file => ({
			id: file.id,
			name: file.name,
			type: file.mimeType,
			fileUrl: file.webViewLink,
			addedDate: file.createdTime
		}));

		res.json(files);
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

app.get("/api/school-files/:id/content", async (req, res) => {
	try {
		const file = await drive.files.get({
			fileId: req.params.id,
			fields: "name,mimeType"
		});

		const response = await drive.files.get(
			{
				fileId: req.params.id,
				alt: "media"
			},
			{
				responseType: "stream"
			}
		);

		res.setHeader(
			"Content-Type",
			file.data.mimeType
		);

		response.data.pipe(res);
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

app.post("/api/school-files", upload.single("file"), async (req, res) => {
	try {
		if (!req.file) {
			throw new Error("ファイルがありません");
		}

		const stream = Readable.from(req.file.buffer);

		const result = await drive.files.create({
			requestBody: {
				name: req.body.name || req.file.originalname,
				parents: [
					process.env.GOOGLE_DRIVE_FOLDER_ID
				]
			},
			media: {
				mimeType: req.file.mimetype,
				body: stream
			},
			fields: "id,name"
		});

		// リンクを知っている全員が閲覧できるようにする
		await drive.permissions.create({
			fileId: result.data.id,
			requestBody: {
				type: "anyone",
				role: "reader"
			}
		});

		const permissions = await drive.permissions.list({
			fileId: result.data.id,
			fields: "permissions(id,type,role,emailAddress)"
		});

		console.log(permissions.data.permissions);

		res.json({
			success: true,
			id: result.data.id
		});
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

app.delete("/api/school-files/:id", async (req, res) => {
	try {
		await drive.files.delete({
			fileId: req.params.id
		});

		res.json({
			success: true
		});
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

app.patch("/api/school-files/:id", async (req, res) => {
	try {
		const { name } = req.body;

		await drive.files.update({
			fileId: req.params.id,
			requestBody: {
				name
			}
		});

		res.json({
			success: true
		});
	}
	catch (error) {
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

		const newTodo = data.results[0];

		res.json({
			success: true,
			todo: {
				id: newTodo.id,
				title,
				checked: false
			}
		});
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

app.listen(PORT, () => {
	console.log(
		`Server running on http://localhost:${PORT}`
	);
});

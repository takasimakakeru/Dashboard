import express from "express";
import multer from "multer";
import { google } from "googleapis";
import { Readable } from "stream";

const router = express.Router();

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

router.get("/school-files", async (req, res) => {
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

router.get("/school-files/:id/content", async (req, res) => {
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

router.post(
	"/school-files",
	upload.single("file"),
	async (req, res) => {
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

			await drive.permissions.create({
				fileId: result.data.id,
				requestBody: {
					type: "anyone",
					role: "reader"
				}
			});

			const permissions =
				await drive.permissions.list({
					fileId: result.data.id,
					fields:
						"permissions(id,type,role,emailAddress)"
				});

			console.log(
				permissions.data.permissions
			);

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
	}
);

router.delete("/school-files/:id", async (req, res) => {
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

router.patch("/school-files/:id", async (req, res) => {
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

export default router;
import express from "express";
import { google } from "googleapis";

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
	refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({
	version: "v3",
	auth: oauth2Client
});

const calendarId =
	process.env.GOOGLE_CALENDAR_ID || "primary";

// GET
router.get("/schedule", async (req, res) => {
	try {
		const response = await calendar.events.list({
			calendarId,
			singleEvents: true,
			orderBy: "startTime",
			timeMin: new Date().toISOString()
		});

		const events = response.data.items.map((event) => ({
			id: event.id,
			title: event.summary || "無題",
			time:
				event.start?.dateTime ||
				event.start?.date ||
				null
		}));

		res.json(events);
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

// POST
router.post("/schedule", async (req, res) => {
	console.log("POST", req.body);

	try {
		const { title, date } = req.body;

		if (!title || !date) {
			return res.status(400).json({
				error: "title, date は必須です"
			});
		}

		const [year, month, day] = date.split("-").map(Number);

		const nextDay = new Date(
			year,
			month - 1,
			day + 1
		);

		const endDate =
			`${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`;

		const response = await calendar.events.insert({
			calendarId,
			requestBody: {
				summary: title,
				start: {
					date: date
				},
				end: {
					date: endDate
				}
			}
		});

		res.json({
			id: response.data.id,
			title: response.data.summary,
			time: response.data.start?.date || null
		});
	}
	catch (error) {
		console.error(error);

		if (error.response?.data) {
			console.error(error.response.data);
		}

		res.status(500).json({
			error: error.message
		});
	}
});

// PATCH
router.patch("/schedule/:id", async (req, res) => {
	try {
		const {
			title,
			start,
			end
		} = req.body;

		const response = await calendar.events.patch({
			calendarId,
			eventId: req.params.id,
			requestBody: {
				summary: title,
				start: start
					? {
						dateTime: start,
						timeZone: "Asia/Tokyo"
					}
					: undefined,
				end: end
					? {
						dateTime: end,
						timeZone: "Asia/Tokyo"
					}
					: undefined
			}
		});

		res.json({
			id: response.data.id,
			title: response.data.summary,
			start:
				response.data.start?.dateTime ||
				response.data.start?.date ||
				null,
			end:
				response.data.end?.dateTime ||
				response.data.end?.date ||
				null
		});
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

// DELETE
router.delete("/schedule/:id", async (req, res) => {
	try {
		await calendar.events.delete({
			calendarId,
			eventId: req.params.id
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

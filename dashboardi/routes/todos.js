import express from "express";

const router = express.Router();

router.get("/api/todos", async (req, res) => {
	try {
		const response = await fetch(
			`https://api.trello.com/1/lists/${process.env.TRELLO_LIST_ID}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message || "Trello API error"
			);
		}

		const todos = data.map((card) => ({
			id: card.id,
			title: card.name,
			checked: card.closed
		}));

		res.json(todos);
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

router.post("/api/todo", async (req, res) => {
	try {
		const { title } = req.body;

		if (!title?.trim()) {
			return res.status(400).json({
				error: "タイトルがありません"
			});
		}

		const response = await fetch(
			`https://api.trello.com/1/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					name: title.trim(),
					idList: process.env.TRELLO_LIST_ID
				})
			}
		);

		const data = await response.json();

		console.log("Trello POST:", response.status, data);

		if (!response.ok) {
			throw new Error(
				data.message || "Trello API error"
			);
		}

		res.json({
			id: data.id,
			title: data.name,
			checked: data.closed
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

router.patch("/api/todo/:id", async (req, res) => {
	try {
		const { checked } = req.body;

		if (typeof checked !== "boolean") {
			return res.status(400).json({
				error: "checkedはbooleanで指定してください"
			});
		}

		const response = await fetch(
			`https://api.trello.com/1/cards/${req.params.id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					closed: checked,
					key: process.env.TRELLO_API_KEY,
					token: process.env.TRELLO_TOKEN
				})
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				data.message || "Trello API error"
			);
		}

		res.json({
			id: data.id,
			title: data.name,
			checked: data.closed
		});
	}
	catch (error) {
		console.error(error);

		res.status(500).json({
			error: error.message
		});
	}
});

router.delete("/api/todo/:id", async (req, res) => {
	try {
		const response = await fetch(
			`https://api.trello.com/1/cards/${req.params.id}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_TOKEN}`,
			{
				method: "DELETE"
			}
		);

		if (!response.ok) {
			const data = await response.json();

			throw new Error(
				data.message || "Trello API error"
			);
		}

		res.json({
			success: true,
			id: req.params.id
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
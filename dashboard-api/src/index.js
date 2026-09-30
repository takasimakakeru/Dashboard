export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		try {
			// GET /api/todos
			if (
				request.method === "GET" &&
				url.pathname === "/api/todos"
			) {
				const response = await fetch(
					`https://api.trello.com/1/lists/${env.TRELLO_LIST_ID}/cards?key=${env.TRELLO_API_KEY}&token=${env.TRELLO_TOKEN}`
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

				return Response.json(todos);
			}

			// POST /api/todo
			if (
				request.method === "POST" &&
				url.pathname === "/api/todo"
			) {
				const { title } = await request.json();

				if (!title?.trim()) {
					return Response.json(
						{ error: "タイトルがありません" },
						{ status: 400 }
					);
				}

				const response = await fetch(
					`https://api.trello.com/1/cards?key=${env.TRELLO_API_KEY}&token=${env.TRELLO_TOKEN}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							name: title.trim(),
							idList: env.TRELLO_LIST_ID
						})
					}
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Trello API error"
					);
				}

				return Response.json({
					id: data.id,
					title: data.name,
					checked: data.closed
				});
			}

			// PATCH /api/todo/:id
			if (
				request.method === "PATCH" &&
				url.pathname.startsWith("/api/todo/")
			) {
				const id = url.pathname.split("/").pop();
				const { checked } = await request.json();

				if (typeof checked !== "boolean") {
					return Response.json(
						{
							error:
								"checkedはbooleanで指定してください"
						},
						{ status: 400 }
					);
				}

				const response = await fetch(
					`https://api.trello.com/1/cards/${id}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							closed: checked,
							key: env.TRELLO_API_KEY,
							token: env.TRELLO_TOKEN
						})
					}
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.message || "Trello API error"
					);
				}

				return Response.json({
					id: data.id,
					title: data.name,
					checked: data.closed
				});
			}

			// DELETE /api/todo/:id
			if (
				request.method === "DELETE" &&
				url.pathname.startsWith("/api/todo/")
			) {
				const id = url.pathname.split("/").pop();

				const response = await fetch(
					`https://api.trello.com/1/cards/${id}?key=${env.TRELLO_API_KEY}&token=${env.TRELLO_TOKEN}`,
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

				return Response.json({
					success: true,
					id
				});
			}

			return new Response("Not Found", {
				status: 404
			});
		}
		catch (error) {
			console.error(error);

			return Response.json(
				{ error: error.message },
				{ status: 500 }
			);
		}
	}
};
export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)

		if (url.pathname === "/api/test") {
			return Response.json({
				message: "Worker is alive"
			})
		}

		return new Response("Not Found", {
			status: 404
		})
	},
}

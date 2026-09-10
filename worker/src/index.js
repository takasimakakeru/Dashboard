export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === "/api/test") {
      return Response.json({
        message: "Worker is alive"
      })
    }

    if (url.pathname === "/api/weather") {
      try {
        const lat = 35.19
        const lon = 136.90

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${env.OPENWEATHER_API_KEY}&units=metric&lang=ja`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message ||
            `OpenWeather API error: ${response.status}`
          )
        }

        return Response.json(data)
      } catch (error) {
        console.error(error)

        return Response.json(
          {
            error: error.message
          },
          {
            status: 500
          }
        )
      }
    }

    return new Response("Not Found", {
      status: 404
    })
  }
}
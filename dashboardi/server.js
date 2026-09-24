import express from "express";
import dotenv from "dotenv";

import todoRoutes from "./routes/todos.js";
import weatherRoutes from "./routes/weather.js";
import schoolFilesRoutes from "./routes/school-files.js";
import scheduleRoutes from "./routes/schedule.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/api", todoRoutes);
app.use("/api", weatherRoutes);
app.use("/api", schoolFilesRoutes);
app.use("/api", scheduleRoutes);

app.use("/api", scheduleRoutes);

app.listen(PORT, () => {
	console.log(
		`Server running on http://localhost:${PORT}`
	);
});
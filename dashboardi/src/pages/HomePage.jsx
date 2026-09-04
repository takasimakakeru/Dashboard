import WeatherCard from "../components/WeatherCard/WeatherCard";
import ClockCard from "../components/ClockCard/ClockCard";
import ScheduleCard from "../components/ScheduleCard/ScheduleCard";
import TodoCard from "../components/TodoCard/TodoCard";

export default function HomePage() {
	return (
		<div style={{ padding: "20px" }}>
			<ClockCard />
			<WeatherCard />
			<div className="sandt">
			<ScheduleCard />
			<TodoCard />
			</div>
		</div>
	);
}

import WeatherCard from "../components/WeatherCard/WeatherCard";
import ClockCard from "../components/ClockCard/ClockCard";
import ScheduleCard from "../components/ScheduleCard/ScheduleCard";

export default function HomePage() {
	return (
		<div style={{ padding: "20px" }}>
			<WeatherCard />
			<ClockCard />
			<ScheduleCard />
		</div>
	);
}
